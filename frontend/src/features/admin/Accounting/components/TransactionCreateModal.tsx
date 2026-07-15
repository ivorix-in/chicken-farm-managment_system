import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { createTransaction, updateTransaction, Transaction, TransactionType } from '../api/accountingApi';
import { fetchBatches } from '../../Batches/api/batchesApi';
import { fetchFarms } from '../../Farms/api/farmsApi';
import { toast } from 'sonner';

interface TransactionCreateModalProps {
  onClose: () => void;
  transaction?: Transaction;
  defaultType?: TransactionType;
  allowedCategories?: string[];
}

const CATEGORIES = {
  INCOME: ['BIRD_SALES', 'MANURE_SALES', 'OTHER'],
  EXPENSE: ['FEED_PURCHASE', 'CHICK_PURCHASE', 'MEDICINE_PURCHASE', 'SALARY', 'MAINTENANCE', 'TRANSPORT', 'OTHER'],
};

export default function TransactionCreateModal({
  onClose,
  transaction,
  defaultType,
  allowedCategories,
}: TransactionCreateModalProps) {
  const isEditMode = !!transaction;
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    type: (defaultType || 'EXPENSE') as TransactionType,
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    batchId: '',
    farmId: '',
  });

  const { data: farms = [] } = useQuery({
    queryKey: ['farms'],
    queryFn: () => fetchFarms(),
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['batches'],
    queryFn: () => fetchBatches(),
  });

  useEffect(() => {
    const initialType = transaction?.type || defaultType || 'EXPENSE';
    const categoriesForType = CATEGORIES[initialType];
    const initialCategory = transaction?.category || (allowedCategories && allowedCategories.length > 0 ? allowedCategories[0] : categoriesForType[0]);

    if (transaction) {
      setFormData({
        type: transaction.type,
        category: transaction.category,
        amount: String(transaction.amount),
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: transaction.description || '',
        batchId: transaction.batchId || '',
        farmId: transaction.farmId || '',
      });
    } else {
      setFormData({
        type: initialType,
        category: initialCategory,
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        batchId: '',
        farmId: '',
      });
    }
  }, [transaction, defaultType, allowedCategories]);

  const handleTypeChange = (newType: TransactionType) => {
    const categoriesForType = CATEGORIES[newType];
    const newCategory = allowedCategories && allowedCategories.length > 0 
      ? allowedCategories.find(c => categoriesForType.includes(c)) || allowedCategories[0]
      : categoriesForType[0];

    setFormData({
      ...formData,
      type: newType,
      category: newCategory,
    });
  };

  const mutation = useMutation({
    mutationFn: (payload: Partial<Transaction>) => {
      if (isEditMode && transaction) {
        return updateTransaction(transaction.id, payload);
      } else {
        return createTransaction(payload);
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Transaction details updated successfully.' : 'New transaction logged successfully.');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pnlSummary'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to save transaction.';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    mutation.mutate({
      type: formData.type,
      category: formData.category as any,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString(),
      description: formData.description.trim(),
      batchId: formData.batchId || null as any,
      farmId: formData.farmId || null as any,
    });
  };

  const categoriesToShow = allowedCategories && allowedCategories.length > 0
    ? allowedCategories
    : CATEGORIES[formData.type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Transaction' : 'Record Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left max-h-[75vh] overflow-y-auto">
          {/* Type Toggle - Only show if not restricted by allowedCategories/defaultType */}
          {!allowedCategories && (
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
          )}

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
              {categoriesToShow.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) *
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
              Description *
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="e.g. Sold 500 birds to local vendor"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Farm (Optional)
            </label>
            <select
              value={formData.farmId}
              onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
            >
              <option value="">-- No Farm Linked --</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Batch (Optional)
            </label>
            <select
              value={formData.batchId}
              onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
            >
              <option value="">-- No Batch Linked --</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.batchNo}</option>
              ))}
            </select>
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
