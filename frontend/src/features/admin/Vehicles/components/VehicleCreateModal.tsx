import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { createVehicle, updateVehicle, Vehicle } from '../api/vehiclesApi';
import { toast } from 'sonner';

interface VehicleCreateModalProps {
  onClose: () => void;
  vehicle?: Vehicle;
}

export default function VehicleCreateModal({ onClose, vehicle }: VehicleCreateModalProps) {
  const isEditMode = !!vehicle;
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    vehicleNo: '',
    model: '',
    driverName: '',
    isActive: true,
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleNo: vehicle.vehicleNo,
        model: vehicle.model || '',
        driverName: vehicle.driverName || '',
        isActive: vehicle.isActive,
      });
    }
  }, [vehicle]);

  const mutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => {
      if (isEditMode && vehicle) {
        return updateVehicle(vehicle.id, data);
      } else {
        return createVehicle(data);
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Vehicle updated successfully' : 'Vehicle added successfully');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to save vehicle. Please check inputs.';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNo.trim()) {
      toast.error('Vehicle Number is required');
      return;
    }
    
    // Kerala registration check format helper, e.g. KL-XX-X-XXXX or similar (flexible but clean)
    const formattedNo = formData.vehicleNo.trim().toUpperCase();

    mutation.mutate({
      vehicleNo: formattedNo,
      model: formData.model.trim() || null,
      driverName: formData.driverName.trim() || null,
      isActive: formData.isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
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
              Vehicle Number *
            </label>
            <input
              type="text"
              required
              value={formData.vehicleNo}
              onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] font-mono"
              placeholder="e.g. KL-01-A-1234"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Specify the registration plate number. E.g., KL-12-E-4567.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="e.g. Mahindra Bolero Pick-up"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driver Name
            </label>
            <input
              type="text"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="e.g. Biju Kurup"
            />
          </div>

          {isEditMode && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-[#00A859] focus:ring-[#00A859]"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 select-none">
                Vehicle is Active / Operational
              </label>
            </div>
          )}

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
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : (isEditMode ? 'Save Changes' : 'Save Vehicle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
