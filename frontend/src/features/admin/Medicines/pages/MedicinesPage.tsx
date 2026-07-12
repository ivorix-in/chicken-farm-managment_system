import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pill, Search, Plus, FileText, AlertTriangle } from 'lucide-react';
import { fetchMedicines } from '../api/medicinesApi';

export default function MedicinesPage() {
  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ['medicines'],
    queryFn: fetchMedicines,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Pill className="text-[#00A859]" /> Medicine Stock
          </h1>
          <p className="text-sm text-gray-400 font-normal mt-1">
            Track pharmacy inventory and manage flock prescriptions.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition-all">
            <FileText size={16} />
            Prescriptions
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00A859] hover:bg-[#008F4B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
            <Plus size={16} />
            Add Medicine
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
            placeholder="Search medicines by name or batch..."
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                <th className="px-6 py-4">Medicine Name</th>
                <th className="px-6 py-4">Batch No</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading medicines...</td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No medicines in inventory.</td>
                </tr>
              ) : (
                medicines.map((med) => {
                  const isLow = med.quantityUnits <= med.lowStockThreshold;
                  return (
                    <tr key={med.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{med.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">${med.unitCost.toFixed(2)} / {med.unit}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{med.batchNo}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-gray-900'}`}>
                            {med.quantityUnits} {med.unit}
                          </span>
                          {isLow && <AlertTriangle size={14} className="text-amber-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {new Date(med.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 font-semibold text-xs hover:underline">Edit</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
