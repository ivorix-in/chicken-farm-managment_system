import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pill, Search, Plus, AlertTriangle, Trash2, Edit2 } from 'lucide-react';
import { fetchMedicines, deleteMedicine, Medicine } from '../api/medicinesApi';
import MedicineCreateModal from '../components/MedicineCreateModal';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

export default function MedicinesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | undefined>(undefined);

  const { data: medicines = [], isLoading } = useQuery<Medicine[]>({
    queryKey: ['medicines'],
    queryFn: fetchMedicines,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedicine,
    onSuccess: () => {
      toast.success('Medicine batch has been deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete medicine';
      toast.error(msg);
    },
  });

  const handleEdit = (med: Medicine) => {
    setSelectedMedicine(med);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedMedicine(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this medicine batch? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const filteredMedicines = medicines.filter((m) => {
    const name = m.name.toLowerCase();
    const batchNo = m.batchNo.toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || batchNo.includes(search);
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
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00A859] hover:bg-[#008F4B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No medicines in inventory.</td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const isLow = med.quantityUnits <= med.lowStockThreshold;
                  return (
                    <tr key={med.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{med.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">₹{med.unitCost.toFixed(2)} / {med.unit}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium font-mono">{med.batchNo}</td>
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(med)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Medicine"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(med.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Medicine"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <MedicineCreateModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMedicine(undefined);
          }}
          medicine={selectedMedicine}
        />
      )}
    </div>
  );
}
