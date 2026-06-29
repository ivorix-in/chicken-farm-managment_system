/**
 * Client-side normalization aligned with Chicken Farm Management backend `normalizePermissionSet` / `hasPermission`
 * (`adminAuth.helper.ts`). Supports string[], "*", nested objects with boolean leaves, and "*" wildcard grant.
 */

function normalizePermissionSet(permissions: unknown): Set<string> {
  if (permissions == null || permissions === undefined) {
    return new Set();
  }
  if (Array.isArray(permissions)) {
    return new Set(permissions.filter((x): x is string => typeof x === 'string'));
  }
  if (typeof permissions === 'object') {
    const set = new Set<string>();
    for (const [key, val] of Object.entries(permissions)) {
      if (val === true) {
        set.add(key);
      } else if (Array.isArray(val)) {
        for (const item of val) {
          if (typeof item === 'string') set.add(`${key}:${item}`);
        }
      } else if (typeof val === 'object' && val !== null) {
        for (const [k2, v2] of Object.entries(val)) {
          if (v2 === true) set.add(`${key}.${k2}`);
        }
      }
    }
    return set;
  }
  return new Set();
}

/** Build a permission set from `AdminRole.permissions` JSON. */
export function permissionSetFromRole(permissionsUnknown: unknown): Set<string> {
  return normalizePermissionSet(permissionsUnknown);
}

/** True if permission string is granted (including "*"). */
export function hasPermissionInSet(permissionSet: Set<string>, permission: string): boolean {
  if (!(permissionSet instanceof Set)) return false;
  if (permissionSet.has('*')) return true;
  return permissionSet.has(permission);
}
