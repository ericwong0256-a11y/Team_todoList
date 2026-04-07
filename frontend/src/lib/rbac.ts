import type { Role } from "@/lib/constants";

export function ensureRole(role: Role, allowed: Role[]) {
  if (!allowed.includes(role)) {
    throw new Error("Insufficient permissions");
  }
}
