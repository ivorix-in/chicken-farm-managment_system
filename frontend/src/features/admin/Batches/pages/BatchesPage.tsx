import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Activity, MoreVertical, Eye, Lock } from 'lucide-react';
import { fetchBatches } from '../api/batchesApi';

export default function BatchesPage() {
  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: fetchBatches,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="text-[#00A859]" /> Batches
          </h1>
          <p className="text-sm text-gray-400 font-normal mt-1">
            Manage your flock cycles across all farms.
          </p>
        </div>
        
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00A859] hover:bg-[#008F4B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
          <Plus size={16} />
          Start New Batch
        </button>
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
            placeholder="Search batches by ID or farm..."
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="border border-gray-200 rounded-lg text-sm py-2 px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                <th className="px-6 py-4">Batch No</th>
                <th className="px-6 py-4">Farm</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">Chicks (Start)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading batches...</td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No batches found.</td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{batch.batchNo}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">Farm {batch.farmId.substring(0, 8)}...</td>
                    <td className="px-6 py-4">
                      {batch.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6F8ED] text-[#00A859] border border-[#00A859]/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{new Date(batch.startDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{batch.chickPurchase?.quantity?.toLocaleString() || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Summary">
                          <Eye size={16} />
                        </button>
                        {batch.status === 'ACTIVE' && (
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Close Batch">
                            <Lock size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
