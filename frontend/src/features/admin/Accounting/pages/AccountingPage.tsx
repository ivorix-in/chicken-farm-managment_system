import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ArrowUpRight, ArrowDownRight, Calculator } from 'lucide-react';
import { fetchTransactions, Transaction } from '../api/accountingApi';
import TransactionCreateModal from '../components/TransactionCreateModal';
import { format } from 'date-fns';

export default function AccountingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Calculator className="text-[#00A859]" size={28} />
            Accounting Ledger
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Record and track all your farm income and expenses.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00A859] hover:bg-[#008F4B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} />
          Record Transaction
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Type</th>
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right pr-6">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No transactions recorded yet. Click 'Record Transaction' to add one.
                  </td>
                </tr>
              ) : (
                transactions.map((tx: Transaction) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-medium text-gray-900">
                      {format(new Date(tx.date), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4">
                      {tx.type === 'INCOME' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <ArrowUpRight size={14} /> Income
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          <ArrowDownRight size={14} /> Expense
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">
                      {tx.category.replace('_', ' ')}
                    </td>
                    <td className="p-4 text-gray-600 truncate max-w-xs">
                      {tx.description}
                    </td>
                    <td className={`p-4 text-right pr-6 font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && <TransactionCreateModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
