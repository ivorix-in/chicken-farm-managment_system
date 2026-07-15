import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, RefreshCcw, ArrowRightLeft, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { fetchFeedTransactions, FeedTransaction } from '../api/feedApi';
import { format } from 'date-fns';

interface FeedTransactionsHistoryModalProps {
  onClose: () => void;
}

export default function FeedTransactionsHistoryModal({ onClose }: FeedTransactionsHistoryModalProps) {
  const { data: transactions = [], isLoading, isError, refetch } = useQuery<FeedTransaction[]>({
    queryKey: ['feed-transactions'],
    queryFn: () => fetchFeedTransactions(),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="text-[#00A859]" size={20} />
            <h2 className="text-xl font-bold text-gray-900">Feed Transaction Ledger</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              title="Refresh ledger"
            >
              <RefreshCcw size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {isLoading ? (
            <div className="py-10 text-center text-gray-400 font-semibold">Loading transactions...</div>
          ) : isError ? (
            <div className="py-10 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
              Failed to load feed transaction history.
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-10 text-center text-gray-400 font-semibold">No feed transactions recorded yet.</div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                      <th className="p-4 pl-6">Date</th>
                      <th className="p-4">Feed Type</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Flock Batch</th>
                      <th className="p-4 text-right">Qty (Kg)</th>
                      <th className="p-4 text-right">Bags</th>
                      <th className="p-4">Issued By</th>
                      <th className="p-4 pr-6">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/80 text-sm">
                    {transactions.map((tx) => {
                      const feedType = typeof tx.feedStockId === 'object' ? tx.feedStockId.feedType : 'Unknown';
                      const batchNo = typeof tx.batchId === 'object' && tx.batchId ? tx.batchId.batchNo : '-';
                      
                      return (
                        <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 pl-6 font-medium text-gray-900 whitespace-nowrap">
                            {tx.issuedAt ? format(new Date(tx.issuedAt), 'MMM d, yyyy h:mm a') : '-'}
                          </td>
                          <td className="p-4 font-semibold text-gray-700">{feedType}</td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                tx.type === 'RESTOCK'
                                  ? 'bg-green-50 text-green-700'
                                  : tx.type === 'ISSUE'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {tx.type === 'RESTOCK' ? (
                                <ArrowUpRight size={12} />
                              ) : (
                                <ArrowDownRight size={12} />
                              )}
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-gray-600">{batchNo}</td>
                          <td className="p-4 text-right font-semibold text-gray-900">
                            {tx.quantityKg.toLocaleString()}
                          </td>
                          <td className="p-4 text-right text-gray-600">{tx.numberOfBags}</td>
                          <td className="p-4 text-gray-500 whitespace-nowrap">
                            {tx.issuedBy?.name || 'System'}
                          </td>
                          <td className="p-4 pr-6 text-gray-500 max-w-xs truncate" title={tx.notes || ''}>
                            {tx.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
