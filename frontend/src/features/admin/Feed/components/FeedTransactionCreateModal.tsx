import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { fetchFeedStock, createFeedTransaction, FeedStock } from '../api/feedApi';
import { fetchBatches } from '../../Batches/api/batchesApi';
import { toast } from 'sonner';

interface FeedTransactionCreateModalProps {
  onClose: () => void;
  defaultFeedStockId?: string;
  defaultType?: 'ISSUE' | 'RETURN' | 'RESTOCK';
  defaultBatchId?: string;
}

export default function FeedTransactionCreateModal({
  onClose,
  defaultFeedStockId,
  defaultType = 'ISSUE',
  defaultBatchId,
}: FeedTransactionCreateModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    feedStockId: defaultFeedStockId || '',
    type: defaultType,
    batchId: defaultBatchId || '',
    quantityKg: '',
    numberOfBags: '',
    category: 'GODOWN' as 'GODOWN' | 'TMS_IN' | 'RETURN' | 'TRANSFER_OUT' | 'CONSUMPTION',
    notes: '',
  });

  const { data: feedStock = [], isLoading: isLoadingStock } = useQuery<FeedStock[]>({
    queryKey: ['feed-stock'],
    queryFn: fetchFeedStock,
  });

  const { data: batchesObj } = useQuery({
    queryKey: ['batches'],
    queryFn: () => fetchBatches(),
  });

  const batches = batchesObj || [];
  const activeBatches = batches.filter((b: any) => b.status === 'PROGRESS');

  useEffect(() => {
    if (feedStock.length > 0 && !formData.feedStockId) {
      setFormData((prev) => ({ ...prev, feedStockId: feedStock[0].id }));
    }
  }, [feedStock, formData.feedStockId]);

  // Sync category based on type
  useEffect(() => {
    if (formData.type === 'RESTOCK') {
      setFormData((prev) => ({ ...prev, category: 'GODOWN' }));
    } else if (formData.type === 'ISSUE') {
      setFormData((prev) => ({ ...prev, category: 'CONSUMPTION' }));
    } else if (formData.type === 'RETURN') {
      setFormData((prev) => ({ ...prev, category: 'RETURN' }));
    }
  }, [formData.type]);

  const mutation = useMutation({
    mutationFn: createFeedTransaction,
    onSuccess: () => {
      toast.success('Feed transaction logged successfully.');
      queryClient.invalidateQueries({ queryKey: ['feed-stock'] });
      queryClient.invalidateQueries({ queryKey: ['feed-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['batchFeed'] });
      queryClient.invalidateQueries({ queryKey: ['batchSummary'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to save transaction.';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.feedStockId || !formData.quantityKg) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const payload: any = {
      feedStockId: formData.feedStockId,
      type: formData.type,
      quantityKg: parseFloat(formData.quantityKg),
      numberOfBags: formData.numberOfBags ? parseInt(formData.numberOfBags, 10) : 0,
      category: formData.category,
      notes: formData.notes.trim() || undefined,
    };

    if (formData.type === 'ISSUE' || formData.type === 'RETURN') {
      if (!formData.batchId) {
        toast.error('Please select a batch.');
        return;
      }
      payload.batchId = formData.batchId;
    }

    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Log Feed Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-left">
          {/* Feed Stock Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feed Type *</label>
            {isLoadingStock ? (
              <div className="text-xs text-gray-400">Loading feed stock types...</div>
            ) : (
              <select
                value={formData.feedStockId}
                onChange={(e) => setFormData({ ...formData, feedStockId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
                required
              >
                {feedStock.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.feedType} (Available: {s.quantityKg.toLocaleString()} kg)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['ISSUE', 'RETURN', 'RESTOCK'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    formData.type === type
                      ? 'bg-[#E6F8ED] border-[#00A859] text-[#00A859]'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Batch Selector (Conditional for Issue/Return) */}
          {(formData.type === 'ISSUE' || formData.type === 'RETURN') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Active Flock Batch *</label>
              <select
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
                required
              >
                <option value="">Select a batch</option>
                {activeBatches.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNo} ({b.farmId?.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Kg) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={formData.quantityKg}
                onChange={(e) => setFormData({ ...formData, quantityKg: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bags</label>
              <input
                type="number"
                min="0"
                value={formData.numberOfBags}
                onChange={(e) => setFormData({ ...formData, numberOfBags: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
                placeholder="e.g. 10"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
            >
              <option value="GODOWN">Godown / Warehouse</option>
              <option value="TMS_IN">TMS In</option>
              <option value="RETURN">Return</option>
              <option value="TRANSFER_OUT">Transfer Out</option>
              <option value="CONSUMPTION">Consumption</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="Add optional notes..."
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#00A859] hover:bg-[#008F4B] rounded-xl transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Save Transaction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
