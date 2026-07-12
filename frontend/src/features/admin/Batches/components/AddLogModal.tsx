import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createDailyVisit } from '../../DailyVisits/api/dailyVisitsApi';

interface AddLogModalProps {
  batchId: string;
  onClose: () => void;
}

export default function AddLogModal({ batchId, onClose }: AddLogModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    mortalityToday: 0,
    approxWeightKg: 0,
    feedUsedKg: 0,
    remarks: '',
  });

  const mutation = useMutation({
    mutationFn: createDailyVisit,
    onSuccess: () => {
      toast.success('Daily log added successfully');
      queryClient.invalidateQueries({ queryKey: ['batchVisits', batchId] });
      queryClient.invalidateQueries({ queryKey: ['batchSummary', batchId] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to add log');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      batchId,
      visitDate: formData.visitDate,
      mortalityToday: Number(formData.mortalityToday),
      approxWeightKg: Number(formData.approxWeightKg),
      feedUsedKg: Number(formData.feedUsedKg),
      remarks: formData.remarks,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Add Daily Log</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Visit Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <input
                type="date"
                required
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mortality Today</label>
              <input
                type="number"
                min="0"
                required
                value={formData.mortalityToday}
                onChange={(e) => setFormData({ ...formData, mortalityToday: Number(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Avg Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.approxWeightKg}
                onChange={(e) => setFormData({ ...formData, approxWeightKg: Number(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Feed Used (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              value={formData.feedUsedKg}
              onChange={(e) => setFormData({ ...formData, feedUsedKg: Number(e.target.value) })}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks</label>
            <textarea
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] resize-none"
              placeholder="Any notes for today's visit..."
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#00A859] hover:bg-[#008F4B] rounded-xl transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
