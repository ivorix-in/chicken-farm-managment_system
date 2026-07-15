import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Home, Edit2, Trash2 } from 'lucide-react';
import { fetchFarms, deleteFarm, Farm } from '../api/farmsApi';
import FarmCreateModal from '../components/FarmCreateModal';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

export default function FarmsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState<Farm | undefined>(undefined);

  const { data: farms = [], isLoading } = useQuery<Farm[]>({
    queryKey: ['farms'],
    queryFn: fetchFarms,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFarm,
    onSuccess: () => {
      toast.success('Farm has been deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['farms'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete farm';
      toast.error(msg);
    },
  });

  const handleEdit = (farm: Farm) => {
    setSelectedFarm(farm);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedFarm(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this farm? This action cannot be undone.",
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

  const filteredFarms = farms.filter((f) => {
    const name = f.name.toLowerCase();
    const address = (f.address || '').toLowerCase();
    const farmerName = typeof f.farmerId === 'object' && f.farmerId ? (f.farmerId as any).name?.toLowerCase() : '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || address.includes(search) || farmerName.includes(search);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Home className="text-[#00A859]" /> Farms
          </h1>
          <p className="text-sm text-gray-400 font-normal mt-1">
            Manage poultry farms and their capacities.
          </p>
        </div>
        
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00A859] hover:bg-[#008F4B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} />
          Add Farm
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
            placeholder="Search farms by name, address or farmer..."
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                <th className="px-6 py-4">Farm Name</th>
                <th className="px-6 py-4">Farmer</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading farms...</td>
                </tr>
              ) : filteredFarms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No farms found.</td>
                </tr>
              ) : (
                filteredFarms.map((farm) => (
                  <tr key={farm.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{farm.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{farm.address}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium font-sans">
                      {typeof farm.farmerId === 'object' && farm.farmerId ? (farm.farmerId as any).name : String(farm.farmerId).substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{farm.capacity.toLocaleString()} birds</td>
                    <td className="px-6 py-4">
                      {farm.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6F8ED] text-[#00A859] border border-[#00A859]/20">
                          Active
                        </span>
                      ) : farm.status === 'PENDING' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{new Date(farm.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(farm)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Farm"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(farm.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Farm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <FarmCreateModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFarm(undefined);
          }}
          farm={selectedFarm}
        />
      )}
    </div>
  );
}
