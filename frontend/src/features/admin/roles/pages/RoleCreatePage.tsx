import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckSquare,
  Loader2,
  Plus,
  Square,
  X,
} from 'lucide-react';
import {
  createAdminRole,
  fetchPermissionsCatalog,
  fetchAdminRoles,
  updateAdminRole,
} from '../api/adminRolesApi';
import { ROUTE_PATHS } from '../../../../config/routes';
import { generateSequence, normalizeRoleCode } from '../../../../utils/utils';
import { getRolePermissionMeta } from '../constants/roles';

const QUERY_CATALOG = ['adminRoles', 'catalog'] as const;
const QUERY_ROLES = ['adminRoles', 'list'] as const;

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50/90 px-5 py-3.5">
        <h2 className="text-[14px] font-semibold tracking-tight text-gray-900">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-[12px] leading-snug text-gray-500">{description}</p>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function RoleCreatePage() {
  const { roleId } = useParams<{ roleId?: string }>();
  const { pathname } = useLocation();
  const isEditMode = Boolean(roleId);
  const isViewMode = pathname.endsWith('/view');
  const navigate = useNavigate();
  const qc = useQueryClient();

  const catalogQuery = useQuery({
    queryKey: QUERY_CATALOG,
    queryFn: async () => {
      const d = await fetchPermissionsCatalog();
      return d.permissions ?? [];
    },
  });

  const catalog = catalogQuery.data ?? [];
  const rolesQuery = useQuery({
    queryKey: QUERY_ROLES,
    queryFn: fetchAdminRoles,
    enabled: isEditMode,
  });
  const roleToEdit = useMemo(
    () => (isEditMode ? (rolesQuery.data ?? []).find((r) => r.id === roleId) ?? null : null),
    [isEditMode, roleId, rolesQuery.data]
  );

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [fullAccess, setFullAccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditMode || !roleToEdit) return;
    const perms = Array.isArray(roleToEdit.permissions)
      ? roleToEdit.permissions.filter((p): p is string => typeof p === 'string')
      : [];
    const hasWildcard = perms.includes('*');
    setName(roleToEdit.name ?? '');
    setCode(roleToEdit.code ?? '');
    setCodeManuallyEdited(true);
    setFullAccess(hasWildcard);
    setSelected(hasWildcard ? new Set() : new Set(perms));
  }, [isEditMode, roleToEdit]);

  const togglePerm = (key: string) => {
    if (isViewMode) return;
    setFullAccess(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllIndividual = () => {
    if (isViewMode) return;
    setFullAccess(false);
    setSelected(new Set(catalog));
  };

  const clearIndividual = () => {
    if (isViewMode) return;
    setFullAccess(false);
    setSelected(new Set());
  };
  const toggleByHeading = (heading: 'Role' | 'User') => {
    if (isViewMode) return;
    setFullAccess(false);
    setSelected((prev) => {
      const next = new Set(prev);
      const perms = groupedPermissions[heading];
      const allSelected = perms.every((perm) => next.has(perm));
      if (allSelected) {
        for (const perm of perms) next.delete(perm);
      } else {
        for (const perm of perms) next.add(perm);
      }
      return next;
    });
  };

  const handleToggleFullAccess = () => {
    if (isViewMode) return;
    setFullAccess((v) => {
      const next = !v;
      if (next) setSelected(new Set());
      return next;
    });
  };

  const mutation = useMutation({
    mutationFn: (payload: { name: string; code: string; permissions: string[] }) =>
      isEditMode && roleId ? updateAdminRole(roleId, payload) : createAdminRole(payload),
    onSuccess: () => {
      setSubmitError(null);
      qc.invalidateQueries({ queryKey: QUERY_ROLES });
      toast.success(isEditMode ? 'Role updated successfully' : 'Role created successfully');
      void navigate(ROUTE_PATHS.ADMIN_ROLES, { replace: true });
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { error?: { message?: string } })?.error?.message ?? err.message
        : String(err);
      setSubmitError(msg);
      toast.error(msg || 'Failed to save role');
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isViewMode) return;
    setSubmitError(null);
    const permissions = fullAccess ? ['*'] : [...selected];
    mutation.mutate({
      name: name.trim(),
      code: code.trim(),
      permissions,
    });
  };
  const removeSelectedPermission = (key: string) => {
    if (isViewMode) return;
    if (key === '*') {
      setFullAccess(false);
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const selectedPermissionChips = useMemo(() => {
    if (fullAccess) return [{ key: '*' as const, label: 'Full access' as const }];
    return [...selected].sort().map((p) => ({
      key: p,
      label: getRolePermissionMeta(p).label,
    }));
  }, [fullAccess, selected]);
  const groupedPermissions = useMemo(() => {
    const groups: Record<'Role' | 'User', string[]> = { Role: [], User: [] };
    for (const perm of catalog) {
      groups[getRolePermissionMeta(perm).heading].push(perm);
    }
    return groups;
  }, [catalog]);

  const saving = mutation.isPending;
  const catalogLoading = catalogQuery.isLoading || (isEditMode && rolesQuery.isLoading);
  const formReadOnly = isViewMode || saving;
  const handleNameChange = (nextName: string) => {
    setName(nextName);
    if (!codeManuallyEdited) {
      setCode(generateSequence(nextName));
    }
  };

  const handleCodeChange = (rawValue: string) => {
    const nextCode = normalizeRoleCode(rawValue);
    setCode(nextCode);
    setCodeManuallyEdited(nextCode.length > 0);
  };
  const pageTitle = isViewMode ? 'View role' : isEditMode ? 'Edit role' : 'Create role';
  const pageDescription = isViewMode
    ? 'Review role details and permission access in read-only mode.'
    : isEditMode
    ? 'Update role details and permission access for administrators.'
    : 'Add a new permission bundle. Administrators receive these rights after you assign this role; changes apply on next sign-in.';

  if (isEditMode && !rolesQuery.isLoading && !roleToEdit) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Role not found or no longer available.</p>
        <Link
          to={ROUTE_PATHS.ADMIN_ROLES}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-800 shadow-sm hover:bg-gray-50"
        >
          Back to roles
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-300 sm:space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <header className="min-w-0 max-w-2xl">
          <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
            <span className="text-gray-400" aria-hidden>
              •{' '}
            </span>
            Role registry
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-[1.65rem] sm:leading-snug">{pageTitle}</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{pageDescription}</p>
        </header>
        <Link
          to={ROUTE_PATHS.ADMIN_ROLES}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-800 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft size={16} strokeWidth={2} aria-hidden />
          Back to roles
        </Link>
      </div>

      <form
        className="grid w-full max-w-none grid-cols-1 gap-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:items-start lg:gap-x-8"
        onSubmit={handleSubmit}
      >
        {submitError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-800 lg:col-span-2"
            role="alert"
          >
            {submitError}
          </div>
        ) : null}

        <div className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
          <FormSection
            title="Role details"
            description="Public name and unique code used in the API (uppercase, no spaces)."
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="role-create-name" className="text-[13px] font-medium text-gray-900">
                  Display name
                </label>
                <input
                  id="role-create-name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Operations manager"
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-gray-900/10"
                  required
                  disabled={formReadOnly}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="role-create-code" className="text-[13px] font-medium text-gray-900">
                  Identifier code
                </label>
                <input
                  id="role-create-code"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="OPERATIONS_MANAGER"
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 font-mono text-[13px] text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-gray-900/10"
                  pattern="^[A-Z][A-Z0-9_]*$"
                  required
                  disabled={formReadOnly}
                  title="Uppercase letters, digits, underscore"
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            title="Access level"
            description="Grant every permission at once, or pick individual capabilities in the panel on the right."
          >
            <button
              type="button"
              onClick={handleToggleFullAccess}
              disabled={catalogLoading || formReadOnly}
              className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3.5 text-left transition-colors disabled:opacity-50 ${
                fullAccess ? 'border-gray-900 bg-gray-100' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
              }`}
            >
              <div
                className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${
                  fullAccess ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white'
                }`}
              >
                <CheckSquare
                  size={12}
                  className={fullAccess ? 'opacity-100' : 'opacity-0'}
                  style={{ strokeWidth: 3 }}
                  aria-hidden
                />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900">Full access (*)</p>
                <p className="mt-1 text-[12px] leading-snug text-gray-500">
                  Same wildcard as seeded super-admin — use sparingly.
                </p>
              </div>
            </button>
          </FormSection>
        </div>

        <div className="min-w-0">
          <FormSection
            title="Permissions catalog"
            description="Select capabilities this role may perform. Uncheck “Full access” on the left to edit the list."
          >
            <div className="mb-4 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-3 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Selected permissions</p>
              <div className="mt-2 flex min-h-[2rem] flex-wrap gap-1.5">
                {!selectedPermissionChips.length ? (
                  <span className="text-[12px] text-gray-400">
                    None — choose full access or check items in the list.
                  </span>
                ) : selectedPermissionChips[0]?.key === '*' ? (
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Full selection
                    </p>
                    <button
                      type="button"
                      onClick={() => removeSelectedPermission('*')}
                      disabled={formReadOnly}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800"
                    >
                      Full access
                      <X size={11} aria-hidden />
                    </button>
                  </div>
                ) : (
                  selectedPermissionChips.map(({ key, label }) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => removeSelectedPermission(key)}
                      disabled={formReadOnly}
                      className="inline-flex max-w-full items-center gap-1 truncate rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-800 shadow-sm"
                      title={key}
                    >
                      {label}
                      <X size={11} aria-hidden />
                    </button>
                  ))
                )}
              </div>
              {!fullAccess && selected.size > 0 ? (
                <p className="mt-2 text-[11px] text-gray-400">{selected.size} selected</p>
              ) : null}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5">
                <span className="text-[12px] font-medium text-gray-500">Granular permissions</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={catalogLoading || fullAccess || formReadOnly}
                    onClick={selectAllIndividual}
                    className="text-[12px] font-medium text-gray-700 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-40"
                  >
                    Select all
                  </button>
                  <span className="text-gray-200">|</span>
                  <button
                    type="button"
                    disabled={catalogLoading || fullAccess || formReadOnly}
                    onClick={clearIndividual}
                    className="text-[12px] font-medium text-gray-700 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-40"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {catalogLoading ? (
                <div className="flex items-center justify-center gap-2 py-14 text-[13px] text-gray-500">
                  <Loader2 className="size-4 animate-spin text-gray-400" aria-hidden />
                  Loading catalog…
                </div>
              ) : (
                <fieldset disabled={fullAccess || formReadOnly} className="min-h-0">
                  <div className="max-h-[min(55vh,420px)] divide-y divide-gray-50 overflow-y-auto custom-scrollbar lg:max-h-[calc(100dvh-14rem)]">
                    {(['Role', 'User'] as const).map((heading) => {
                      const items = groupedPermissions[heading];
                      if (!items.length) return null;
                      const allSelected = items.every((perm) => selected.has(perm));
                      return (
                        <div key={heading} className="py-1">
                          <div className="flex items-center justify-between px-4 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                              {heading}
                            </p>
                            <button
                              type="button"
                              disabled={catalogLoading || fullAccess || formReadOnly}
                              onClick={() => toggleByHeading(heading)}
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-600 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-40"
                            >
                              {allSelected ? (
                                <CheckSquare size={12} className="text-gray-900" aria-hidden />
                              ) : (
                                <Square size={12} className="text-gray-400" aria-hidden />
                              )}
                              {heading}
                            </button>
                          </div>
                          {items.map((perm) => {
                            const isSelected = selected.has(perm);
                            const meta = getRolePermissionMeta(perm);
                            return (
                              <label
                                key={perm}
                                className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors ${
                                  fullAccess ? 'pointer-events-none opacity-45' : 'hover:bg-gray-50/80'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="peer sr-only"
                                  checked={isSelected}
                                  disabled={fullAccess || formReadOnly}
                                  onChange={() => togglePerm(perm)}
                                />
                                <span
                                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border ${
                                    isSelected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white'
                                  }`}
                                  aria-hidden
                                >
                                  <CheckSquare
                                    size={12}
                                    className={isSelected ? 'opacity-100' : 'opacity-0'}
                                    style={{ strokeWidth: 3 }}
                                  />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[13px] font-medium text-gray-900">{meta.label}</span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  {!catalog.length ? (
                    <p className="px-4 py-8 text-center text-[13px] text-amber-800">No permissions in catalog.</p>
                  ) : null}
                </fieldset>
              )}
            </div>
          </FormSection>
        </div>

        <div className="flex flex-col-reverse gap-2 border-gray-100 pt-2 sm:flex-row sm:justify-end lg:col-span-2 lg:border-t lg:pt-6">
          <Link
            to={ROUTE_PATHS.ADMIN_ROLES}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
          {!isViewMode ? (
            <button
              type="submit"
              disabled={saving || !name.trim() || !code.trim()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:pointer-events-none disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {isEditMode ? 'Saving…' : 'Creating…'}
                </>
              ) : (
                <>
                  <Plus size={16} strokeWidth={2} aria-hidden />
                  {isEditMode ? 'Save changes' : 'Create role'}
                </>
              )}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
