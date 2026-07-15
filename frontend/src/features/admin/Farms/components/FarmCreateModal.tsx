import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { createFarm, updateFarm, Farm } from '../api/farmsApi';
import { fetchFarmers } from '../../Farmers/api/farmersApi';
import { fetchAreas } from '../../Areas/api/areasApi';
import { fetchEmployees } from '../../Employees/api/employeesApi';
import { toast } from 'sonner';

interface FarmCreateModalProps {
  onClose: () => void;
  farm?: Farm;
}

export default function FarmCreateModal({ onClose, farm }: FarmCreateModalProps) {
  const isEditMode = !!farm;
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    farmerId: '',
    areaId: '',
    supervisorId: '',
    address: '',
    capacity: '',
    status: 'PENDING' as 'ACTIVE' | 'INACTIVE' | 'PENDING',
  });

  const { data: farmers = [], isLoading: isLoadingFarmers } = useQuery({
    queryKey: ['farmers'],
    queryFn: fetchFarmers,
  });

  const { data: areas = [], isLoading: isLoadingAreas } = useQuery({
    queryKey: ['areas'],
    queryFn: fetchAreas,
  });

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
  });

  useEffect(() => {
    if (farm) {
      setFormData({
        name: farm.name || '',
        farmerId: typeof farm.farmerId === 'object' && farm.farmerId ? (farm.farmerId as any).id : farm.farmerId,
        areaId: typeof farm.areaId === 'object' && farm.areaId ? (farm.areaId as any).id : (farm.areaId || ''),
        supervisorId: typeof farm.supervisorId === 'object' && farm.supervisorId ? (farm.supervisorId as any).id : (farm.supervisorId || ''),
        address: farm.address || '',
        capacity: String(farm.capacity),
        status: farm.status || 'PENDING',
      });
    }
  }, [farm]);

  const mutation = useMutation({
    mutationFn: (data: Partial<Farm>) => {
      if (isEditMode && farm) {
        return updateFarm(farm.id, data);
      } else {
        return createFarm(data);
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Farm details updated successfully.' : 'New poultry farm added successfully.');
      queryClient.invalidateQueries({ queryKey: ['farms'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to save farm details.';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.farmerId || !formData.address.trim() || !formData.capacity) {
      toast.error('All required fields (*) must be filled.');
      return;
    }
    
    mutation.mutate({
      name: formData.name.trim(),
      farmerId: formData.farmerId,
      address: formData.address.trim(),
      capacity: parseInt(formData.capacity, 10),
      areaId: formData.areaId || null as any,
      supervisorId: formData.supervisorId || null as any,
      status: formData.status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Farm' : 'Add New Farm'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farm Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="e.g. Sunny Broilers Farm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Farmer *
            </label>
            <select
              required
              disabled={isLoadingFarmers}
              value={formData.farmerId}
              onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
            >
              <option value="">-- Choose a farmer --</option>
              {farmers.map((farmer) => (
                <option key={farmer.id} value={farmer.id}>
                  {farmer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Area (Optional)
            </label>
            <select
              disabled={isLoadingAreas}
              value={formData.areaId}
              onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
            >
              <option value="">-- Choose an area --</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} ({area.code})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Supervisor (Optional)
            </label>
            <select
              disabled={isLoadingEmployees}
              value={formData.supervisorId}
              onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
            >
              <option value="">-- Choose a supervisor --</option>
              {employees.filter(emp => emp.department === 'SUPERVISOR').map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="Full address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (Birds) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
                placeholder="e.g. 5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              >
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#00A859] hover:bg-[#008F4B] rounded-xl transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : (isEditMode ? 'Save Changes' : 'Save Farm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
