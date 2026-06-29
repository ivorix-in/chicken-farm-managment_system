import { useMemo } from 'react';
import { permissionSetFromRole, hasPermissionInSet } from '../../../../lib/permissionUtils';
import { useAdminSession } from './useAdminSession';

/** Same notion as `usePermission` in e-learning app: derives from admin session `/auth/me` role.permissions. */
export function usePermission(permission: string) {
  const { admin } = useAdminSession();
  const permissionSet = useMemo(
    () => permissionSetFromRole(admin?.role?.permissions),
    [admin?.role?.permissions]
  );
  return hasPermissionInSet(permissionSet, permission);
}

export function useAnyPermission(permissions: string[]) {
  const { admin } = useAdminSession();
  const permissionSet = useMemo(
    () => permissionSetFromRole(admin?.role?.permissions),
    [admin?.role?.permissions]
  );
  return permissions.some((p) => hasPermissionInSet(permissionSet, p));
}
