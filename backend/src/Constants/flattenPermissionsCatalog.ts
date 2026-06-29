/** Collect dot-string leaf values from PERMISSIONS tree for UI catalog endpoints. */
export function flattenPermissionsCatalog(perms: object): string[] {
  const out: string[] = [];
  for (const val of Object.values(perms)) {
    if (typeof val === "string") out.push(val);
    else if (val && typeof val === "object" && val !== null) {
      out.push(...flattenPermissionsCatalog(val as object));
    }
  }
  return [...new Set(out)].sort((a, b) => a.localeCompare(b));
}
