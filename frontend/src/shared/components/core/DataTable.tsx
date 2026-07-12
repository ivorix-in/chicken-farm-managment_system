import type { ButtonHTMLAttributes, ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Circle,
  Search,
  XCircle,
} from 'lucide-react';
/**
 * Semantic table shell: toolbar (title, search, actions), sortable headers, optional row
 * selection, pagination, status badges. Compose column `cell` for payment icons, actions, etc.
 */
/** Column definition — use `cell` for row content, optional sorting + alignment. */
export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  cell: (row: T, rowIndex: number) => ReactNode;
};

export type DataTableSelection<T> = {
  isRowSelected: (row: T) => boolean;
  onRowToggle: (row: T) => void;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
  onSelectAllToggle?: () => void;
};

export type DataTablePagination = {
  /** 1-based current page */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Optional left-side summary */
  summary?: ReactNode;
  /** `modern` — reference-style footer with « ‹ › », blue active page, page-size select */
  variant?: 'default' | 'modern';
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
};

export type DataTableProps<T> = {
  /** Shown top-left in toolbar row */
  title?: ReactNode;
  /** Filter tabs, chips, etc. — rendered before the search field (registry-style toolbars). */
  toolbarLeading?: ReactNode;
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T, index: number) => string;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  /** Wider search input for data-heavy pages (default `sm:max-w-xs`). */
  searchWide?: boolean;
  /** Stronger thead styling (uppercase-friendly, light gray header row). */
  registryThead?: boolean;
  /** Renders right side of toolbar (Filters, primary CTA, etc.) */
  toolbarEnd?: ReactNode;
  selection?: DataTableSelection<T>;
  pagination?: DataTablePagination;
  isLoading?: boolean;
  loadingLabel?: string;
  error?: ReactNode;
  empty?: ReactNode;
  className?: string;
};

function alignClass(align: DataTableColumn<unknown>['align']) {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return 'text-left';
}

function paginationRange(
  currentPage: number,
  pageCount: number
): (number | 'ellipsis')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const out: (number | 'ellipsis')[] = [];
  const push = (p: number) => {
    if (out[out.length - 1] !== p) out.push(p);
  };
  push(1);
  if (currentPage > 3) out.push('ellipsis');
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(pageCount - 1, currentPage + 1);
  for (let p = start; p <= end; p++) push(p);
  if (currentPage < pageCount - 2) out.push('ellipsis');
  push(pageCount);
  return out;
}

/** Reference-style page list: 1 2 3 4 5 … last (when on early pages). */
function paginationRangeModern(
  currentPage: number,
  pageCount: number
): (number | 'ellipsis')[] {
  if (pageCount <= 1) return [1];
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, 'ellipsis', pageCount];
  }
  if (currentPage >= pageCount - 2) {
    const tail: number[] = [];
    for (let p = Math.max(2, pageCount - 4); p <= pageCount; p++) tail.push(p);
    return [1, 'ellipsis', ...tail];
  }
  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', pageCount];
}

function modernPageBtnClass(active: boolean) {
  return active
    ? 'min-w-8 h-8 rounded-md border border-blue-600 bg-blue-600 px-2 text-[13px] font-medium text-white shadow-sm'
    : 'min-w-8 h-8 rounded-md border border-gray-200 bg-white px-2 text-[13px] font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40';
}

function modernNavBtnClass() {
  return 'inline-flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40';
}

export type DataTableStatusVariant = 'pending' | 'completed' | 'failed' | 'neutral';

type DataTableStatusBadgeProps = {
  variant: DataTableStatusVariant;
  children: ReactNode;
  className?: string;
};

/** Status pill with icon — matches common transaction / workflow tables. */
export function DataTableStatusBadge({
  variant,
  children,
  className = '',
}: DataTableStatusBadgeProps) {
  const cfg = {
    pending: {
      wrap: 'text-amber-700 bg-amber-50',
      Icon: AlertTriangle,
    },
    completed: {
      wrap: 'text-emerald-700 bg-emerald-50',
      Icon: CheckCircle2,
    },
    failed: {
      wrap: 'text-red-700 bg-red-50',
      Icon: XCircle,
    },
    neutral: {
      wrap: 'text-gray-600 bg-gray-100',
      Icon: Circle,
    },
  } as const;
  const { wrap, Icon } = cfg[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium leading-none ${wrap} ${className}`}
    >
      <Icon size={14} strokeWidth={2} className="shrink-0 opacity-90" aria-hidden />
      {children}
    </span>
  );
}

export function DataTable<T>({
  title,
  toolbarLeading,
  columns,
  data,
  getRowKey,
  search,
  searchWide = false,
  registryThead = false,
  toolbarEnd,
  selection,
  pagination,
  isLoading,
  loadingLabel = 'Loading…',
  error,
  empty,
  className = '',
}: DataTableProps<T>) {
  const showSelectCol = Boolean(selection);
  const showToolbar =
    (title !== undefined && title !== '') ||
    toolbarLeading ||
    search ||
    toolbarEnd;

  const searchWrapClass = searchWide
    ? 'relative w-full sm:max-w-md lg:max-w-lg xl:max-w-xl'
    : 'relative w-full sm:max-w-xs';

  const theadRowClass = registryThead
    ? 'border-b border-gray-200/80 bg-gray-100/95'
    : 'border-b border-gray-100 bg-gray-50/90';

  const thExtra = registryThead
    ? 'text-[11px] font-semibold uppercase tracking-wide text-gray-800 py-3.5'
    : 'py-3 font-medium text-gray-600';

  return (
    <div
      className={`flex flex-col rounded-xl border border-gray-200/80 bg-white shadow-sm ${className}`.trim()}
    >
      {showToolbar ? (
        <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
          {title !== undefined && title !== '' ? (
            <h2 className="text-[17px] font-semibold tracking-tight text-gray-900 mb-4">
              {title}
            </h2>
          ) : null}
          <div
            className={
              toolbarLeading
                ? 'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4'
                : 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
            }
          >
            {toolbarLeading ? (
              <div className="flex flex-wrap items-center gap-2 min-w-0 shrink-0">{toolbarLeading}</div>
            ) : null}
            <div
              className={
                toolbarLeading
                  ? 'flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'
                  : 'flex min-w-0 w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'
              }
            >
              {search ? (
                <div className={`${searchWrapClass} ${toolbarLeading ? 'lg:ml-auto' : ''}`}>
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={search.value}
                    onChange={(e) => search.onChange(e.target.value)}
                    placeholder={search.placeholder ?? 'Search'}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/90 py-2.5 pl-9 pr-3 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:border-gray-300 focus:bg-white"
                  />
                </div>
              ) : !toolbarLeading ? (
                <div className="hidden sm:block flex-1" />
              ) : null}
              {toolbarEnd ? (
                <div className="flex flex-wrap items-center gap-2 sm:justify-end shrink-0">{toolbarEnd}</div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        {error ? (
          <div className="px-4 py-16 text-center text-[13px] text-red-700 font-medium">{error}</div>
        ) : isLoading ? (
          <div className="px-4 py-16 text-center text-[13px] text-gray-500">{loadingLabel}</div>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <thead>
              <tr className={theadRowClass}>
                {showSelectCol ? (
                  <th scope="col" className="w-10 py-3 pl-4 pr-1 text-left">
                    {selection?.onSelectAllToggle ? (
                      <>
                        <span className="sr-only">Select all</span>
                        <button
                          type="button"
                          onClick={selection.onSelectAllToggle}
                          className="flex size-5 items-center justify-center rounded-full border border-gray-300 bg-white text-transparent hover:border-gray-400"
                          aria-pressed={selection.isAllSelected}
                        >
                          <span
                            className={`size-2.5 rounded-full ${
                              selection.isAllSelected
                                ? 'bg-gray-900'
                                : selection.isSomeSelected
                                  ? 'bg-gray-400'
                                  : 'bg-transparent'
                            }`}
                          />
                        </button>
                      </>
                    ) : (
                      <span className="sr-only">Select</span>
                    )}
                  </th>
                ) : null}
                {columns.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    className={`py-3 px-3 first:pl-4 last:pr-4 sm:px-4 ${alignClass(col.align)} ${thExtra} ${col.headerClassName ?? ''}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={col.onSort}
                        className={`inline-flex items-center gap-1.5 rounded-md px-0.5 py-0.5 text-left font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 ${alignClass(col.align)}`}
                      >
                        {col.header}
                        <ArrowUpDown size={14} className="shrink-0 text-gray-400" aria-hidden />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-900">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (showSelectCol ? 1 : 0)}
                    className="px-4 py-16 text-center text-[13px] text-gray-500"
                  >
                    {empty ?? 'No rows to display.'}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={getRowKey(row, rowIndex)}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50/60 last:border-b-0"
                  >
                    {showSelectCol ? (
                      <td className="w-10 py-3.5 pl-4 pr-1 align-middle">
                        <button
                          type="button"
                          onClick={() => selection!.onRowToggle(row)}
                          className="flex size-5 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-transparent hover:border-gray-300"
                          aria-pressed={selection!.isRowSelected(row)}
                        >
                          <span
                            className={`size-2.5 rounded-full ${
                              selection!.isRowSelected(row) ? 'bg-gray-800' : 'bg-transparent'
                            }`}
                          />
                        </button>
                      </td>
                    ) : null}
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className={`py-3.5 px-3 align-middle first:pl-4 last:pr-4 sm:px-4 ${alignClass(col.align)} ${col.cellClassName ?? ''}`}
                      >
                        {col.cell(row, rowIndex)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {pagination && !error && !isLoading
        ? (() => {
            const isModern = pagination.variant === 'modern';
            const total =
              pagination.totalItems ?? data.length + (pagination.page - 1) * (pagination.pageSize ?? 10);
            const pageSize = pagination.pageSize ?? 10;
            const showFooter = isModern ? true : pagination.pageCount > 1;
            if (!showFooter) return null;

            const start = total === 0 ? 0 : (pagination.page - 1) * pageSize + 1;
            const end = Math.min(pagination.page * pageSize, total);
            const range = isModern
              ? paginationRangeModern(pagination.page, pagination.pageCount)
              : paginationRange(pagination.page, pagination.pageCount);

            if (isModern) {
              return (
                <div className="mt-auto shrink-0 border-t border-gray-200/80 bg-gray-50/40 px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-3">
                    <p className="text-[13px] text-gray-500 lg:justify-self-start">
                      {pagination.summary ??
                        `Showing ${start} to ${end} of ${total} results`}
                    </p>
                    <nav
                      className="flex flex-wrap items-center justify-center gap-1 lg:justify-self-center"
                      aria-label="Pagination"
                    >
                      <button
                        type="button"
                        disabled={pagination.page <= 1}
                        onClick={() => pagination.onPageChange(1)}
                        className={modernNavBtnClass()}
                        aria-label="First page"
                      >
                        <ChevronsLeft size={15} strokeWidth={2} aria-hidden />
                      </button>
                      <button
                        type="button"
                        disabled={pagination.page <= 1}
                        onClick={() => pagination.onPageChange(pagination.page - 1)}
                        className={modernNavBtnClass()}
                        aria-label="Previous page"
                      >
                        <ChevronLeft size={15} strokeWidth={2} aria-hidden />
                      </button>
                      {range.map((item, i) => {
                        if (item === 'ellipsis') {
                          return (
                            <span
                              key={`e-${i}`}
                              className="flex min-w-8 items-center justify-center px-1 text-[13px] text-gray-400"
                              aria-hidden
                            >
                              …
                            </span>
                          );
                        }
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => pagination.onPageChange(item)}
                            className={modernPageBtnClass(item === pagination.page)}
                            aria-current={item === pagination.page ? 'page' : undefined}
                          >
                            {item}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        disabled={pagination.page >= pagination.pageCount}
                        onClick={() => pagination.onPageChange(pagination.page + 1)}
                        className={modernNavBtnClass()}
                        aria-label="Next page"
                      >
                        <ChevronRight size={15} strokeWidth={2} aria-hidden />
                      </button>
                      <button
                        type="button"
                        disabled={pagination.page >= pagination.pageCount}
                        onClick={() => pagination.onPageChange(pagination.pageCount)}
                        className={modernNavBtnClass()}
                        aria-label="Last page"
                      >
                        <ChevronsRight size={15} strokeWidth={2} aria-hidden />
                      </button>
                    </nav>
                    {pagination.onPageSizeChange && pagination.pageSizeOptions?.length ? (
                      <div className="flex justify-center lg:justify-self-end">
                        <label className="sr-only" htmlFor="data-table-page-size">
                          Rows per page
                        </label>
                        <select
                          id="data-table-page-size"
                          value={pageSize}
                          onChange={(e) => pagination.onPageSizeChange!(Number(e.target.value))}
                          className="h-8 min-w-[7.5rem] cursor-pointer appearance-none rounded-md border border-gray-200 bg-white bg-[length:12px] bg-[right_0.5rem_center] bg-no-repeat py-1 pl-3 pr-8 text-[13px] font-medium text-gray-700 shadow-sm outline-none transition-colors hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          }}
                        >
                          {pagination.pageSizeOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt} / page
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="hidden lg:block" aria-hidden />
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                {pagination.summary ? (
                  <div className="order-2 text-[12px] text-gray-500 sm:order-1">{pagination.summary}</div>
                ) : (
                  <div className="order-2 sm:order-1" />
                )}
                <nav
                  className="order-1 flex items-center justify-center gap-1 sm:order-2"
                  aria-label="Pagination"
                >
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => pagination.onPageChange(pagination.page - 1)}
                    className={modernNavBtnClass()}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} strokeWidth={2} aria-hidden />
                  </button>
                  {range.map((item, i) => {
                    if (item === 'ellipsis') {
                      return (
                        <span
                          key={`e-${i}`}
                          className="px-1.5 text-[13px] text-gray-400"
                          aria-hidden
                        >
                          …
                        </span>
                      );
                    }
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => pagination.onPageChange(item)}
                        className={`min-w-8 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors ${
                          item === pagination.page
                            ? 'bg-gray-200 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.pageCount}
                    onClick={() => pagination.onPageChange(pagination.page + 1)}
                    className={modernNavBtnClass()}
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} strokeWidth={2} aria-hidden />
                  </button>
                </nav>
              </div>
            );
          })()
        : null}
    </div>
  );
}

/** Secondary toolbar button — e.g. Filters */
export function DataTableToolbarButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

/** Primary toolbar CTA — e.g. Add manually */
export function DataTablePrimaryButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
