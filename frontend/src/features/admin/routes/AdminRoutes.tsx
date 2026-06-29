import { Routes, Route, Navigate } from 'react-router-dom';
import { PERMISSIONS } from '../../../constants/permissions';
import LoginPage from '../Auth/pages/LoginPage';
import DashboardPage from '../Dashboard/pages/DashboardPage';
import AdminLayout from '../../../shared/components/layout/AdminLayout';
import ForbiddenPage from '../Auth/pages/ForbiddenPage';
import RolesPage from '../roles/pages/RolesPage';
import RoleCreatePage from '../roles/pages/RoleCreatePage';
import ComingSoonPage from '../System/pages/ComingSoonPage';
import { AuthGuard, RequirePermission } from '../Auth/guards';
import SellersPage from '../Sellers/pages/SellersPage';
import SellerCreation from '../Sellers/pages/components/SellerCreation';
import SellerDetails from '../Sellers/pages/components/SellerDetails';

const COMING_SOON_ROUTES = [
  { path: 'analytics', title: 'Analytics' },
  { path: 'products', title: 'Products' },
  { path: 'orders', title: 'Orders' },
  { path: 'users', title: 'Admins' },
  { path: 'security', title: 'Security' },
  { path: 'settings', title: 'Settings' },
] as const;

/** `AuthGuard` enforces JWT session; nested `RequirePermission` applies RBAC. */
export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="login" replace />} />

      <Route path="login" element={<AuthGuard requireAuth={false} />}>
        <Route index element={<LoginPage />} />
      </Route>

      <Route element={<AuthGuard />}>
        <Route path="forbidden" element={<ForbiddenPage />} />
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route element={<RequirePermission permission={PERMISSIONS.ADMIN.ROLE.READ} />}>
            <Route path="roles" element={<RolesPage />} />
          </Route>
          <Route element={<RequirePermission permission={PERMISSIONS.ADMIN.ROLE.CREATE} />}>
            <Route path="roles/new" element={<RoleCreatePage />} />
          </Route>
          <Route element={<RequirePermission permission={PERMISSIONS.ADMIN.ROLE.UPDATE} />}>
            <Route path="roles/:roleId/edit" element={<RoleCreatePage />} />
          </Route>
          <Route element={<RequirePermission permission={PERMISSIONS.ADMIN.ROLE.READ} />}>
            <Route path="roles/:roleId/view" element={<RoleCreatePage />} />
          </Route>
          <Route path="sellers" element={<SellersPage />} />
          <Route path="sellers/new" element={<SellerCreation />} />
          <Route path="sellers/:sellerId/edit" element={<SellerCreation />} />
          <Route path="sellers/:sellerId/view" element={<SellerDetails />} />
          {COMING_SOON_ROUTES.map(({ path, title }) => (
            <Route key={path} path={path} element={<ComingSoonPage title={title} />} />
          ))}
        </Route>
      </Route>

      <Route
        path="*"
        element={<div className="p-8 text-center text-gray-500">Admin — page not found</div>}
      />
    </Routes>
  );
}
