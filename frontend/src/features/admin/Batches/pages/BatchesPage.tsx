import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Activity, Eye, MapPin, Calendar, ClipboardList, User } from 'lucide-react';
import { fetchBatches } from '../api/batchesApi';
import { Link } from 'react-router-dom';
import BatchCreateModal from '../components/BatchCreateModal';

export default function BatchesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['batches'],
    queryFn: () => fetchBatches(),
  });

  const filteredBatches = batches.filter((batch) => {
    const farmName = typeof batch.farmId === 'object' && batch.farmId 
      ? (batch.farmId as any).name 
      : `Farm ${String(batch.farmId).substring(0, 8)}`;
    
    const matchesSearch = 
      batch.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || batch.status === statusFilter;

    return matchesSearch && matchesStatus;
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
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00A859] hover:bg-[#008F4B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] transition-all"
            placeholder="Search batches by ID or farm..."
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm py-2 px-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Grid of Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded pt-4"></div>
            </div>
          ))}
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No batches found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map((batch) => {
            const farmName = typeof batch.farmId === 'object' && batch.farmId 
              ? (batch.farmId as any).name 
              : `Farm ${String(batch.farmId).substring(0, 8)}`;
            
            const startDate = batch.startDate || (batch as any).placementDate 
              ? new Date(batch.startDate || (batch as any).placementDate).toLocaleDateString() 
              : 'N/A';

            const chicksStart = batch.chickPurchase?.quantity?.toLocaleString() || 'N/A';

            const farmerName = typeof batch.farmId === 'object' && batch.farmId && (batch.farmId as any).farmerId
              ? (typeof (batch.farmId as any).farmerId === 'object' 
                  ? (batch.farmId as any).farmerId.name 
                  : String((batch.farmId as any).farmerId).substring(0, 8))
              : 'N/A';

            return (
              <div 
                key={batch.id} 
                className={`group relative bg-white rounded-2xl border-t-4 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between ${
                  batch.status === 'PROGRESS' 
                    ? 'border-t-[#00A859] border-x border-b border-gray-100' 
                    : batch.status === 'COMPLETED'
                    ? 'border-t-[#D48800] border-x border-b border-gray-100'
                    : 'border-t-gray-300 border-x border-b border-gray-100'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Batch Number</span>
                      <span className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-[#00A859] transition-colors mt-0.5">
                        {farmName}
                      </span>
                    </div>
                    
                    <div>
                      {batch.status === 'PROGRESS' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6F8ED] text-[#00A859] border border-[#00A859]/20">
                          In Progress
                        </span>
                      )}
                      {batch.status === 'COMPLETED' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF9E6] text-[#D48800] border border-[#D48800]/20">
                          Completed
                        </span>
                      )}
                      {batch.status === 'CLOSED' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Info Details */}
                  <div className="space-y-3 mb-6 bg-gray-50/50 p-3.5 rounded-xl border border-gray-100/50">
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <MapPin size={16} className="text-gray-400 shrink-0" />
                      <span className="font-semibold text-gray-800 truncate" title={farmName}>
                        {batch.batchNo}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <User size={16} className="text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-500">
                        Farmer: <strong className="text-gray-800 ml-1 font-semibold">{farmerName}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Calendar size={16} className="text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-500">
                        Start Date: <strong className="text-gray-800 ml-1 font-semibold">{startDate}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <ClipboardList size={16} className="text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-500">
                        Chicks: <strong className="text-gray-800 ml-1 font-semibold">{chicksStart}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <Link 
                    to={`/admin/batches/${batch.id}/track`} 
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-50 hover:bg-[#E6F8ED] text-gray-700 hover:text-[#00A859] rounded-xl text-xs font-semibold transition-all border border-gray-100 hover:border-[#00A859]/20 shadow-sm"
                  >
                    <Eye size={14} />
                    Track Batch
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {isModalOpen && <BatchCreateModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
