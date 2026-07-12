/**
 * Sidebar & admin shell navigation — paths must align with `AdminRoutes.tsx`.
 */
export const ROUTE_PATHS = {
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_FORBIDDEN: '/admin/forbidden',
  
  // Poultry ERP Routes
  ADMIN_BATCHES: '/admin/batches',
  ADMIN_DAILY_VISITS: '/admin/daily-visits',
  ADMIN_FEED: '/admin/feed',
  ADMIN_MEDICINES: '/admin/medicines',
  
  // Master Data
  ADMIN_FARMS: '/admin/farms',
  ADMIN_FARMERS: '/admin/farmers',
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_AREAS: '/admin/areas',

  // Accounts
  ADMIN_ACCOUNTING: '/admin/accounting',
  ADMIN_PURCHASES: '/admin/purchases',
  ADMIN_SALES: '/admin/sales',
  ADMIN_EXPENSES: '/admin/expenses',
  ADMIN_PNL: '/admin/pnl',

  // RBAC & System
  ADMIN_ACCOUNTS: '/admin/accounts',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_ROLE_CREATE: '/admin/roles/new',
  ADMIN_ROLE_EDIT_BASE: '/admin/roles',
  ADMIN_ROLE_VIEW_BASE: '/admin/roles',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

export function adminRoleEditPath(roleId: string): string {
  return `${ROUTE_PATHS.ADMIN_ROLE_EDIT_BASE}/${roleId}/edit`;
}

export function adminRoleViewPath(roleId: string): string {
  return `${ROUTE_PATHS.ADMIN_ROLE_VIEW_BASE}/${roleId}/view`;
}
