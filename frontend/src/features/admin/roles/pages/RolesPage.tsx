import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  PencilLine,
  Trash2,
  UsersRound,
  ArrowUpRight,
  Plus,
  Eye,
} from 'lucide-react';
import {
  fetchAdminRoles,
  deleteAdminRole,
  type AdminRoleDto,
} from '../api/adminRolesApi';
import { PERMISSIONS } from '../../../../constants/permissions';
import { ROUTE_PATHS, adminRoleEditPath, adminRoleViewPath } from '../../../../config/routes';
import { usePermission } from '../../Auth/hooks/usePermission';
import { displayPermissionLabel } from '../../../../lib/permissionLabels';
import { DataTable, type DataTableColumn } from '../../../../shared/components/core/DataTable';

const QUERY_ROLES = ['adminRoles', 'list'] as const;
const TABLE_PAGE_SIZE = 5;

function formatDate(iso: string | undefined) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function summarizePermissions(perms: unknown, max = 2): string {
  if (perms == null) return '—';
  if (Array.isArray(perms)) {
    if (perms.includes('*')) return 'Full access';
    const s = perms.filter((x): x is string => typeof x === 'string');
    const labels = s.map((p) => displayPermissionLabel(p));
    if (labels.length <= max) return labels.join(', ') || '—';
    return `${labels.slice(0, max).join(', ')}, etc. (+${s.length - max})`;
  }
  return '—';
}

type RoleFilterTab = 'all' | 'assigned' | 'unassigned';
type RoleTableRow =
  | (AdminRoleDto & { __placeholder?: false; __displayIndex?: number })
  | { id: string; __placeholder: true; __displayIndex?: number };

function tabPillClass(active: boolean) {
  return active
    ? 'rounded-full border border-gray-200/90 bg-white px-3.5 py-2 text-[13px] font-medium text-gray-900 shadow-sm'
    : 'rounded-full border border-transparent bg-transparent px-3.5 py-2 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-100/90';
}

export default function RolesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const canRead = usePermission(PERMISSIONS.ADMIN.ROLE.READ);
  const canCreate = usePermission(PERMISSIONS.ADMIN.ROLE.CREATE);
  const canUpdate = usePermission(PERMISSIONS.ADMIN.ROLE.UPDATE);
  const canDelete = usePermission(PERMISSIONS.ADMIN.ROLE.DELETE);

  const rolesQuery = useQuery({
    queryKey: QUERY_ROLES,
    queryFn: fetchAdminRoles,
  });

  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [pendingDeleteRole, setPendingDeleteRole] = useState<AdminRoleDto | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [roleTab, setRoleTab] = useState<RoleFilterTab>('all');
  const [page, setPage] = useState(1);

  const sortedRoles = useMemo(() => {
    const r = rolesQuery.data ?? [];
    return [...r].sort((a, b) => a.name.localeCompare(b.name));
  }, [rolesQuery.data]);

  const stats = useMemo(() => {
    const roles = sortedRoles;
    const total = roles.length;
    let assignedRoles = 0;
    let totalAdminSeats = 0;
    let newThisMonth = 0;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    for (const r of roles) {
      const n = r._count?.adminUsers ?? 0;
      totalAdminSeats += n;
      if (n > 0) assignedRoles += 1;
      const created = r.createdAt ? new Date(r.createdAt) : null;
      if (created && !Number.isNaN(created.getTime()) && created >= monthStart) {
        newThisMonth += 1;
      }
    }
    return {
      total,
      assignedRoles,
      unassignedRoles: total - assignedRoles,
      totalAdminSeats,
      newThisMonth,
    };
  }, [sortedRoles]);

  const tabFilteredRoles = useMemo(() => {
    if (roleTab === 'assigned') {
      return sortedRoles.filter((r) => (r._count?.adminUsers ?? 0) > 0);
    }
    if (roleTab === 'unassigned') {
      return sortedRoles.filter((r) => (r._count?.adminUsers ?? 0) === 0);
    }
    return sortedRoles;
  }, [sortedRoles, roleTab]);

  const filteredRoles = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return tabFilteredRoles;
    return tabFilteredRoles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        summarizePermissions(r.permissions, 100).toLowerCase().includes(q)
    );
  }, [tabFilteredRoles, tableSearch]);
  useEffect(() => {
    setPage(1);
  }, [tableSearch, roleTab]);
  const pageCount = Math.max(1, Math.ceil(filteredRoles.length / TABLE_PAGE_SIZE));

  const currentPage = Math.min(page, pageCount);

  const pagedRows = useMemo((): RoleTableRow[] => {
    const start = (currentPage - 1) * TABLE_PAGE_SIZE;
    const pageSlice = filteredRoles.slice(start, start + TABLE_PAGE_SIZE);
    const mapped: RoleTableRow[] = pageSlice.map((row, i) => ({
      ...row,
      __displayIndex: start + i + 1,
    }));
    const missing = TABLE_PAGE_SIZE - mapped.length;
    if (missing <= 0) return mapped;
    const fillers: RoleTableRow[] = Array.from({ length: missing }, (_, i) => ({
      id: `__empty_row__${currentPage}_${i}`,
      __placeholder: true,
    }));
    return [...mapped, ...fillers];
  }, [currentPage, filteredRoles]);

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteAdminRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_ROLES });
      toast.success('Role deleted successfully');
    },
  });

  const openEdit = useCallback((role: AdminRoleDto) => {
    setMenuOpenFor(null);
    navigate(adminRoleEditPath(role.id));
  }, [navigate]);
  const openView = useCallback((role: AdminRoleDto) => {
    setMenuOpenFor(null);
    navigate(adminRoleViewPath(role.id));
  }, [navigate]);

  const confirmRemove = useCallback(
    (role: AdminRoleDto) => {
      setMenuOpenFor(null);
      setPendingDeleteRole(role);
    },
    []
  );

  const executeDelete = useCallback(
    async () => {
      if (!pendingDeleteRole) return;
      const admins =
        typeof pendingDeleteRole._count?.adminUsers === 'number'
          ? pendingDeleteRole._count.adminUsers
          : 0;
      if (admins > 0) return;
      try {
        await deleteMutation.mutateAsync({ id: pendingDeleteRole.id });
        setPendingDeleteRole(null);
      } catch (e: unknown) {
        const msg = axios.isAxiosError(e)
          ? (e.response?.data as { error?: { message?: string } })?.error?.message
          : String(e);
        toast.error(msg ?? 'Failed to delete.');
      }
    },
    [deleteMutation, pendingDeleteRole]
  );

  const columns = useMemo((): DataTableColumn<RoleTableRow>[] => {
    return [
      {
        id: 'index',
        header: '#',
        cellClassName: 'w-11 tabular-nums text-gray-500 text-center font-medium',
        headerClassName: 'text-center',
        cell: (row) => (row.__placeholder ? '' : row.__displayIndex ?? ''),
      },
      {
        id: 'role',
        header: 'Role',
        cell: (row) => (
          row.__placeholder ? (
            <span className="block h-5" aria-hidden />
          ) : (
          <div className="min-w-0">
            <div className="font-medium text-gray-900">{row.name}</div>
          </div>
          )
        ),
      },
      {
        id: 'code',
        header: 'Code',
        cellClassName: 'font-mono text-[12px] text-gray-600',
        cell: (row) =>
          row.__placeholder ? <span className="block h-5" aria-hidden /> : row.code,
      },
      {
        id: 'permissions',
        header: 'Permissions',
        cell: (row) => (
          row.__placeholder ? (
            <span className="block h-5" aria-hidden />
          ) : (
          <span className="font-mono text-[12px] leading-snug text-gray-600 line-clamp-2 max-w-xl">
            {summarizePermissions(row.permissions, 4)}
          </span>
          )
        ),
      },
      {
        id: 'admins',
        header: 'Admins',
        cell: (row) => (
          row.__placeholder ? (
            <span className="block h-5" aria-hidden />
          ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[12px] font-medium text-gray-700 tabular-nums">
            <UsersRound size={13} className="text-gray-400" aria-hidden />
            {typeof row._count?.adminUsers === 'number' ? row._count.adminUsers : '—'}
          </span>
          )
        ),
      },
      {
        id: 'updated',
        header: 'Updated',
        cellClassName: 'whitespace-nowrap text-gray-600 text-[13px]',
        cell: (row) => (row.__placeholder ? '' : formatDate(row.updatedAt)),
      },
      {
        id: 'actions',
        header: 'Actions',
        align: 'right',
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        cell: (row) => (
          row.__placeholder ? null : (
          <div className="relative inline-flex justify-end">
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              onClick={() => setMenuOpenFor(menuOpenFor === row.id ? null : row.id)}
              aria-expanded={menuOpenFor === row.id}
              aria-label="Open menu"
              disabled={(!canRead && !canUpdate && !canDelete) || deleteMutation.isPending}
            >
              <MoreHorizontal size={18} strokeWidth={2} aria-hidden />
            </button>
            {menuOpenFor === row.id ? (
              <div
                className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                role="menu"
              >
                {canRead ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpenFor(null);
                      openView(row);
                    }}
                  >
                    <Eye size={14} className="text-gray-400" aria-hidden />
                    View
                  </button>
                ) : null}
                {canUpdate ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpenFor(null);
                      openEdit(row);
                    }}
                  >
                    <PencilLine size={14} className="text-gray-400" aria-hidden />
                    Edit
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-red-600 hover:bg-red-50"
                    disabled={deleteMutation.isPending}
                    onClick={() => confirmRemove(row)}
                  >
                    <Trash2 size={14} aria-hidden />
                    Delete
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          )
        ),
      },
    ];
  }, [
    canDelete,
    canRead,
    canUpdate,
    deleteMutation.isPending,
    menuOpenFor,
    openView,
    openEdit,
    confirmRemove,
  ]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <header className="min-w-0 max-w-2xl">
          <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
            <span className="text-gray-400" aria-hidden>
              •{' '}
            </span>
            Role registry
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-[1.65rem] sm:leading-snug">
            Roles &amp; permissions
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            View and manage permission bundles and administrator access. Changes apply on the next sign-in.
          </p>
        </header>
        {canCreate ? (
          <Link
            to={ROUTE_PATHS.ADMIN_ROLE_CREATE}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
          >
            <Plus size={16} strokeWidth={2} aria-hidden />
            Create role
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200/85 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900">Total roles</p>
              <p className="mt-1 text-xs font-normal text-gray-500">All permission bundles</p>
            </div>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
            <ArrowUpRight size={12} strokeWidth={2} aria-hidden />
            {stats.assignedRoles} in use
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-gray-900">
            {rolesQuery.isLoading ? '—' : stats.total}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200/85 bg-white p-5 shadow-sm">
          <p className="text-[13px] font-semibold text-gray-900">New this month</p>
          <p className="mt-1 text-xs text-gray-500">Roles created recently</p>
          <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-gray-900">
            {rolesQuery.isLoading ? '—' : stats.newThisMonth}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200/85 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-[13px] font-semibold text-gray-900">Admin seats</p>
          <p className="mt-1 text-xs text-gray-500">Total role assignments</p>
          <p className="mt-4 text-3xl font-semibold tabular-nums tracking-tight text-gray-900">
            {rolesQuery.isLoading ? '—' : stats.totalAdminSeats}
          </p>
        </div>
      </div>

      <DataTable<RoleTableRow>
        className="rounded-2xl border-gray-200/90 shadow-sm"
        registryThead
        searchWide
        toolbarLeading={
          <>
            <button type="button" className={tabPillClass(roleTab === 'all')} onClick={() => setRoleTab('all')}>
              All roles ({stats.total})
            </button>
            <button
              type="button"
              className={tabPillClass(roleTab === 'assigned')}
              onClick={() => setRoleTab('assigned')}
            >
              In use ({stats.assignedRoles})
            </button>
            <button
              type="button"
              className={tabPillClass(roleTab === 'unassigned')}
              onClick={() => setRoleTab('unassigned')}
            >
              Unassigned ({stats.unassignedRoles})
            </button>
          </>
        }
        columns={columns}
        data={pagedRows}
        getRowKey={(row) => row.id}
        isLoading={rolesQuery.isLoading}
        loadingLabel="Loading roles…"
        error={
          rolesQuery.isError ? (
            <span>
              Unable to load roles. Check session and{' '}
              <code className="rounded bg-gray-100 px-1 text-xs">VITE_API_URL</code>.
            </span>
          ) : undefined
        }
        search={{
          value: tableSearch,
          onChange: setTableSearch,
          placeholder: 'Search roles…',
        }}
        empty={
          tableSearch.trim()
            ? 'No roles match your search.'
            : roleTab !== 'all'
              ? 'No roles in this filter.'
              : 'No roles yet. Create a role if you have permission, or seed SUPER_ADMIN via CLI.'
        }
        pagination={{
          page: currentPage,
          pageCount,
          onPageChange: setPage,
          summary:
            filteredRoles.length > 0
              ? `${(currentPage - 1) * TABLE_PAGE_SIZE + 1}-${Math.min(currentPage * TABLE_PAGE_SIZE, filteredRoles.length)} of ${filteredRoles.length}`
              : '0 roles',
        }}
      />

      {menuOpenFor ? (
        <button
          type="button"
          className="fixed inset-0 z-[34] cursor-default bg-transparent"
          aria-label="Dismiss menu"
          onClick={() => setMenuOpenFor(null)}
        />
      ) : null}

      {pendingDeleteRole ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-[15px] font-semibold text-gray-900">Delete role</h3>
            </div>
            <div className="px-5 py-4">
              {typeof pendingDeleteRole._count?.adminUsers === 'number' &&
              pendingDeleteRole._count.adminUsers > 0 ? (
                <p className="text-[13px] leading-relaxed text-gray-600">
                  This role has {pendingDeleteRole._count.adminUsers} admin(s). Reassign them before deleting this role.
                </p>
              ) : (
                <p className="text-[13px] leading-relaxed text-gray-600">
                  Delete role "{pendingDeleteRole.code}" ({pendingDeleteRole.name})? This action cannot be undone.
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setPendingDeleteRole(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-3 text-[13px] font-medium text-white hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => void executeDelete()}
                disabled={
                  deleteMutation.isPending ||
                  (typeof pendingDeleteRole._count?.adminUsers === 'number' &&
                    pendingDeleteRole._count.adminUsers > 0)
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
