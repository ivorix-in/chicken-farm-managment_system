import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { createEmployee, updateEmployee, Employee } from '../api/employeesApi';
import { toast } from 'sonner';

interface EmployeeCreateModalProps {
  onClose: () => void;
  employee?: Employee;
}

export default function EmployeeCreateModal({ onClose, employee }: EmployeeCreateModalProps) {
  const isEditMode = !!employee;
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    department: 'SUPERVISOR',
    salary: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        phone: employee.phone || '',
        email: employee.email || '',
        department: employee.department || 'SUPERVISOR',
        salary: employee.salary ? String(employee.salary) : '',
        status: employee.status || 'ACTIVE',
      });
    }
  }, [employee]);

  const mutation = useMutation({
    mutationFn: (data: Partial<Employee>) => {
      if (isEditMode && employee) {
        return updateEmployee(employee.id, data);
      } else {
        return createEmployee(data);
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Employee details updated successfully.' : 'New employee added successfully.');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to save employee details.';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Employee Name is required.');
      return;
    }

    mutation.mutate({
      name: formData.name.trim(),
      phone: formData.phone.trim() || null as any,
      email: formData.email.trim() || null as any,
      department: formData.department,
      salary: formData.salary ? parseFloat(formData.salary) : null as any,
      status: formData.status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Edit Employee' : 'Add New Employee'}
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
              Employee Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="e.g. Anil Kumar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="e.g. 9446055112"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="e.g. anil@farmvista.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
            >
              <option value="SUPERVISOR">Supervisor</option>
              <option value="DOCTOR">Doctor</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="MANAGER">Manager</option>
              <option value="STAFF">General Staff</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary (Rs/Month)
            </label>
            <input
              type="number"
              min="0"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              placeholder="e.g. 18000"
            />
          </div>

          {isEditMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
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
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : (isEditMode ? 'Save Changes' : 'Save Employee')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
