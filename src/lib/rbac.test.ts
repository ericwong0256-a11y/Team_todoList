import { describe, expect, it } from "vitest";
import { ensureRole } from "@/lib/rbac";

describe("ensureRole", () => {
  it("allows role when permitted", () => {
    expect(() => ensureRole("ADMIN", ["ADMIN"])).not.toThrow();
  });

  it("throws role when not permitted", () => {
    expect(() => ensureRole("MEMBER", ["ADMIN"])).toThrow("Insufficient permissions");
  });
});
