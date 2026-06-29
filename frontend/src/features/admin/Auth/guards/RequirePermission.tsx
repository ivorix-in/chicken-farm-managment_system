import { useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTE_PATHS } from '../../../../config/routes';
import {
  permissionSetFromRole,
  hasPermissionInSet,
} from '../../../../lib/permissionUtils';
import { useAdminSession } from '../hooks/useAdminSession';
import { AuthRouteFallback } from './AuthRouteFallback';

type CheckArgs = {
  permission?: string;
  anyPermission?: string[];
  role?: string;
  anyRole?: string[];
};

function checkAccess(
  permissionSet: Set<string>,
  roleSet: Set<string>,
  { permission, anyPermission, role, anyRole }: CheckArgs
) {
  if (permission) return hasPermissionInSet(permissionSet, permission);
  if (role) return roleSet.has(role);
  if (anyPermission?.length)
    return anyPermission.some((p) => hasPermissionInSet(permissionSet, p));
  if (anyRole?.length) return anyRole.some((r) => roleSet.has(r));
  return true;
}

type RequirePermissionProps = CheckArgs;

/** Must nest under `AuthGuard requireAuth`. Same shape as e-learning `RequirePermission`. */
export function RequirePermission({ permission, role, anyPermission, anyRole }: RequirePermissionProps) {
  const { admin, isLoading, isAuthenticated } = useAdminSession();

  const { permissionSet, roleSet } = useMemo(() => {
    return {
      permissionSet: permissionSetFromRole(admin?.role?.permissions),
      roleSet: new Set(admin?.role?.code ? [admin.role.code] : []),
    };
  }, [admin?.role?.permissions, admin?.role?.code]);

  if (isLoading) {
    return <AuthRouteFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.ADMIN_LOGIN} replace />;
  }

  const hasRequirement = Boolean(
    permission ?? role ?? anyPermission?.length ?? anyRole?.length
  );
  if (!hasRequirement) {
    return <Outlet />;
  }

  if (!checkAccess(permissionSet, roleSet, { permission, anyPermission, role, anyRole })) {
    return <Navigate to={ROUTE_PATHS.ADMIN_FORBIDDEN} replace />;
  }

  return <Outlet />;
}
