/**
 * Sidebar & admin shell navigation — paths must align with `AdminRoutes.tsx`.
 */
export const ROUTE_PATHS = {
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_FORBIDDEN: '/admin/forbidden',
  ADMIN_ROLES: '/admin/roles',
  /** Create role (requires `auth.admin.role.create`). */
  ADMIN_ROLE_CREATE: '/admin/roles/new',
  /** Edit role page base path (requires `auth.admin.role.update`). */
  ADMIN_ROLE_EDIT_BASE: '/admin/roles',
  /** View role page base path (requires `auth.admin.role.read`). */
  ADMIN_ROLE_VIEW_BASE: '/admin/roles',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SELLERS: '/admin/sellers',
  ADMIN_SELLER_CREATE: '/admin/sellers/new',
  ADMIN_SELLER_EDIT_BASE: '/admin/sellers',
  ADMIN_SELLER_VIEW_BASE: '/admin/sellers',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
  ADMIN_SECURITY: '/admin/security',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

export function adminRoleEditPath(roleId: string): string {
  return `${ROUTE_PATHS.ADMIN_ROLE_EDIT_BASE}/${roleId}/edit`;
}

export function adminRoleViewPath(roleId: string): string {
  return `${ROUTE_PATHS.ADMIN_ROLE_VIEW_BASE}/${roleId}/view`;
}

export function adminSellerEditPath(sellerId: string): string {
  return `${ROUTE_PATHS.ADMIN_SELLER_EDIT_BASE}/${sellerId}/edit`;
}

export function adminSellerViewPath(sellerId: string): string {
  return `${ROUTE_PATHS.ADMIN_SELLER_VIEW_BASE}/${sellerId}/view`;
}
