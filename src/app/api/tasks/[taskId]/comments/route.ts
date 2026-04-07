import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionOrThrow } from "@/lib/session";
import { ensureWorkspaceRole } from "@/lib/workspace";
import { ROLES } from "@/lib/constants";

const schema = z.object({
  workspaceId: z.string().min(1),
  body: z.string().min(1)
});

export async function GET(
  request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }
    await ensureWorkspaceRole(session.user.id, workspaceId, [ROLES.ADMIN, ROLES.MEMBER]);
    const { taskId } = await context.params;

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { author: { select: { name: true, id: true } } },
      orderBy: { createdAt: "asc" }
    });
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    const { taskId } = await context.params;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    await ensureWorkspaceRole(session.user.id, parsed.data.workspaceId, [ROLES.ADMIN, ROLES.MEMBER]);
    const comment = await prisma.comment.create({
      data: {
        taskId,
        authorId: session.user.id,
        body: parsed.data.body
      },
      include: { author: { select: { id: true, name: true } } }
    });
    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
