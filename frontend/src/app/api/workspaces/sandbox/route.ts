import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionOrThrow } from "@/lib/session";
import { ROLES, TASK_STATUS } from "@/lib/constants";

export async function POST() {
  try {
    const session = await getSessionOrThrow();

    const existing = await prisma.membership.findFirst({
      where: { userId: session.user.id, workspace: { isSandbox: true } }
    });
    if (existing) {
      const ws = await prisma.workspace.findUnique({ where: { id: existing.workspaceId } });
      return NextResponse.json(
        {
          workspaceId: existing.workspaceId,
          role: existing.role,
          name: ws?.name ?? "Personal sandbox",
          slug: ws?.slug ?? "",
          visibility: "PRIVATE",
          isSandbox: true
        },
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const baseName = user?.name?.split(" ")[0] ?? "Personal";
    const name = `${baseName}'s sandbox`;
    let slug = `sandbox-${session.user.id.slice(0, 8)}`.toLowerCase();
    let n = 1;
    while (await prisma.workspace.findUnique({ where: { slug } })) {
      slug = `sandbox-${session.user.id.slice(0, 6)}-${n++}`;
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        visibility: "PRIVATE",
        isSandbox: true,
        inviteCode: null
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
        isSandbox: true
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
