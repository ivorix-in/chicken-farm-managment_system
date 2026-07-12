import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronRight, Maximize2, Menu, PanelLeft, Search, ChevronDown } from 'lucide-react';
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
};

const ROLE_EDIT_PATH_RE = /^\/admin\/roles\/[^/]+\/edit$/u;
const ROLE_VIEW_PATH_RE = /^\/admin\/roles\/[^/]+\/view$/u;

function useAdminPageLabel(pathname: string): string {
  return React.useMemo(() => {
    const explicit = ROUTE_PAGE_LABELS[pathname];
    if (explicit) return explicit;
    if (ROLE_EDIT_PATH_RE.test(pathname)) return 'Edit role';
    if (ROLE_VIEW_PATH_RE.test(pathname)) return 'View role';
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

  const initials = React.useMemo(() => {
    const n = admin?.name?.trim();
    if (!n) return 'AU';
    const parts = n.split(/\s+/u);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return `${a}${b}`.toUpperCase() || 'AU';
  }, [admin?.name]);

  const displayName = admin?.name?.trim() || 'Albert Flores';
  const displayEmail = admin?.email || 'albert45@mail.com';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  const mainOffset = sidebarCollapsed ? 'lg:left-14' : 'lg:left-56';

  return (
    <header
      className={`h-14 bg-white border-b border-gray-100 flex items-center justify-between gap-3 px-6 fixed top-0 right-0 left-0 z-40 transition-[left] duration-300 ease-out print:hidden ${mainOffset}`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden inline-flex size-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={onToggleSidebarCollapsed}
          className="hidden lg:inline-flex size-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
        >
          <PanelLeft size={18} strokeWidth={1.75} aria-hidden />
        </button>

        {/* Search bar matching mockup design */}
        <div className="relative hidden md:block max-w-xs w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search something here....."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8F9FA] border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#00A859]/10 focus:border-[#00A859] transition-all placeholder:text-gray-400 text-gray-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden sm:flex size-9 items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          aria-label="Toggle fullscreen"
        >
          <Maximize2 size={16} strokeWidth={1.75} />
        </button>

        {/* Bell notifications */}
        <button
          type="button"
          className="relative size-9 inline-flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} strokeWidth={1.75} />
          <span className="absolute top-2 right-2 size-2 bg-[#00A859] rounded-full ring-2 ring-white" />
        </button>

        {/* User profile dropdown info matching mockup */}
        <div className="flex items-center gap-3 pl-3 ml-2 border-l border-gray-100">
          <div
            className="size-8 rounded-full bg-[#E6F8ED] border border-gray-100 flex items-center justify-center text-[#00A859] text-[11px] font-semibold shrink-0"
            aria-hidden
          >
            {initials}
          </div>
          <div className="hidden sm:flex flex-col items-start min-w-0">
            <span className="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[10rem]">
              {displayName}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[10rem]">
              {displayEmail}
            </span>
          </div>
          <ChevronDown size={14} className="text-gray-400 shrink-0" />
        </div>
      </div>
    </header>
  );
}
