import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  ChevronRight,
  CreditCard,
  LogOut,
  Sparkles,
  X,
} from 'lucide-react';
import { ADMIN_NAV_GROUPS } from '../../config/adminNav';
import { ROUTE_PATHS } from '../../../config/routes';
import {
  useAdminSession,
  useInvalidateAdminSession,
} from '../../../features/admin/Auth/hooks/useAdminSession';
import { useAdminPermissionSet } from '../../../features/admin/Auth/hooks/useAdminPermissionSet';

type SidebarProps = {
  onClose: () => void;
  collapsed: boolean;
};

/** Snow UI–style nav + optional lg-only collapsed (icon) rail. */
export default function Sidebar({ onClose, collapsed }: SidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useInvalidateAdminSession();
  const { admin } = useAdminSession();
  const { hasPermission } = useAdminPermissionSet();

  const initials = React.useMemo(() => {
    const n = admin?.name?.trim();
    if (!n) return 'AD';
    const parts = n.split(/\s+/u);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return `${a}${b}`.toUpperCase() || 'AD';
  }, [admin?.name]);

  const filteredGroups = React.useMemo(() => {
    return ADMIN_NAV_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((item) =>
        item.permission ? hasPermission(item.permission) : true
      ),
    })).filter((g) => g.items.length > 0);
  }, [hasPermission]);

  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const accountMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      const el = accountMenuRef.current;
      if (el && !el.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleSignOut = () => {
    setAccountMenuOpen(false);
    logout();
    navigate(ROUTE_PATHS.ADMIN_LOGIN, { replace: true });
  };

  const goMenuPath = (path: string) => {
    setAccountMenuOpen(false);
    navigate(path);
    if (window.innerWidth < 1024) onClose();
  };

  const menuItemClass =
    'flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-normal text-gray-800 transition-colors hover:bg-gray-50';

  const AccountMenuPanel = ({ className }: { className: string }) => (
    <div
      className={`rounded-xl border border-gray-200/90 bg-white py-1 shadow-lg shadow-gray-900/[0.08] overflow-hidden ${className}`}
      role="menu"
    >
      <div className="px-3 py-3 flex gap-3">
        <div
          className="size-10 rounded-md shrink-0 bg-gradient-to-br from-sky-200 via-violet-200 to-indigo-200 ring-1 ring-black/[0.06] flex items-center justify-center text-[11px] font-semibold text-gray-800"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-gray-900 leading-tight truncate">
            {admin?.name?.trim() || 'Admin'}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">{admin?.email || '—'}</p>
        </div>
      </div>
      <div className="h-px bg-gray-100 mx-1" />
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => goMenuPath(ROUTE_PATHS.ADMIN_SETTINGS)}
      >
        <Sparkles size={16} strokeWidth={1.5} className="shrink-0 text-gray-500" aria-hidden />
        Upgrade to Pro
      </button>
      <div className="h-px bg-gray-100 mx-1" />
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => goMenuPath(ROUTE_PATHS.ADMIN_SETTINGS)}
      >
        <BadgeCheck size={16} strokeWidth={1.5} className="shrink-0 text-gray-500" aria-hidden />
        Account
      </button>
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => goMenuPath(ROUTE_PATHS.ADMIN_SETTINGS)}
      >
        <CreditCard size={16} strokeWidth={1.5} className="shrink-0 text-gray-500" aria-hidden />
        Billing
      </button>
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={() => goMenuPath(ROUTE_PATHS.ADMIN_SETTINGS)}
      >
        <Bell size={16} strokeWidth={1.5} className="shrink-0 text-gray-500" aria-hidden />
        Notifications
      </button>
      <div className="h-px bg-gray-100 mx-1" />
      <button
        type="button"
        role="menuitem"
        className={menuItemClass}
        onClick={handleSignOut}
      >
        <LogOut size={16} strokeWidth={1.5} className="shrink-0 text-gray-500" aria-hidden />
        Log out
      </button>
    </div>
  );

  const railLg = collapsed ? 'lg:w-14' : 'lg:w-52';

  return (
    <aside
      className={`w-52 h-screen bg-white flex flex-col border-r border-gray-200/80 z-50 relative text-[#1C1C1C] transition-[width] duration-300 ease-out ${railLg}`}
    >
      <div className="shrink-0 relative flex h-14 items-center justify-center px-3 border-b border-gray-200/80 bg-white">
        <div
          className={`text-center transition-opacity duration-200 ${collapsed ? 'lg:opacity-0 lg:w-0 lg:h-0 lg:overflow-hidden lg:pointer-events-none' : ''}`}
        >
          <span className="sr-only">Chicken Farm Management</span>
          <span
            aria-hidden
            className="inline text-base sm:text-lg font-semibold leading-tight tracking-tight"
          >
            <span className="text-blue-600">Chicken Farm</span>
            <span className="text-gray-700"> Management</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
        className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
          aria-label="Close menu"
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-1 pt-2 lg:pt-3 space-y-5"
        aria-label="Admin navigation"
      >
        {filteredGroups.map((group) => (
          <div key={group.id}>
            <h3
              className={`px-2.5 mb-1.5 text-[12px] font-normal leading-4 text-[#A0A0A0] tracking-tight ${collapsed ? 'lg:hidden' : ''}`}
            >
              {group.title}
            </h3>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.Icon;
                const isExact = item.to === ROUTE_PATHS.ADMIN_DASHBOARD;

                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.to}
                      end={isExact}
                      title={item.label}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) => {
                        const rolesSubActive =
                          item.to === ROUTE_PATHS.ADMIN_ROLES && pathname.startsWith(`${ROUTE_PATHS.ADMIN_ROLES}/`);
                        const sellersSubActive =
                          item.to === ROUTE_PATHS.ADMIN_SELLERS &&
                          pathname.startsWith(`${ROUTE_PATHS.ADMIN_SELLERS}/`);
                        const active = isActive || rolesSubActive || sellersSubActive;
                        return [
                          'flex items-center gap-1.5 rounded-lg py-1.5 text-[12px] font-normal leading-4 outline-none transition-colors',
                          collapsed
                            ? 'lg:justify-center lg:px-2 lg:gap-0 lg:rounded-none'
                            : 'px-2.5',
                          'focus-visible:ring-2 focus-visible:ring-gray-900/10 focus-visible:ring-offset-2',
                          active
                            ? 'bg-[#F4F4F5] text-[#1C1C1C]'
                            : 'text-[#1C1C1C] hover:bg-[#FAFAFA]',
                        ].join(' ');
                      }}
                    >
                      {({ isActive }) => {
                        const rolesSubActive =
                          item.to === ROUTE_PATHS.ADMIN_ROLES && pathname.startsWith(`${ROUTE_PATHS.ADMIN_ROLES}/`);
                        const sellersSubActive =
                          item.to === ROUTE_PATHS.ADMIN_SELLERS &&
                          pathname.startsWith(`${ROUTE_PATHS.ADMIN_SELLERS}/`);
                        const active = isActive || rolesSubActive || sellersSubActive;
                        return (
                          <>
                            <span
                              className={`w-3.5 shrink-0 flex justify-center text-gray-300 ${collapsed ? 'lg:hidden' : ''}`}
                            >
                              {!active ? (
                                <ChevronRight size={11} strokeWidth={2} className="-ml-px" aria-hidden />
                              ) : null}
                            </span>
                            <Icon
                              size={14}
                              strokeWidth={1.5}
                              className="shrink-0 text-[#1C1C1C]"
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
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        ref={accountMenuRef}
        className={`mt-auto border-t border-gray-200/80 shrink-0 relative z-20 bg-white ${collapsed ? 'lg:p-2' : 'p-3'}`}
      >
        <div className={`${collapsed ? 'lg:hidden' : ''}`}>
          <button
            type="button"
            id="sidebar-account-trigger"
            aria-expanded={accountMenuOpen}
            aria-haspopup="menu"
            aria-controls="sidebar-account-menu-expanded"
            onClick={() => setAccountMenuOpen((o) => !o)}
            className="flex w-full items-center gap-2.5 rounded-lg bg-[#F4F4F5] hover:bg-[#EBEBEC] transition-colors p-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 focus-visible:ring-offset-2"
          >
            <div
              className="size-8 rounded-md shrink-0 bg-gradient-to-br from-sky-200 via-violet-200 to-indigo-200 ring-1 ring-black/[0.06] flex items-center justify-center text-[10px] font-semibold text-gray-800"
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-gray-900 leading-tight truncate">
                {admin?.name?.trim() || 'Admin'}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5 truncate">{admin?.email || '—'}</p>
            </div>
            <ChevronsUpDown
              size={15}
              strokeWidth={2}
              className={`shrink-0 text-gray-400 transition-transform ${accountMenuOpen ? 'text-gray-600' : ''}`}
              aria-hidden
            />
          </button>

          {accountMenuOpen ? (
            <div
              id="sidebar-account-menu-expanded"
              className="absolute left-3 right-3 bottom-full z-30 mb-2"
            >
              <AccountMenuPanel className="" />
            </div>
          ) : null}
        </div>

        {collapsed ? (
          <div className="hidden lg:flex flex-col items-stretch relative">
            <button
              type="button"
              id="sidebar-account-avatar-trigger"
              aria-expanded={accountMenuOpen}
              aria-haspopup="menu"
              aria-controls="sidebar-account-menu-collapsed"
              onClick={() => setAccountMenuOpen((o) => !o)}
              className="mx-auto size-9 rounded-md bg-gradient-to-br from-sky-200 via-violet-200 to-indigo-200 ring-1 ring-black/[0.06] flex items-center justify-center text-[10px] font-semibold text-gray-800 shadow-sm hover:ring-2 hover:ring-gray-900/10 transition-shadow"
              aria-label={`Account: ${admin?.name ?? 'Admin'}`}
            >
              {initials}
            </button>
            {accountMenuOpen ? (
              <div
                id="sidebar-account-menu-collapsed"
                className="absolute left-full bottom-0 z-30 ml-2 w-[min(calc(100vw-5rem),17.5rem)]"
              >
                <AccountMenuPanel className="" />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
