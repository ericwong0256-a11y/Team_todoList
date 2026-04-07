import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionOrThrow } from "@/lib/session";
import { ensureWorkspaceRole } from "@/lib/workspace";
import { ROLES, TASK_STATUS } from "@/lib/constants";

const createTaskSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.REVIEW, TASK_STATUS.DONE]).default(TASK_STATUS.TODO),
  dueDate: z.string().datetime().optional(),
  priority: z.number().int().min(1).max(5).default(3)
});

export async function GET(request: Request) {
  try {
    const session = await getSessionOrThrow();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    await ensureWorkspaceRole(session.user.id, workspaceId, [ROLES.ADMIN, ROLES.MEMBER]);

    const tasks = await prisma.task.findMany({
      where: { workspaceId },
      orderBy: [{ status: "asc" }, { position: "asc" }, { updatedAt: "desc" }],
      include: {
        assignee: { select: { id: true, name: true } },
        comments: { select: { id: true } }
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    const status = error instanceof Error && error.message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: "Unauthorized" }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionOrThrow();
    const parsed = createTaskSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    await ensureWorkspaceRole(session.user.id, data.workspaceId, [ROLES.ADMIN, ROLES.MEMBER]);

    const maxPosition = await prisma.task.aggregate({
      where: { workspaceId: data.workspaceId, status: data.status },
      _max: { position: true }
    });

    const task = await prisma.task.create({
      data: {
        workspaceId: data.workspaceId,
        createdById: session.user.id,
        title: data.title,
        description: data.description,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        priority: data.priority,
        position: (maxPosition._max.position ?? -1) + 1
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: "Unauthorized" }, { status });
  }
}
