import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionOrThrow } from "@/lib/session";

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
        slug: m.workspace.slug
      }))
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
