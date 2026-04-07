import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/constants";

export async function getMembership(userId: string, workspaceId: string) {
  return prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  });
}

export async function ensureWorkspaceRole(
  userId: string,
  workspaceId: string,
  allowedRoles: Role[]
) {
  const membership = await getMembership(userId, workspaceId);
  if (!membership || !allowedRoles.includes(membership.role as Role)) {
    throw new Error("Forbidden");
  }
  return membership;
}
