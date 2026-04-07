import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionOrThrow } from "@/lib/session";
import { ROLES } from "@/lib/constants";

const schema = z.object({
  inviteCode: z.string().min(4).max(32)
});

export async function POST(req: Request) {
  try {
    const session = await getSessionOrThrow();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const normalized = parsed.data.inviteCode.trim().toUpperCase();

    const workspace = await prisma.workspace.findUnique({
      where: { inviteCode: normalized }
    });
    if (!workspace) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    const membership = await prisma.membership.upsert({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: workspace.id
        }
      },
      update: {},
      create: {
        userId: session.user.id,
        workspaceId: workspace.id,
        role: ROLES.MEMBER
      }
    });

    return NextResponse.json(
      {
        workspaceId: membership.workspaceId,
        role: membership.role,
        name: workspace.name,
        slug: workspace.slug,
        visibility: workspace.visibility,
        isSandbox: workspace.isSandbox
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
