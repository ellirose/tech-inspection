// Roles and what each may do (design document §14.1). The server checks these on every admin page,
// server action and route handler; the navigation only uses them to hide what a role cannot open.
export const roles = ["super_admin", "editor", "sales"] as const;
export type Role = (typeof roles)[number];

export const roleLabels: Record<Role, string> = {
  super_admin: "Superadministrador",
  editor: "Editor",
  sales: "Comercial",
};

const grants = {
  "leads:read": ["super_admin", "sales"],
  "leads:write": ["super_admin", "sales"],
  "content:read": ["super_admin", "editor", "sales"],
  "content:write": ["super_admin", "editor"],
  "content:delete": ["super_admin"],
  "media:write": ["super_admin", "editor"],
  "users:manage": ["super_admin"],
  "settings:manage": ["super_admin"],
  "audit:read": ["super_admin"],
} satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof grants;

export const isRole = (value: unknown): value is Role => (roles as readonly unknown[]).includes(value);

export const can = (role: string | null | undefined, permission: Permission) => isRole(role) && (grants[permission] as readonly Role[]).includes(role);

/** Super-admins must use a second factor (design document §14.4); the panel holds them on the security page until they do. */
export const requiresTwoFactor = (role: string | null | undefined) => role === "super_admin";
