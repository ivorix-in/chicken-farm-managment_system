import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Truck, Eye, FileEdit } from 'lucide-react';
import { fetchCollectionReports } from '../api/collectionReportsApi';

export default function CollectionReportsPage() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['collectionReports'],
    queryFn: () => fetchCollectionReports(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Truck className="text-[#00A859]" /> Chicken Collection Reports
          </h1>
          <p className="text-sm text-gray-400 font-normal mt-1">
            Record and manage chicken harvests and logistics.
          </p>
        </div>
        
        <Link
          to="/admin/collection-reports/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00A859] hover:bg-[#008F4B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} />
          New Collection Report
        </Link>
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
            placeholder="Search reports..."
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                <th className="px-6 py-4">Farm</th>
                <th className="px-6 py-4">Batch</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Total Boxes</th>
                <th className="px-6 py-4 text-center">Total Chickens</th>
                <th className="px-6 py-4 text-center">Total Weight (Kg)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400">Loading collection reports...</td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-400">No collection reports logged yet.</td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {typeof report.farmId === 'object' && report.farmId ? report.farmId.name : String(report.farmId)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {typeof report.batchId === 'object' && report.batchId ? report.batchId.batchNo : String(report.batchId)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium font-mono text-xs">
                      {typeof report.vehicleId === 'object' && report.vehicleId ? report.vehicleId.vehicleNo : String(report.vehicleId)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(report.collectionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700">{report.totalBoxes}</td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-700">{report.totalChickens}</td>
                    <td className="px-6 py-4 text-center font-bold text-[#00A859]">{report.totalChickenWeight.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {report.status === 'SUBMITTED' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6F8ED] text-[#00A859] border border-[#00A859]/20">
                          SUBMITTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          DRAFT
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.status === 'DRAFT' ? (
                          <Link
                            to={`/admin/collection-reports/${report.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Report"
                          >
                            <FileEdit size={16} />
                          </Link>
                        ) : (
                          <Link
                            to={`/admin/collection-reports/${report.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View / Print Report"
                          >
                            <Eye size={16} />
                          </Link>
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
