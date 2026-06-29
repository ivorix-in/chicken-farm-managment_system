import { useEffect, useMemo, useState } from 'react';
import { Eye, PencilLine, Trash2, MoreVertical } from 'lucide-react';
import { DataTable, ActionMenu } from '../../../../../shared/components/core';
import { formatSellerPhone } from '../../types/seller';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;


/** Reusable sellers registry table (list page only). */
export default function SellerTable({
  sellers,
  isLoading,
  searchValue,
  onSearchChange,
  onView,
  onEdit,
  onDelete,
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const pageCount = Math.max(1, Math.ceil(sellers.length / pageSize) || 1);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    setPage(1);
  }, [searchValue, pageSize]);

  const pagedSellers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sellers.slice(start, start + pageSize);
  }, [sellers, page, pageSize]);

  const columns = useMemo(() => {
    return [
      {
        id: 'firstName',
        header: 'First Name',
        cell: (row) => (
          <span className="font-medium text-[#1C1C1C]">{row.firstName}</span>
        ),
      },
      {
        id: 'lastName',
        header: 'Last Name',
        cell: (row) => <span className="text-[#1C1C1C]">{row.lastName}</span>,
      },
      {
        id: 'country',
        header: 'Country',
        cell: (row) => <span className="text-gray-600">{row.country}</span>,
      },
      {
        id: 'phone',
        header: 'Phone Number',
        cell: (row) => (
          <span className="tabular-nums text-gray-600">{formatSellerPhone(row)}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Action',
        align: 'right',
        headerClassName: 'text-right',
        cellClassName: 'text-right',
        cell: (row) => (
          <ActionMenu
            trigger={<MoreVertical size={16} strokeWidth={2} aria-hidden="true" />}
            items={[
              {
                label: 'View',
                icon: <Eye size={14} aria-hidden="true" />,
                onClick: () => onView(row),
              },
              {
                label: 'Edit',
                icon: <PencilLine size={14} aria-hidden="true" />,
                onClick: () => onEdit(row),
              },
              {
                label: 'Delete',
                icon: <Trash2 size={14} aria-hidden="true" />,
                danger: true,
                onClick: () => onDelete(row),
              },
            ]}
          />
        ),
      },
    ];
  }, [onDelete, onEdit, onView]);

  return (
    <DataTable
      className="rounded-2xl border-gray-200/90 shadow-sm"
      registryThead
      searchWide
      title="Current Sellers"
      columns={columns}
      data={pagedSellers}
      getRowKey={(row) => row.id}
      isLoading={isLoading}
      loadingLabel="Loading sellers…"
      search={{
        value: searchValue,
        onChange: onSearchChange,
        placeholder: 'Search sellers by name, country, or phone…',
      }}
      pagination={{
        variant: 'modern',
        page,
        pageCount,
        onPageChange: setPage,
        pageSize,
        pageSizeOptions: PAGE_SIZE_OPTIONS,
        onPageSizeChange: setPageSize,
        totalItems: sellers.length,
      }}
      empty={
        searchValue.trim()
          ? 'No sellers match your search.'
          : 'No sellers yet. Create your first seller to get started.'
      }
    />
  );
}
