import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { createDailyVisit, CreateDailyVisitPayload } from '../api/dailyVisitsApi';
import { toast } from 'sonner';
import { fetchBatches } from '../../Batches/api/batchesApi';

interface DailyVisitCreateModalProps {
  onClose: () => void;
}

export default function DailyVisitCreateModal({ onClose }: DailyVisitCreateModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    batchId: '',
    visitDate: new Date().toISOString().split('T')[0],
    mortalityToday: '0',
    cullsToday: '0',
    weakBirdsToday: '0',
    ownUseToday: '0',
    approxWeightKg: '0',
    feedUsedKg: '0',
    feedBagsUsed: '0',
    remarks: '',
    notifyDoctor: false,
  });

  const { data: batches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ['batches'],
    queryFn: () => fetchBatches(),
  });

  // Filter batches to only progress ones
  const activeBatches = batches.filter((b) => b.status === 'PROGRESS');

  const mutation = useMutation({
    mutationFn: createDailyVisit,
    onSuccess: () => {
      toast.success('Daily visit records logged and flock numbers updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['daily-visits'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to save daily visit.';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchId) {
      toast.error('Please select an active flock batch.');
      return;
    }

    mutation.mutate({
      batchId: formData.batchId,
      visitDate: formData.visitDate,
      mortalityToday: parseInt(formData.mortalityToday, 10),
      cullsToday: parseInt(formData.cullsToday, 10),
      weakBirdsToday: parseInt(formData.weakBirdsToday, 10),
      ownUseToday: parseInt(formData.ownUseToday, 10),
      approxWeightKg: parseFloat(formData.approxWeightKg),
      feedUsedKg: parseFloat(formData.feedUsedKg),
      feedBagsUsed: parseInt(formData.feedBagsUsed, 10),
      remarks: formData.remarks.trim() || undefined,
      notifyDoctor: formData.notifyDoctor,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Log Daily Farm Visit</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Batch *
              </label>
              <select
                required
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              >
                <option value="">-- Choose Active Batch --</option>
                {isLoadingBatches ? (
                  <option disabled>Loading batches...</option>
                ) : (
                  activeBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchNo}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Date *
              </label>
              <input
                type="date"
                required
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100 my-2" />
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Flock Adjustments</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Mortality Today *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.mortalityToday}
                onChange={(e) => setFormData({ ...formData, mortalityToday: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Culls Today *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.cullsToday}
                onChange={(e) => setFormData({ ...formData, cullsToday: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Weak Birds Today *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.weakBirdsToday}
                onChange={(e) => setFormData({ ...formData, weakBirdsToday: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Own Use Today *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.ownUseToday}
                onChange={(e) => setFormData({ ...formData, ownUseToday: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100 my-2" />
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Flock Operations</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Approx Avg Weight (kg) *
              </label>
              <input
                type="number"
                step="0.001"
                required
                min="0"
                value={formData.approxWeightKg}
                onChange={(e) => setFormData({ ...formData, approxWeightKg: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
                placeholder="0.000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Feed Used (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                min="0"
                value={formData.feedUsedKg}
                onChange={(e) => setFormData({ ...formData, feedUsedKg: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Feed Bags Used *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.feedBagsUsed}
                onChange={(e) => setFormData({ ...formData, feedBagsUsed: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks / Observations
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="E.g., birds are active, minor coughing observed..."
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="notifyDoctor"
              checked={formData.notifyDoctor}
              onChange={(e) => setFormData({ ...formData, notifyDoctor: e.target.checked })}
              className="rounded border-gray-300 text-[#00A859] focus:ring-[#00A859]"
            />
            <label htmlFor="notifyDoctor" className="text-sm font-medium text-gray-700">
              Flag health issue / Notify Veterinary Doctor
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
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
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Log Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
