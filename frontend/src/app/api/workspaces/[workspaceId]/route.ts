import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionOrThrow } from "@/lib/session";
import { ensureWorkspaceRole } from "@/lib/workspace";
import { ROLES } from "@/lib/constants";
import { generateInviteCode } from "@/lib/invite";

const patchSchema = z.object({
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  regenerateInvite: z.boolean().optional()
});

async function uniqueInviteCode(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = generateInviteCode(10);
    const clash = await prisma.workspace.findUnique({ where: { inviteCode: code } });
    if (!clash) return code;
  }
  return `${generateInviteCode(8)}${Date.now().toString(36).toUpperCase()}`;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await getSessionOrThrow();
    const { workspaceId } = await context.params;
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await ensureWorkspaceRole(session.user.id, workspaceId, [ROLES.ADMIN]);

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let visibility = workspace.visibility;
    let inviteCode = workspace.inviteCode;

    if (parsed.data.visibility !== undefined) {
      visibility = parsed.data.visibility;
      if (visibility === "PUBLIC") {
        inviteCode = null;
      } else if (visibility === "PRIVATE" && !inviteCode) {
        inviteCode = await uniqueInviteCode();
      }
    }

    if (parsed.data.regenerateInvite && visibility === "PRIVATE") {
      inviteCode = await uniqueInviteCode();
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { visibility, inviteCode }
    });

    return NextResponse.json({
      workspaceId: updated.id,
      visibility: updated.visibility,
      inviteCode: updated.inviteCode
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
