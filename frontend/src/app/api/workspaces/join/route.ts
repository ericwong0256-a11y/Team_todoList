import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionOrThrow } from "@/lib/session";
import { ROLES } from "@/lib/constants";

const joinSchema = z.object({
  workspaceId: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const session = await getSessionOrThrow();
    const parsed = joinSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: parsed.data.workspaceId }
    });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (workspace.visibility === "PRIVATE") {
      return NextResponse.json(
        { error: "This team is private. Join with an invite code instead." },
        { status: 403 }
      );
    }

    const membership = await prisma.membership.upsert({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: parsed.data.workspaceId
        }
      },
      update: {},
      create: {
        userId: session.user.id,
        workspaceId: parsed.data.workspaceId,
        role: ROLES.MEMBER
      }
    });

    return NextResponse.json(
      {
        workspaceId: membership.workspaceId,
        role: membership.role,
        name: workspace.name,
        slug: workspace.slug
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
