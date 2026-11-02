import { describe, expect, it } from "vitest";
import { can, requiresTwoFactor, type Permission } from "@/lib/auth/roles";

// Design document §14.1, row by row.
const matrix: Record<Permission, [superAdmin: boolean, editor: boolean, sales: boolean]> = {
  "leads:read": [true, false, true],
  "leads:write": [true, false, true],
  "content:read": [true, true, true],
  "content:write": [true, true, false],
  "content:delete": [true, false, false],
  "media:write": [true, true, false],
  "users:manage": [true, false, false],
  "settings:manage": [true, false, false],
  "audit:read": [true, false, false],
};

describe("role permissions", () => {
  for (const [permission, [superAdmin, editor, sales]] of Object.entries(matrix) as [Permission, boolean[]][]) {
    it(permission, () => {
      expect([can("super_admin", permission), can("editor", permission), can("sales", permission)]).toEqual([superAdmin, editor, sales]);
    });
  }

  it("grants nothing to unknown or missing roles", () => {
    for (const permission of Object.keys(matrix) as Permission[]) {
      expect(can("admin", permission)).toBe(false);
      expect(can(undefined, permission)).toBe(false);
    }
  });

  it("requires a second factor for super-admins only", () => {
    expect([requiresTwoFactor("super_admin"), requiresTwoFactor("editor"), requiresTwoFactor("sales")]).toEqual([true, false, false]);
  });
});
