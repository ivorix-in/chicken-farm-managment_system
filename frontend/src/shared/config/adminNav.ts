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
    ],
  },
  {
    id: 'master',
    title: 'Master Data',
    items: [
      { id: 'farms', label: 'Farms', to: ROUTE_PATHS.ADMIN_FARMS, Icon: Tractor },
      { id: 'farmers', label: 'Farmers', to: ROUTE_PATHS.ADMIN_FARMERS, Icon: Users },
      { id: 'areas', label: 'Areas', to: ROUTE_PATHS.ADMIN_AREAS, Icon: Map },
    ],
  },
  {
    id: 'system',
    title: 'System',
    items: [
      { id: 'settings', label: 'Settings', to: ROUTE_PATHS.ADMIN_SETTINGS, Icon: Settings, comingSoon: true },
    ],
  },
];
