import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { fetchPnlSummary } from '../api/accountingApi';

export default function PnlPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['pnlSummary'],
    queryFn: fetchPnlSummary,
  });

  return (
    <div className="p-8 max-w-7xl mx-auto text-left">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profit & Loss Report</h1>
        <p className="text-sm text-gray-500 mt-1">
          High-level overview of your income, expenses, and net profit.
        </p>
      </div>

      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading summary...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Income */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-4 text-[#00A859]">
              <div className="p-3 bg-[#E6F8ED] rounded-xl">
                <TrendingUp size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-600">Total Income</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-4">
              ₹{summary?.income?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>

          {/* Total Expenses */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-4 text-red-500">
              <div className="p-3 bg-red-50 rounded-xl">
                <TrendingDown size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-600">Total Expenses</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-4">
              ₹{summary?.expenses?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>

          {/* Net Profit */}
          <div className={`bg-white rounded-2xl p-6 border ${summary?.netProfit && summary.netProfit >= 0 ? 'border-green-200 bg-green-50/20' : 'border-red-200 bg-red-50/20'} shadow-sm flex flex-col justify-between`}>
            <div className={`flex items-center gap-4 ${summary?.netProfit && summary.netProfit >= 0 ? 'text-[#00A859]' : 'text-red-500'}`}>
              <div className={`p-3 rounded-xl ${summary?.netProfit && summary.netProfit >= 0 ? 'bg-[#E6F8ED]' : 'bg-red-50'}`}>
                <IndianRupee size={24} />
              </div>
              <h2 className="text-lg font-semibold text-gray-600">Net Profit</h2>
            </div>
            <p className={`text-3xl font-bold mt-4 ${summary?.netProfit && summary.netProfit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              ₹{summary?.netProfit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Insights</h3>
        <p className="text-sm text-gray-500">
          More detailed charts and breakdowns by farm and batch will be available here soon. Use the Accounting page to add transactions.
        </p>
      </div>
    </div>
  );
}
