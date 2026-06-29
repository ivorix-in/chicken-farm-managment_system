import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronRight, Maximize2, Menu, PanelLeft } from 'lucide-react';
import { useAdminSession } from '../../../features/admin/Auth/hooks/useAdminSession';
import { ADMIN_NAV_GROUPS } from '../../config/adminNav';
import { ROUTE_PATHS } from '../../../config/routes';

type TopbarProps = {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebarCollapsed: () => void;
};

const ROUTE_PAGE_LABELS: Record<string, string> = {
  [ROUTE_PATHS.ADMIN_ROLE_CREATE]: 'Create role',
  [ROUTE_PATHS.ADMIN_SELLER_CREATE]: 'Create seller',
};

const ROLE_EDIT_PATH_RE = /^\/admin\/roles\/[^/]+\/edit$/u;
const ROLE_VIEW_PATH_RE = /^\/admin\/roles\/[^/]+\/view$/u;
const SELLER_EDIT_PATH_RE = /^\/admin\/sellers\/[^/]+\/edit$/u;
const SELLER_VIEW_PATH_RE = /^\/admin\/sellers\/[^/]+\/view$/u;

function useAdminPageLabel(pathname: string): string {
  return React.useMemo(() => {
    const explicit = ROUTE_PAGE_LABELS[pathname];
    if (explicit) return explicit;
    if (ROLE_EDIT_PATH_RE.test(pathname)) return 'Edit role';
    if (ROLE_VIEW_PATH_RE.test(pathname)) return 'View role';
    if (SELLER_EDIT_PATH_RE.test(pathname)) return 'Edit seller';
    if (SELLER_VIEW_PATH_RE.test(pathname)) return 'View seller';
    for (const g of ADMIN_NAV_GROUPS) {
      for (const item of g.items) {
        if (item.to === pathname) return item.label;
      }
    }
    const parts = pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] ?? '';
    if (!last) return 'Dashboard';
    return last
      .split(/[-_]/u)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }, [pathname]);
}

export default function Topbar({
  onMenuClick,
  sidebarCollapsed = false,
  onToggleSidebarCollapsed,
}: TopbarProps) {
  const { pathname } = useLocation();
  const { admin } = useAdminSession();
  const pageLabel = useAdminPageLabel(pathname);

  const initials = React.useMemo(() => {
    const n = admin?.name?.trim();
    if (!n) return 'AU';
    const parts = n.split(/\s+/u);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return `${a}${b}`.toUpperCase() || 'AU';
  }, [admin?.name]);

  const displayName = admin?.name?.trim() || 'Admin User';
  const roleLabel =
    admin?.role?.code
      ?.replace(/_/gu, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Administrator';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  const mainOffset = sidebarCollapsed ? 'lg:left-14' : 'lg:left-52';

  return (
    <header
      className={`h-14 bg-white border-b border-gray-200/80 flex items-center justify-between gap-3 px-3 sm:px-5 lg:px-6 fixed top-0 right-0 left-0 z-40 transition-[left] duration-300 ease-out ${mainOffset}`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden inline-flex size-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={onToggleSidebarCollapsed}
          className="hidden lg:inline-flex size-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
        >
          <PanelLeft size={18} strokeWidth={1.75} aria-hidden />
        </button>

        <div
          className="hidden lg:block h-5 w-px shrink-0 bg-gray-200/90"
          aria-hidden
        />

        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-1.5 sm:gap-2 text-[13px] leading-tight"
        >
          <Link
            to={ROUTE_PATHS.ADMIN_DASHBOARD}
            className="shrink-0 text-gray-500 hover:text-gray-900 transition-colors"
          >
            Admin
          </Link>
          <ChevronRight
            size={14}
            strokeWidth={2}
            className="shrink-0 text-gray-300"
            aria-hidden
          />
          <span className="truncate font-medium text-gray-900" aria-current="page">
            {pageLabel}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden sm:flex size-9 items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Toggle fullscreen"
        >
          <Maximize2 size={18} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          className="relative size-9 inline-flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={1.75} />
          <span className="absolute top-2 right-2 size-1.5 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 pl-2 sm:pl-3 ml-1 border-l border-gray-200/80">
          <div className="hidden sm:flex flex-col items-end min-w-0">
            <span className="text-[13px] font-medium text-gray-900 leading-tight truncate max-w-[10rem] lg:max-w-[13rem]">
              {displayName}
            </span>
            <span className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[10rem] lg:max-w-[13rem]">
              {roleLabel}
            </span>
          </div>
          <div
            className="size-9 rounded-full bg-gray-900 flex items-center justify-center text-white text-[11px] font-medium shrink-0"
            aria-hidden
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
