import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionOrThrow } from "@/lib/session";
import { ensureWorkspaceRole } from "@/lib/workspace";
import { ROLES, TASK_STATUS } from "@/lib/constants";

const updateSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.REVIEW, TASK_STATUS.DONE]).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  position: z.number().int().optional()
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    const { taskId } = await context.params;
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;
    await ensureWorkspaceRole(session.user.id, data.workspaceId, [ROLES.ADMIN, ROLES.MEMBER]);

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate === null ? null : undefined,
        priority: data.priority,
        position: data.position
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    const status = error instanceof Error && error.message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: "Unauthorized" }, { status });
  }
}
