import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowDownRight, Wallet, Edit2, Trash2 } from 'lucide-react';
import { fetchTransactions, deleteTransaction, Transaction } from '../api/accountingApi';
import TransactionCreateModal from '../components/TransactionCreateModal';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

const EXPENSE_CATEGORIES = ['SALARY', 'MAINTENANCE', 'TRANSPORT', 'OTHER'];

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      toast.success('Expense record has been deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['pnlSummary'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete expense record';
      toast.error(msg);
    },
  });

  const handleEdit = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedTransaction(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this expense record? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  // Filter transactions to only expenses (Expenses within general expense categories)
  const generalExpenses = transactions.filter(
    (tx) => tx.type === 'EXPENSE' && EXPENSE_CATEGORIES.includes(tx.category)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Wallet className="text-[#00A859]" size={28} />
            Expense Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track operational costs, salaries, transport, and administrative maintenance.
          </p>
        </div>
        
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00A859] hover:bg-[#008F4B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} />
          Record Expense
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Expense Category</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    Loading expenses...
                  </td>
                </tr>
              ) : generalExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No operating expenses recorded yet. Click 'Record Expense' to add one.
                  </td>
                </tr>
              ) : (
                generalExpenses.map((tx: Transaction) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-medium text-gray-900">
                      {format(new Date(tx.date), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        <ArrowDownRight size={14} /> {tx.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 truncate max-w-xs">
                      {tx.description}
                    </td>
                    <td className="p-4 text-right font-semibold text-red-600">
                      -₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Expense"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <TransactionCreateModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTransaction(undefined);
          }}
          transaction={selectedTransaction}
          defaultType="EXPENSE"
          allowedCategories={EXPENSE_CATEGORIES}
        />
      )}
    </div>
  );
}
