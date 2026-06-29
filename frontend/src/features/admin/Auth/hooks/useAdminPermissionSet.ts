import { useMemo, useCallback } from 'react';
import { permissionSetFromRole, hasPermissionInSet } from '../../../../lib/permissionUtils';
import { useAdminSession } from './useAdminSession';

/** Normalized permission checks for sidebar / nav menus (supports `*`). */
export function useAdminPermissionSet() {
  const { admin } = useAdminSession();
  const set = useMemo(
    () => permissionSetFromRole(admin?.role?.permissions),
    [admin?.role?.permissions]
  );

  const has = useCallback((permission: string) => hasPermissionInSet(set, permission), [set]);

  return { permissionSet: set, hasPermission: has };
}
