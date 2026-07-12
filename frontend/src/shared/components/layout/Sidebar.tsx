import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  Sprout,
  X,
} from 'lucide-react';
import { ADMIN_NAV_GROUPS } from '../../config/adminNav';
import { ROUTE_PATHS } from '../../../config/routes';
import {
  useAdminSession,
  useInvalidateAdminSession,
} from '../../../features/admin/Auth/hooks/useAdminSession';

type SidebarProps = {
  onClose: () => void;
  collapsed: boolean;
};

export default function Sidebar({ onClose, collapsed }: SidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useInvalidateAdminSession();

  const handleSignOut = () => {
    logout();
    navigate(ROUTE_PATHS.ADMIN_LOGIN, { replace: true });
  };

  const railLg = collapsed ? 'lg:w-14' : 'lg:w-56';

  return (
    <aside
      className={`w-56 h-screen bg-white flex flex-col border-r border-gray-200/80 z-50 relative text-[#1C1C1C] transition-[width] duration-300 ease-out ${railLg}`}
    >
      {/* Brand Header */}
      <div className="shrink-0 relative flex h-14 items-center gap-2 px-6 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          {/* Leaf Logo Icon */}
          <div className="size-8 rounded-lg bg-[#E6F8ED] flex items-center justify-center text-[#00A859] shrink-0">
            <Sprout size={18} strokeWidth={2.5} />
          </div>
          <span
            className={`text-lg font-bold text-gray-900 tracking-tight transition-opacity duration-200 ${collapsed ? 'lg:opacity-0 lg:w-0 lg:h-0 lg:overflow-hidden' : ''}`}
          >
            FarmVista
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-400 hover:bg-gray-50 transition-colors"
          aria-label="Close menu"
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>

      {/* Nav Menu */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1"
        aria-label="Admin navigation"
      >
        {ADMIN_NAV_GROUPS[0].items.map((item) => {
          const Icon = item.Icon;
          const isExact = item.to === ROUTE_PATHS.ADMIN_DASHBOARD;
          const active = pathname === item.to || (item.to !== ROUTE_PATHS.ADMIN_DASHBOARD && pathname.startsWith(item.to));

          return (
            <div key={item.id}>
              <NavLink
                to={item.to}
                end={isExact}
                title={item.label}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) => {
                  const currentActive = isActive || active;
                  return [
                    'flex items-center gap-3 rounded-xl py-2.5 px-4 text-[13px] outline-none transition-all duration-200',
                    collapsed ? 'lg:justify-center lg:px-2 lg:gap-0' : '',
                    currentActive
                      ? 'bg-[#E6F8ED] text-[#00A859] font-semibold shadow-sm shadow-[#00A859]/5'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
                  ].join(' ');
                }}
              >
                {({ isActive }) => {
                  const currentActive = isActive || active;
                  return (
                    <>
                      <Icon
                        size={17}
                        strokeWidth={currentActive ? 2.25 : 1.75}
                        className={`shrink-0 ${currentActive ? 'text-[#00A859]' : 'text-gray-400'}`}
                        aria-hidden
                      />
                      <span
                        className={`truncate flex-1 min-w-0 ${collapsed ? 'lg:sr-only' : ''}`}
                      >
                        {item.label}
                      </span>
                    </>
                  );
                }}
              </NavLink>
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer / Log out */}
      <div className={`mt-auto border-t border-gray-100 p-4 shrink-0 bg-white`}>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl py-2.5 px-4 text-[13px] font-normal text-gray-500 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 outline-none"
        >
          <LogOut size={17} className="shrink-0 text-gray-400 group-hover:text-red-500" />
          <span className={`${collapsed ? 'lg:sr-only' : ''}`}>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
