import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, ClipboardList, Eye } from 'lucide-react';
import { fetchDailyVisits } from '../api/dailyVisitsApi';

export default function DailyVisitsPage() {
  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['daily-visits'],
    queryFn: fetchDailyVisits,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="text-[#00A859]" /> Daily Visits
          </h1>
          <p className="text-sm text-gray-400 font-normal mt-1">
            Track daily flock health, mortality, and feed usage.
          </p>
        </div>
        
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00A859] hover:bg-[#008F4B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
          <Plus size={16} />
          Log Visit
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
            placeholder="Search by batch ID..."
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                <th className="px-6 py-4">Batch ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Mortality Today</th>
                <th className="px-6 py-4 text-center">Feed Used (kg)</th>
                <th className="px-6 py-4 text-center">Avg Weight (g)</th>
                <th className="px-6 py-4">Supervisor</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading visits...</td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">No daily visits recorded yet.</td>
                </tr>
              ) : (
                visits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{visit.batchId.substring(0, 8)}...</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(visit.visitedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-red-500">{visit.mortalityToday}</td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700">{visit.feedUsed || '-'}</td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700">{visit.approxWeight || '-'}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{visit.supervisorId.substring(0, 8)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <Eye size={16} />
                      </button>
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
