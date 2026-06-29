/**
 * UI labels for permission strings. API and DB still use full keys (e.g. `auth.admin.user.read`).
 */
export function displayPermissionLabel(permission: string | null | undefined): string {
  if (permission == null || permission === undefined) return '';
  if (permission === '*') return '*';
  if (typeof permission !== 'string') return String(permission);
  return permission.startsWith('auth.') ? permission.slice('auth.'.length) : permission;
}
