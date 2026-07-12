import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { createTransaction, TransactionType } from '../api/accountingApi';

interface TransactionCreateModalProps {
  onClose: () => void;
}

const CATEGORIES = {
  INCOME: ['BIRD_SALES', 'MANURE_SALES', 'OTHER'],
  EXPENSE: ['FEED_PURCHASE', 'CHICK_PURCHASE', 'MEDICINE_PURCHASE', 'SALARY', 'MAINTENANCE', 'TRANSPORT', 'OTHER'],
};

export default function TransactionCreateModal({ onClose }: TransactionCreateModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    type: 'EXPENSE' as TransactionType,
    category: 'FEED_PURCHASE',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pnlSummary'] });
      onClose();
    },
  });

  const handleTypeChange = (newType: TransactionType) => {
    setFormData({
      ...formData,
      type: newType,
      category: CATEGORIES[newType][0],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    
    mutation.mutate({
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
      description: formData.description,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Record Transaction</h2>
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
              Failed to record transaction. Please check your inputs.
            </div>
          )}

          {/* Type Toggle */}
          <div className="flex p-1 space-x-1 bg-gray-100/80 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('INCOME')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${formData.type === 'INCOME' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('EXPENSE')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${formData.type === 'EXPENSE' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Expense
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
            >
              {CATEGORIES[formData.type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="e.g. Sold 500 birds to market"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 ${formData.type === 'INCOME' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
