import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { createBatch } from '../api/batchesApi';
import { fetchFarms } from '../../Farms/api/farmsApi';

interface BatchCreateModalProps {
  onClose: () => void;
}

export default function BatchCreateModal({ onClose }: BatchCreateModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    farmId: '',
    batchNo: '',
    chickCount: '',
    placementDate: new Date().toISOString().split('T')[0],
  });

  const { data: farms = [], isLoading: isLoadingFarms } = useQuery({
    queryKey: ['farms'],
    queryFn: fetchFarms,
  });

  const mutation = useMutation({
    mutationFn: createBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.farmId || !formData.batchNo || !formData.chickCount || !formData.placementDate) return;
    
    mutation.mutate({
      farmId: formData.farmId,
      batchNo: formData.batchNo,
      chickCount: parseInt(formData.chickCount, 10),
      placementDate: formData.placementDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Start New Batch</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mutation.isError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              Failed to create batch. Please check your inputs.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Farm
            </label>
            <select
              required
              disabled={isLoadingFarms}
              value={formData.farmId}
              onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
            >
              <option value="">-- Choose a farm --</option>
              {farms.map((farm) => {
                const farmerName = typeof farm.farmerId === 'object' && farm.farmerId 
                  ? (farm.farmerId as any).name 
                  : 'N/A';
                return (
                  <option key={farm.id} value={farm.id}>
                    {farm.name} — Farmer: {farmerName} (Capacity: {farm.capacity})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number
            </label>
            <input
              type="text"
              required
              value={formData.batchNo}
              onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="e.g. B-2026-07-01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chick Count
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.chickCount}
              onChange={(e) => setFormData({ ...formData, chickCount: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="Number of chicks placed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placement Date
            </label>
            <input
              type="date"
              required
              value={formData.placementDate}
              onChange={(e) => setFormData({ ...formData, placementDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
            />
          </div>

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
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Start Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
