import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Activity, Users, AlertTriangle, Scale, ShoppingBag, Plus, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { fetchBatchSummary, fetchBatch } from '../api/batchesApi';
import { fetchBatchVisits } from '../../DailyVisits/api/dailyVisitsApi';
import { fetchFeedTransactions } from '../../Feed/api/feedApi';
import AddLogModal from '../components/AddLogModal';

export default function BatchTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);

  const { data: batch, isLoading: loadingBatch } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => fetchBatch(id!),
    enabled: !!id,
  });

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['batchSummary', id],
    queryFn: () => fetchBatchSummary(id!),
    enabled: !!id,
  });

  const { data: visits = [], isLoading: loadingVisits } = useQuery({
    queryKey: ['batchVisits', id],
    queryFn: () => fetchBatchVisits(id!),
    enabled: !!id,
  });

  const { data: feedTransactions = [], isLoading: loadingFeed } = useQuery({
    queryKey: ['batchFeed', id],
    queryFn: () => fetchFeedTransactions(id),
    enabled: !!id,
  });

  if (loadingBatch || loadingSummary || loadingVisits || loadingFeed) {
    return <div className="p-8 text-center text-gray-500">Loading batch details...</div>;
  }

  if (!summary || !batch) {
    return <div className="p-8 text-center text-red-500">Failed to load batch summary.</div>;
  }

  const TARGET_DAYS = 40;
  const progressPercent = Math.min((summary.currentAgeDays / TARGET_DAYS) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header with Farm Details */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <Link to="/admin/batches" className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 mt-1">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Batch {summary.batchNo}</h1>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${summary.status === 'ACTIVE' || summary.status === 'PLACED' ? 'bg-[#E6F8ED] text-[#00A859] border-[#00A859]/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {summary.status}
              </span>
            </div>
            
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <MapPin size={16} className="text-gray-400" />
                <span className="font-medium text-gray-700">
                  {typeof batch.farmId === 'object' && batch.farmId ? (batch.farmId as any).name : 'Unknown Farm'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <Calendar size={16} className="text-gray-400" />
                <span className="font-medium text-gray-700">
                  Placed: {new Date(batch.startDate || (batch as any).placementDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsAddLogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00A859] hover:bg-[#008F4B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap"
        >
          <Plus size={16} />
          Add Daily Log
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm & Batch Profile Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-blue-500" size={20} /> Farm Profile
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Farm Name</span>
                <span className="font-semibold text-gray-900">{typeof batch.farmId === 'object' && batch.farmId ? (batch.farmId as any).name : 'Unknown Farm'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Address</span>
                <span className="font-semibold text-gray-900 text-right max-w-[150px] truncate">{typeof batch.farmId === 'object' && batch.farmId ? (batch.farmId as any).address : '-'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Farm Capacity</span>
                <span className="font-semibold text-gray-900">{typeof batch.farmId === 'object' && batch.farmId ? (batch.farmId as any).capacity?.toLocaleString() : '-'} birds</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Supplier</span>
                <span className="font-semibold text-gray-900">{batch.chickPurchase?.supplier || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Breed</span>
                <span className="font-semibold text-gray-900">{batch.chickPurchase?.breed || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 40-Day Visual Tracker */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">Growth Progress</h2>
            <span className="text-sm font-semibold text-[#00A859]">Day {summary.currentAgeDays} of {TARGET_DAYS}</span>
          </div>
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-[#00A859] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs font-semibold text-gray-400">
            <span>Day 0 (Placement)</span>
            <span>Day {TARGET_DAYS} (Target Harvest)</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Current Birds</p>
            <p className="text-lg font-bold text-gray-900">{summary.currentBirdCount.toLocaleString()} / {summary.chickCount.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><AlertTriangle size={20} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Mortality</p>
            <p className="text-lg font-bold text-red-600">{summary.totalMortality.toLocaleString()} birds</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><ShoppingBag size={20} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Feed Used</p>
            <p className="text-lg font-bold text-gray-900">{summary.totalFeedUsedKg.toLocaleString()} kg</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Scale size={20} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Avg Weight</p>
            <p className="text-lg font-bold text-gray-900">{summary.averageWeightKg} kg</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detailed Logs Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="text-blue-500" size={20} /> Daily Logs
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-gray-500 font-semibold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Mortality</th>
                  <th className="px-6 py-4 text-center">Feed (kg)</th>
                  <th className="px-6 py-4 text-center">Weight (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {visits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No logs found for this batch.</td>
                  </tr>
                ) : (
                  visits.slice().sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()).map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">{new Date(visit.visitDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${visit.mortalityToday > 0 ? 'bg-red-50 text-red-600' : 'text-gray-500'}`}>
                          {visit.mortalityToday}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{visit.feedUsedKg}</td>
                      <td className="px-6 py-4 text-center font-medium">{visit.approxWeightKg}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feed Transactions Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="text-orange-500" size={20} /> Feed Allocations
            </h2>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-gray-500 font-semibold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Quantity (kg)</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {feedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No feed allocations found.</td>
                  </tr>
                ) : (
                  feedTransactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold ${
                          tx.type === 'IN' ? 'bg-[#E6F8ED] text-[#00A859]' : 'bg-red-50 text-red-600'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{tx.quantityKg}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-[150px]">{tx.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAddLogOpen && (
        <AddLogModal batchId={id!} onClose={() => setIsAddLogOpen(false)} />
      )}
    </div>
  );
}
