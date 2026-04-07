import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionOrThrow } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSessionOrThrow();

    const memberships = await prisma.membership.findMany({
      where: { userId: session.user.id },
      select: { workspaceId: true }
    });
    const joinedIds = memberships.map((m) => m.workspaceId);

    const workspaces = await prisma.workspace.findMany({
      where: {
        visibility: "PUBLIC",
        isSandbox: false,
        ...(joinedIds.length ? { id: { notIn: joinedIds } } : {})
      },
      include: {
        _count: { select: { memberships: true } }
      },
      orderBy: { createdAt: "asc" },
      take: 20
    });

    return NextResponse.json(
      workspaces.map((w) => ({
        workspaceId: w.id,
        name: w.name,
        slug: w.slug,
        members: w._count.memberships,
        visibility: "PUBLIC" as const
      }))
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
