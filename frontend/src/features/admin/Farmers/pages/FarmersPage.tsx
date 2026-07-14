import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Users, Edit2, Trash2 } from 'lucide-react';
import { fetchFarmers, deleteFarmer, Farmer } from '../api/farmersApi';
import FarmerCreateModal from '../components/FarmerCreateModal';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

export default function FarmersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | undefined>(undefined);

  const { data: farmers = [], isLoading } = useQuery<Farmer[]>({
    queryKey: ['farmers'],
    queryFn: fetchFarmers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFarmer,
    onSuccess: () => {
      toast.success('Farmer has been deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete farmer';
      toast.error(msg);
    },
  });

  const handleEdit = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedFarmer(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this farmer? This action cannot be undone.",
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

  const filteredFarmers = farmers.filter((f) => {
    const name = f.name.toLowerCase();
    const phone = f.phone.toLowerCase();
    const address = (f.address || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search) || address.includes(search);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-[#00A859]" /> Farmers
          </h1>
          <p className="text-sm text-gray-400 font-normal mt-1">
            Manage your network of poultry farmers.
          </p>
        </div>
        
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00A859] hover:bg-[#008F4B] text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus size={16} />
          Add Farmer
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
            placeholder="Search farmers by name or phone..."
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">Loading farmers...</td>
                </tr>
              ) : filteredFarmers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No farmers found.</td>
                </tr>
              ) : (
                filteredFarmers.map((farmer) => (
                  <tr key={farmer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{farmer.name}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{farmer.phone}</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{farmer.address || '-'}</td>
                    <td className="px-6 py-4">
                      {farmer.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6F8ED] text-[#00A859] border border-[#00A859]/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(farmer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(farmer)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Farmer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(farmer.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Farmer"
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
        <FarmerCreateModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFarmer(undefined);
          }}
          farmer={selectedFarmer}
        />
      )}
    </div>
  );
}
