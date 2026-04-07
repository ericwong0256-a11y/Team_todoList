import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ROLES, TASK_STATUS } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  workspaceName: z.string().min(2).optional()
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, password, workspaceName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
  }

  const passwordHash = await hash(password, 10);
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash }
    });

    if (!workspaceName) {
      return { userId: user.id, workspaceId: null };
    }

    const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const workspace = await tx.workspace.create({
      data: {
        name: workspaceName,
        slug,
        visibility: "PUBLIC",
        isSandbox: false
      }
    });

    await tx.membership.create({
      data: {
        role: ROLES.ADMIN,
        userId: user.id,
        workspaceId: workspace.id
      }
    });

    await tx.boardColumn.createMany({
      data: [
        { title: "To Do", status: TASK_STATUS.TODO, position: 0, workspaceId: workspace.id },
        {
          title: "In Progress",
          status: TASK_STATUS.IN_PROGRESS,
          position: 1,
          workspaceId: workspace.id
        },
        { title: "Review", status: TASK_STATUS.REVIEW, position: 2, workspaceId: workspace.id },
        { title: "Done", status: TASK_STATUS.DONE, position: 3, workspaceId: workspace.id }
      ]
    });

    return { userId: user.id, workspaceId: workspace.id };
  });

  return NextResponse.json(result, { status: 201 });
}
