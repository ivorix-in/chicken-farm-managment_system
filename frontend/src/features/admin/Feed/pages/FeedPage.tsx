import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PackagePlus, Search, Package, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { fetchFeedStock } from '../api/feedApi';

export default function FeedPage() {
  const { data: feedStock = [], isLoading } = useQuery({
    queryKey: ['feed-stock'],
    queryFn: fetchFeedStock,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="text-[#00A859]" /> Feed Inventory
          </h1>
          <p className="text-sm text-gray-400 font-normal mt-1">
            Manage your feed stock, issue to farms, and log restocks.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition-all">
            <ArrowRightLeft size={16} />
            Transactions
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00A859] hover:bg-[#008F4B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
            <PackagePlus size={16} />
            New Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all"
            placeholder="Search feed types..."
          />
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-10 text-center text-gray-400 font-semibold">Loading feed inventory...</div>
        ) : feedStock.length === 0 ? (
          <div className="col-span-full py-10 text-center text-gray-400 font-semibold">No feed stock data available.</div>
        ) : (
          feedStock.map((stock) => {
            const isLow = stock.quantityKg <= stock.lowStockThresholdKg;
            return (
              <div key={stock.id} className={`bg-white rounded-2xl border ${isLow ? 'border-amber-200 bg-amber-50/20' : 'border-gray-100'} shadow-sm overflow-hidden flex flex-col`}>
                <div className="p-5 flex items-center justify-between border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${isLow ? 'bg-amber-100 text-amber-600' : 'bg-[#E6F8ED] text-[#00A859]'}`}>
                      <Package size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 tracking-tight">{stock.feedType}</h3>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Feed Type</p>
                    </div>
                  </div>
                  {isLow && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                      <AlertTriangle size={12} /> Low Stock
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-center">
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-gray-900">{stock.quantityKg.toLocaleString()}</span>
                    <span className="text-sm font-semibold text-gray-500 mb-1">kg</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Threshold</p>
                      <p className="font-semibold text-gray-700">{stock.lowStockThresholdKg.toLocaleString()} kg</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Unit Cost</p>
                      <p className="font-semibold text-gray-700">${stock.unitCostPerKg.toFixed(2)}/kg</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex gap-2">
                  <button className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50">Restock</button>
                  <button className="flex-1 py-2 bg-[#00A859] rounded-lg text-xs font-semibold text-white hover:bg-[#008F4B]">Issue</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
