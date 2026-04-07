import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionOrThrow } from "@/lib/session";
import { z } from "zod";
import { ROLES, TASK_STATUS } from "@/lib/constants";
import { generateInviteCode } from "@/lib/invite";

export async function GET() {
  try {
    const session = await getSessionOrThrow();
    const memberships = await prisma.membership.findMany({
      where: { userId: session.user.id },
      include: { workspace: true },
      orderBy: { createdAt: "asc" }
    });
    return NextResponse.json(
      memberships.map((m) => ({
        workspaceId: m.workspaceId,
        role: m.role,
        name: m.workspace.name,
        slug: m.workspace.slug,
        visibility: m.workspace.visibility as "PUBLIC" | "PRIVATE",
        isSandbox: m.workspace.isSandbox,
        inviteCode:
          m.role === ROLES.ADMIN && m.workspace.visibility === "PRIVATE"
            ? m.workspace.inviteCode
            : undefined
      }))
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2, "Team name must be at least 2 characters"),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC")
});

export async function POST(req: Request) {
  let session;
  try {
    session = await getSessionOrThrow();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = String(session.user.id ?? "").trim();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRow = await prisma.user.findUnique({ where: { id: userId } });
  if (!userRow) {
    return NextResponse.json({ error: "User not found. Please sign in again." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createWorkspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const baseSlug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      let slug = baseSlug || "team";
      let suffix = 1;
      while (await tx.workspace.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${suffix++}`;
      }

      const inviteCode =
        parsed.data.visibility === "PRIVATE" ? await uniqueInviteCodeWithTx(tx) : null;

      /**
       * Create with only `name` + `slug` so it works even when @prisma/client is stale
       * (e.g. generated before `visibility` / `inviteCode` existed). DB defaults fill other columns;
       * we then set visibility + inviteCode via raw SQL.
       */
      const workspace = await tx.workspace.create({
        data: {
          name: parsed.data.name,
          slug
        }
      });

      if (inviteCode === null) {
        await tx.$executeRaw`
          UPDATE Workspace SET visibility = ${parsed.data.visibility}, inviteCode = NULL WHERE id = ${workspace.id}
        `;
      } else {
        await tx.$executeRaw`
          UPDATE Workspace SET visibility = ${parsed.data.visibility}, inviteCode = ${inviteCode} WHERE id = ${workspace.id}
        `;
      }

      await tx.membership.create({
        data: {
          userId,
          workspaceId: workspace.id,
          role: ROLES.ADMIN
        }
      });

      await tx.boardColumn.createMany({
        data: [
          { title: "To Do", status: TASK_STATUS.TODO, position: 0, workspaceId: workspace.id },
          { title: "In Progress", status: TASK_STATUS.IN_PROGRESS, position: 1, workspaceId: workspace.id },
          { title: "Review", status: TASK_STATUS.REVIEW, position: 2, workspaceId: workspace.id },
          { title: "Done", status: TASK_STATUS.DONE, position: 3, workspaceId: workspace.id }
        ]
      });

      const rows = await tx.$queryRaw<
        {
          id: string;
          name: string;
          slug: string;
          visibility: string;
          isSandbox: boolean;
          inviteCode: string | null;
        }[]
      >`
        SELECT id, name, slug, visibility, isSandbox, inviteCode FROM Workspace WHERE id = ${workspace.id}
      `;
      const row = rows[0];
      if (!row) {
        throw new Error("Workspace row missing after create");
      }
      return row;
    });

    return NextResponse.json(
      {
        workspaceId: result.id,
        role: ROLES.ADMIN,
        name: result.name,
        slug: result.slug,
        visibility: result.visibility,
        isSandbox: result.isSandbox,
        inviteCode: result.inviteCode
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/workspaces failed", e);
    const message = e instanceof Error ? e.message : String(e);
    const dev = process.env.NODE_ENV === "development";
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          error: "Could not create workspace (database error).",
          ...(dev ? { details: `${e.code}: ${message}` } : {})
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create workspace", ...(dev ? { details: message } : {}) },
      { status: 500 }
    );
  }
}

async function uniqueInviteCodeWithTx(tx: Prisma.TransactionClient): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = generateInviteCode(10);
    const rows = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM Workspace WHERE inviteCode = ${code}
    `;
    if (rows.length === 0) return code;
  }
  return `${generateInviteCode(8)}${Date.now().toString(36).toUpperCase()}`;
}
