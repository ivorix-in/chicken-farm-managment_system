export type RolePermissionMeta = {
  heading: 'Role' | 'User';
  label: string;
};

const FRIENDLY_PERMISSION_META: Record<string, RolePermissionMeta> = {
  'admin.role.create': { heading: 'Role', label: 'Admin role create' },
  'auth.admin.role.create': { heading: 'Role', label: 'Admin role create' },
  'admin.role.read': { heading: 'Role', label: 'Admin role read' },
  'auth.admin.role.read': { heading: 'Role', label: 'Admin role read' },
  'admin.role.update': { heading: 'Role', label: 'Admin role edit' },
  'auth.admin.role.update': { heading: 'Role', label: 'Admin role edit' },
  'admin.role.delete': { heading: 'Role', label: 'Admin role delete' },
  'auth.admin.role.delete': { heading: 'Role', label: 'Admin role delete' },
  'admin.user.create': { heading: 'User', label: 'Admin user create' },
  'auth.admin.user.create': { heading: 'User', label: 'Admin user create' },
  'admin.user.read': { heading: 'User', label: 'Admin user read' },
  'auth.admin.user.read': { heading: 'User', label: 'Admin user read' },
  'admin.user.update': { heading: 'User', label: 'Admin user edit' },
  'auth.admin.user.update': { heading: 'User', label: 'Admin user edit' },
  'admin.user.delete': { heading: 'User', label: 'Admin user delete' },
  'auth.admin.user.delete': { heading: 'User', label: 'Admin user delete' },
};

export function getRolePermissionMeta(permission: string): RolePermissionMeta {
  return (
    FRIENDLY_PERMISSION_META[permission] ?? {
      heading: permission.includes('.user.') ? 'User' : 'Role',
      label: permission.replace(/^auth\./u, '').replace(/\./gu, ' '),
    }
  );
}