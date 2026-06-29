/**
 * Canonical permission strings for company admin RBAC (dot-separated keys).
 * Store these (or "*" for full access) in AdminRole.permissions JSON — see normalizePermissionSet in adminAuth.helper.ts.
 */
export const PERMISSIONS = {
  ADMIN: {
    USER: {
      CREATE: "auth.admin.user.create",
      READ: "auth.admin.user.read",
      UPDATE: "auth.admin.user.update",
      DELETE: "auth.admin.user.delete",
    },
    ROLE: {
      CREATE: "auth.admin.role.create",
      READ: "auth.admin.role.read",
      UPDATE: "auth.admin.role.update",
      DELETE: "auth.admin.role.delete",
    },
    SELLER: {
      CREATE: "auth.admin.seller.create",
      READ: "auth.admin.seller.read",
      UPDATE: "auth.admin.seller.update",
      DELETE: "auth.admin.seller.delete",
    },
  },
} as const;
