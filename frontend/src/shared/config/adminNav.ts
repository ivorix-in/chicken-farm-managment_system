import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ClipboardList,
  Activity,
  Package,
  Pill,
  Users,
  Tractor,
  Map,
  Settings,
  Shield,
  UserCog,
  Calculator,
  Wallet,
  ShoppingCart,
  Receipt,
  UserPlus,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { ROUTE_PATHS } from '../../config/routes';

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
    title: 'Menu',
    items: [
      { id: 'dashboard', label: 'Dashboard', to: ROUTE_PATHS.ADMIN_DASHBOARD, Icon: LayoutDashboard },
      { id: 'batches', label: 'Batches', to: ROUTE_PATHS.ADMIN_BATCHES, Icon: Activity },
      { id: 'daily-visits', label: 'Daily Visits', to: ROUTE_PATHS.ADMIN_DAILY_VISITS, Icon: ClipboardList },
      { id: 'feed', label: 'Feed Inventory', to: ROUTE_PATHS.ADMIN_FEED, Icon: Package },
      { id: 'medicines', label: 'Medicines', to: ROUTE_PATHS.ADMIN_MEDICINES, Icon: Pill },
      { id: 'collection-reports', label: 'Collection Reports', to: ROUTE_PATHS.ADMIN_COLLECTION_REPORTS, Icon: Truck },
    ],
  },
  {
    id: 'master',
    title: 'Master Data',
    items: [
      { id: 'farms', label: 'Farms', to: ROUTE_PATHS.ADMIN_FARMS, Icon: Tractor },
      { id: 'farmers', label: 'Farmers', to: ROUTE_PATHS.ADMIN_FARMERS, Icon: Users },
      { id: 'employees', label: 'Employees', to: ROUTE_PATHS.ADMIN_EMPLOYEES, Icon: UserCog },
      { id: 'areas', label: 'Areas', to: ROUTE_PATHS.ADMIN_AREAS, Icon: Map },
      { id: 'vehicles', label: 'Vehicles', to: ROUTE_PATHS.ADMIN_VEHICLES, Icon: Truck },
    ],
  },
  {
    id: 'accounts',
    title: 'Accounts & Finance',
    items: [
      { id: 'accounting', label: 'Accounting', to: ROUTE_PATHS.ADMIN_ACCOUNTING, Icon: Calculator, comingSoon: true },
      { id: 'purchases', label: 'Purchases', to: ROUTE_PATHS.ADMIN_PURCHASES, Icon: ShoppingCart, comingSoon: true },
      { id: 'sales', label: 'Sales', to: ROUTE_PATHS.ADMIN_SALES, Icon: Receipt, comingSoon: true },
      { id: 'expenses', label: 'Expenses', to: ROUTE_PATHS.ADMIN_EXPENSES, Icon: Wallet, comingSoon: true },
      { id: 'pnl', label: 'Profit & Loss', to: ROUTE_PATHS.ADMIN_PNL, Icon: TrendingUp, comingSoon: true },
    ],
  },
  {
    id: 'system',
    title: 'System',
    items: [
      { id: 'accounts', label: 'Admin Accounts', to: ROUTE_PATHS.ADMIN_ACCOUNTS, Icon: UserPlus, comingSoon: true },
      { id: 'roles', label: 'Roles & Access', to: ROUTE_PATHS.ADMIN_ROLES, Icon: Shield },
      { id: 'settings', label: 'Settings', to: ROUTE_PATHS.ADMIN_SETTINGS, Icon: Settings, comingSoon: true },
    ],
  },
];
