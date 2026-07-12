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

import BatchesPage from '../Batches/pages/BatchesPage';
import DailyVisitsPage from '../DailyVisits/pages/DailyVisitsPage';
import FeedPage from '../Feed/pages/FeedPage';
import MedicinesPage from '../Medicines/pages/MedicinesPage';
import AreasPage from '../Areas/pages/AreasPage';
import FarmersPage from '../Farmers/pages/FarmersPage';
import FarmsPage from '../Farms/pages/FarmsPage';
import EmployeesPage from '../Employees/pages/EmployeesPage';

const COMING_SOON_ROUTES = [
  { path: 'settings', title: 'Settings' },
] as const;

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
          
          <Route path="batches" element={<BatchesPage />} />
          <Route path="daily-visits" element={<DailyVisitsPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="medicines" element={<MedicinesPage />} />
          <Route path="areas" element={<AreasPage />} />
          <Route path="farmers" element={<FarmersPage />} />
          <Route path="farms" element={<FarmsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          
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
