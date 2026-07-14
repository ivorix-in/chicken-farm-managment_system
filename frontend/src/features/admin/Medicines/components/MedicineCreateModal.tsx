import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { createMedicine, updateMedicine, Medicine } from '../api/medicinesApi';
import { toast } from 'sonner';

interface MedicineCreateModalProps {
  onClose: () => void;
  medicine?: Medicine;
}

export default function MedicineCreateModal({ onClose, medicine }: MedicineCreateModalProps) {
  const isEditMode = !!medicine;
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    batchNo: '',
    expiryDate: '',
    quantityUnits: '',
    lowStockThreshold: '',
    unit: 'VIAL',
    unitCost: '',
  });

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name,
        manufacturer: medicine.manufacturer || '',
        batchNo: medicine.batchNo,
        expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : '',
        quantityUnits: String(medicine.quantityUnits),
        lowStockThreshold: String(medicine.lowStockThreshold),
        unit: medicine.unit || 'VIAL',
        unitCost: String(medicine.unitCost),
      });
    }
  }, [medicine]);

  const mutation = useMutation({
    mutationFn: (data: Partial<Medicine>) => {
      if (isEditMode && medicine) {
        return updateMedicine(medicine.id, data);
      } else {
        return createMedicine(data);
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Medicine inventory updated successfully.' : 'New medicine batch registered successfully.');
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to save medicine details.';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.batchNo.trim() ||
      !formData.expiryDate ||
      !formData.quantityUnits ||
      !formData.lowStockThreshold ||
      !formData.unitCost
    ) {
      toast.error('All required fields (*) must be filled.');
      return;
    }

    mutation.mutate({
      name: formData.name.trim(),
      manufacturer: formData.manufacturer.trim() || null as any,
      batchNo: formData.batchNo.trim(),
      expiryDate: formData.expiryDate,
      quantityUnits: parseInt(formData.quantityUnits, 10),
      lowStockThreshold: parseInt(formData.lowStockThreshold, 10),
      unit: formData.unit.trim(),
      unitCost: parseFloat(formData.unitCost),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Medicine Stock' : 'Add Medicine Batch'}
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
              Medicine Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="e.g. Vimeral"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer
            </label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="e.g. Virbac India"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch No *
              </label>
              <input
                type="text"
                required
                value={formData.batchNo}
                onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] font-mono"
                placeholder="e.g. VIM-998"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date *
              </label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantityUnits}
                onChange={(e) => setFormData({ ...formData, quantityUnits: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
                placeholder="e.g. 100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              >
                <option value="ML">ML</option>
                <option value="TABLET">TABLET</option>
                <option value="KG">KG</option>
                <option value="SACHET">SACHET</option>
                <option value="VIAL">VIAL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low Threshold *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
                placeholder="e.g. 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
                placeholder="e.g. 5.50"
              />
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
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : (isEditMode ? 'Save Changes' : 'Save Medicine')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
