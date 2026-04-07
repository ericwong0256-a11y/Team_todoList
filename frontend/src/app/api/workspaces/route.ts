import { NextResponse } from "next/server";
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
  name: z.string().min(2),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC")
});

async function uniqueInviteCode(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = generateInviteCode(10);
    const clash = await prisma.workspace.findUnique({ where: { inviteCode: code } });
    if (!clash) return code;
  }
  return `${generateInviteCode(8)}${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(req: Request) {
  try {
    const session = await getSessionOrThrow();
    const parsed = createWorkspaceSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const baseSlug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    let slug = baseSlug || "team";
    let suffix = 1;
    while (await prisma.workspace.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const inviteCode = parsed.data.visibility === "PRIVATE" ? await uniqueInviteCode() : null;

    const workspace = await prisma.workspace.create({
      data: {
        name: parsed.data.name,
        slug,
        visibility: parsed.data.visibility,
        inviteCode
      }
    });

    await prisma.membership.create({
      data: {
        userId: session.user.id,
        workspaceId: workspace.id,
        role: ROLES.ADMIN
      }
    });

    await prisma.boardColumn.createMany({
      data: [
        { title: "To Do", status: TASK_STATUS.TODO, position: 0, workspaceId: workspace.id },
        { title: "In Progress", status: TASK_STATUS.IN_PROGRESS, position: 1, workspaceId: workspace.id },
        { title: "Review", status: TASK_STATUS.REVIEW, position: 2, workspaceId: workspace.id },
        { title: "Done", status: TASK_STATUS.DONE, position: 3, workspaceId: workspace.id }
      ]
    });

    return NextResponse.json(
      {
        workspaceId: workspace.id,
        role: ROLES.ADMIN,
        name: workspace.name,
        slug: workspace.slug,
        visibility: workspace.visibility,
        isSandbox: workspace.isSandbox,
        inviteCode: workspace.inviteCode
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
