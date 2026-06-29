import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import SellerTable from './components/SellerTable';
import SellerDetailsModal from './components/SellerDetailsModal';
import { deleteSeller, fetchSellers, getSellerApiErrorMessage } from '../api/sellersApi';
import {
  ROUTE_PATHS,
  adminSellerEditPath,
} from '../../../../config/routes';

const QUERY_SELLERS = ['adminSellers', 'list'];

export default function SellersPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tableSearch, setTableSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [viewedSeller, setViewedSeller] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const sellersQuery = useQuery({
    queryKey: QUERY_SELLERS,
    queryFn: fetchSellers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSeller,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QUERY_SELLERS });
      toast.success('Seller deleted successfully');
      setPendingDelete(null);
    },
    onError: (err) => {
      toast.error(getSellerApiErrorMessage(err, 'Unable to delete seller'));
    },
  });

  const filteredSellers = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    const list = sellersQuery.data ?? [];
    if (!q) return list;
    return list.filter((s) => {
      const phone = `${s.phoneCode}${s.phoneNumber}`.toLowerCase();
      return (
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        phone.includes(q.replace(/\s/gu, ''))
      );
    });
  }, [sellersQuery.data, tableSearch]);

  const executeDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id);
  };

  const handleViewSeller = (seller) => {
    setViewedSeller(seller);
    setDetailsModalOpen(true);
  };

  const handleEditSeller = (seller) => {
    navigate(adminSellerEditPath(seller.id));
  };

  return (
    <div className="animate-in fade-in space-y-6 duration-300 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <header className="min-w-0 max-w-2xl">
          <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
            <span className="text-gray-400" aria-hidden>
              •{' '}
            </span>
            Seller registry
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#1C1C1C] sm:text-[1.65rem] sm:leading-snug">
            Sellers
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            View and manage sellers on the platform. Create new sellers or update existing records.
          </p>
        </header>
        <Link
          to={ROUTE_PATHS.ADMIN_SELLER_CREATE}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1C1C1C] px-4 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-black/90"
        >
          <Plus size={16} strokeWidth={2} aria-hidden />
          Create Seller
        </Link>
      </div>

      <SellerTable
        sellers={filteredSellers}
        isLoading={sellersQuery.isLoading}
        searchValue={tableSearch}
        onSearchChange={setTableSearch}
        onView={handleViewSeller}
        onEdit={handleEditSeller}
        onDelete={setPendingDelete}
      />

      {/* Seller Details Modal */}
      <SellerDetailsModal
        seller={viewedSeller}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onEdit={handleEditSeller}
      />

      {pendingDelete ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-100 px-5 py-4">
              <h3 className="text-[15px] font-semibold text-gray-900">Delete seller</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-[13px] leading-relaxed text-gray-600">
                Delete seller &quot;{pendingDelete.firstName} {pendingDelete.lastName}&quot;? This
                action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-3 text-[13px] font-medium text-white hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
                onClick={() => void executeDelete()}
                disabled={deleteMutation.isPending}
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
