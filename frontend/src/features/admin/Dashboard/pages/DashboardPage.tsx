import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Tractor,
  Activity,
  ClipboardList,
  AlertTriangle,
  ArrowUpRight,
  RefreshCcw,
} from 'lucide-react';
import { useAdminSession } from '../../Auth/hooks/useAdminSession';
import { fetchDashboardKpis } from '../api/dashboardApi';

export default function DashboardPage() {
  const { admin } = useAdminSession();
  const greetName = admin?.name?.trim().split(/\s+/u)[0] || 'Admin';

  const { data: kpis, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: fetchDashboardKpis,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <RefreshCcw className="animate-spin mb-4 text-[#00A859]" size={32} />
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError || !kpis) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center text-red-500 bg-red-50 p-6 rounded-2xl border border-red-100">
          <AlertTriangle size={32} className="mx-auto mb-2" />
          <p className="font-semibold text-lg">Error Loading Dashboard</p>
          <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-white rounded-lg text-sm shadow-sm border border-red-200">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasAlerts = kpis.alerts.lowFeed.length > 0 || kpis.alerts.lowMedicine.length > 0;

  return (
    <div className="space-y-6 pb-8 text-left font-sans min-h-screen">
      {/* Banner / Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm shadow-gray-500/[0.02]">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Good Morning, {greetName}!
          </h1>
          <p className="text-sm text-gray-400 font-normal">
            Here's what's happening on your farms today.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E6F8ED] hover:bg-[#cbf1da] text-[#00A859] text-xs font-semibold transition-all shadow-sm"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Active Farms */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Farms</span>
            <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <Tractor size={16} />
            </div>
          </div>
          <div className="mt-auto">
            <span className="text-3xl font-black text-gray-900 tracking-tight block">{kpis.activeFarms}</span>
            <span className="text-xs font-semibold text-gray-500 mt-2 block">
              Currently operational
            </span>
          </div>
        </div>

        {/* Active Batches */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Batches</span>
            <div className="size-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-auto">
            <span className="text-3xl font-black text-gray-900 tracking-tight block">{kpis.activeBatches}</span>
            <span className="text-xs font-semibold text-gray-500 mt-2 block">
              Batches in progress
            </span>
          </div>
        </div>

        {/* Total Birds */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Birds</span>
            <div className="size-8 rounded-xl bg-[#E6F8ED] text-[#00A859] flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 18a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v4h14v-4z"/><circle cx="10" cy="8" r="4"/><path d="m20.5 8.5-1.5 2"/></svg>
            </div>
          </div>
          <div className="mt-auto">
            <span className="text-3xl font-black text-gray-900 tracking-tight block">{kpis.activeBirds.toLocaleString()}</span>
            <span className="text-xs font-semibold text-gray-500 mt-2 block">
              Across all batches
            </span>
          </div>
        </div>

        {/* Mortality */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mortality Rate</span>
            <div className={`size-8 rounded-xl flex items-center justify-center shadow-sm ${kpis.mortalityPct > 5 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="mt-auto">
            <span className="text-3xl font-black text-gray-900 tracking-tight block">{kpis.mortalityPct}%</span>
            <span className="text-xs font-semibold text-gray-500 mt-2 block">
              {kpis.totalMortality.toLocaleString()} total losses
            </span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Alerts Section */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <AlertTriangle size={16} className={hasAlerts ? "text-amber-500" : "text-gray-400"} />
              System Alerts
            </h2>
          </div>
          
          <div className="p-5 flex-1">
            {!hasAlerts ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                <div className="size-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <Activity size={24} className="text-green-500" />
                </div>
                <p className="font-medium">No active alerts.</p>
                <p className="text-xs">Your inventory is in good shape!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {kpis.alerts.lowFeed.map((alert, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-amber-100 bg-amber-50/30">
                    <div className="size-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <AlertTriangle size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Low Feed Stock: {alert.feedType}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Only {alert.quantityKg} kg remaining in warehouse.</p>
                    </div>
                  </div>
                ))}
                {kpis.alerts.lowMedicine.map((alert, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-amber-100 bg-amber-50/30">
                    <div className="size-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <AlertTriangle size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Low Medicine Stock: {alert.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Only {alert.quantityUnits} {alert.unit} remaining.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Daily Visits Summary */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-bold text-gray-800 tracking-tight mb-4 flex items-center gap-2">
            <ClipboardList size={16} className="text-blue-500" />
            Today's Visits
          </h2>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative size-32 mx-auto mb-4 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                <circle 
                  cx="64" cy="64" r="56" fill="none" stroke="#3B82F6" strokeWidth="12" 
                  strokeDasharray="351.85" 
                  strokeDashoffset={kpis.activeBatches > 0 ? 351.85 - (351.85 * Math.min(1, kpis.todaysVisits / kpis.activeBatches)) : 351.85}
                  className="transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="text-center z-10">
                <span className="text-3xl font-black text-gray-900">{kpis.todaysVisits}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Visits</span>
              </div>
            </div>
            
            <p className="text-xs font-semibold text-gray-500 text-center px-4">
              {kpis.todaysVisits} out of {kpis.activeBatches} active batches have been inspected today.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
