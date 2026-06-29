/**
 * Sidebar navigation manifest (labels, routes, RBAC gates, placeholders).
 */
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  BarChart3,
  UserCog,
  Store,
  Package,
  ShoppingCart,
  Users,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { ROUTE_PATHS } from '../../config/routes';
import { PERMISSIONS } from '../../constants/permissions';

export type AdminNavItem = {
  id: string;
  label: string;
  to: string;
  Icon: LucideIcon;
  permission?: string;
  comingSoon?: boolean;
};

export type AdminNavGroup = {
  id: string;
  title: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: readonly AdminNavGroup[] = [
  {
    id: 'main',
    title: 'Main Menu',
    items: [
      { id: 'dashboard', label: 'Dashboard', to: ROUTE_PATHS.ADMIN_DASHBOARD, Icon: LayoutDashboard },
      {
        id: 'analytics',
        label: 'Analytics',
        to: ROUTE_PATHS.ADMIN_ANALYTICS,
        Icon: BarChart3,
        comingSoon: true,
      },
    ],
  },
  {
    id: 'management',
    title: 'Marketplace',
    items: [
      {
        id: 'roles',
        label: 'Roles & permissions',
        to: ROUTE_PATHS.ADMIN_ROLES,
        Icon: UserCog,
        permission: PERMISSIONS.ADMIN.ROLE.READ,
      },
      { id: 'sellers', label: 'Sellers', to: ROUTE_PATHS.ADMIN_SELLERS, Icon: Store },
      {
        id: 'products',
        label: 'Products',
        to: ROUTE_PATHS.ADMIN_PRODUCTS,
        Icon: Package,
        comingSoon: true,
      },
      {
        id: 'orders',
        label: 'Orders',
        to: ROUTE_PATHS.ADMIN_ORDERS,
        Icon: ShoppingCart,
        comingSoon: true,
      },
      { id: 'users', label: 'Admins', to: ROUTE_PATHS.ADMIN_USERS, Icon: Users, comingSoon: true },
    ],
  },
  {
    id: 'system',
    title: 'System',
    items: [
      {
        id: 'security',
        label: 'Security',
        to: ROUTE_PATHS.ADMIN_SECURITY,
        Icon: ShieldCheck,
        comingSoon: true,
      },
      {
        id: 'settings',
        label: 'Settings',
        to: ROUTE_PATHS.ADMIN_SETTINGS,
        Icon: Settings,
        comingSoon: true,
      },
    ],
  },
];
