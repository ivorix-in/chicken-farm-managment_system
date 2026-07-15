import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Send, Printer, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import { fetchFarms } from '../../Farms/api/farmsApi';
import { fetchVehicles } from '../../Vehicles/api/vehiclesApi';
import { fetchBatches } from '../../Batches/api/batchesApi';
import {
  createCollectionReport,
  fetchCollectionReport,
  updateCollectionReport,
  submitCollectionReport,
  CollectionReportItem,
} from '../api/collectionReportsApi';

export default function CollectionReportCreatePage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Header state
  const [vehicleId, setVehicleId] = useState('');
  const [farmId, setFarmId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [driverName, setDriverName] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // Items state (dynamic rows)
  const [items, setItems] = useState<CollectionReportItem[]>([
    { boxNumber: 1, emptyWeight: 2.50, loadedWeight: 0.00, chickenCount: 0 },
  ]);

  // Query lookups
  const { data: farms = [] } = useQuery({ queryKey: ['farms'], queryFn: fetchFarms });
  const { data: vehicles = [] } = useQuery({ queryKey: ['vehicles', true], queryFn: () => fetchVehicles(true) });
  const { data: activeBatches = [] } = useQuery({
    queryKey: ['batches', { farmId, status: 'PROGRESS' }],
    queryFn: () => fetchBatches({ farmId, status: 'PROGRESS' }),
    enabled: !!farmId,
  });

  // Query existing report details
  const { data: report, isLoading: isLoadingReport } = useQuery({
    queryKey: ['collectionReport', id],
    queryFn: () => fetchCollectionReport(id!),
    enabled: isEditMode,
  });

  const isSubmitted = report?.status === 'SUBMITTED';

  // Load report data on edit/view mode
  useEffect(() => {
    if (report) {
      setVehicleId(typeof report.vehicleId === 'object' && report.vehicleId ? report.vehicleId.id : report.vehicleId);
      setFarmId(typeof report.farmId === 'object' && report.farmId ? report.farmId.id : report.farmId);
      setBatchId(typeof report.batchId === 'object' && report.batchId ? report.batchId.id : report.batchId);
      setCollectionDate(new Date(report.collectionDate).toISOString().split('T')[0]);
      setDriverName(report.driverName || '');
      setRemarks(report.remarks || '');
      setItems(report.items);
    }
  }, [report]);

  // Auto-select active batch when farm changes
  useEffect(() => {
    if (!isEditMode && activeBatches.length > 0) {
      setBatchId(activeBatches[0].id);
    }
  }, [activeBatches, isEditMode]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditMode) {
        return updateCollectionReport(id!, payload);
      } else {
        return createCollectionReport(payload);
      }
    },
    onSuccess: (data) => {
      toast.success(isEditMode ? 'Draft updated successfully' : 'Draft created successfully');
      queryClient.invalidateQueries({ queryKey: ['collectionReports'] });
      if (!isEditMode) {
        navigate(`/admin/collection-reports/${data.id}/edit`);
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to save collection report';
      toast.error(msg);
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Enforce saving current details first
      const payload = getPayload();
      if (isEditMode) {
        await updateCollectionReport(id!, payload);
      } else {
        const newReport = await createCollectionReport(payload);
        await submitCollectionReport(newReport.id);
        return;
      }
      await submitCollectionReport(id!);
    },
    onSuccess: () => {
      toast.success('Collection report submitted and finalized successfully!');
      queryClient.invalidateQueries({ queryKey: ['collectionReports'] });
      queryClient.invalidateQueries({ queryKey: ['collectionReport', id] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      navigate('/admin/collection-reports');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to submit collection report';
      toast.error(msg);
    },
  });

  // Items Row Actions
  const handleAddItem = () => {
    const nextBox = items.length > 0 ? Math.max(...items.map(i => i.boxNumber)) + 1 : 1;
    setItems([...items, { boxNumber: nextBox, emptyWeight: 2.50, loadedWeight: 0.00, chickenCount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof CollectionReportItem, value: number) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setItems(updated);
  };

  // Footer Aggregates Calculations
  const calculatedItems = items.map(item => ({
    ...item,
    chickenWeight: Number(Math.max(0, item.loadedWeight - item.emptyWeight).toFixed(2)),
  }));

  const totalBoxes = items.length;
  const totalChickens = items.reduce((sum, item) => sum + (item.chickenCount || 0), 0);
  const totalEmptyWeight = Number(items.reduce((sum, item) => sum + (item.emptyWeight || 0), 0).toFixed(2));
  const totalLoadedWeight = Number(items.reduce((sum, item) => sum + (item.loadedWeight || 0), 0).toFixed(2));
  const totalChickenWeight = Number(calculatedItems.reduce((sum, item) => sum + item.chickenWeight, 0).toFixed(2));
  const averageChickenWeight = totalChickens > 0 ? Number((totalChickenWeight / totalChickens).toFixed(3)) : 0;

  // Validation
  const getValidationErrors = () => {
    const errors: string[] = [];
    if (!vehicleId) errors.push('Vehicle is required');
    if (!farmId) errors.push('Farm is required');
    if (!batchId) errors.push('Active batch is required');
    if (!collectionDate) errors.push('Collection Date is required');

    const boxNumbers = new Set<number>();
    items.forEach((item, idx) => {
      const rowNum = idx + 1;
      if (!item.boxNumber) {
        errors.push(`Row ${rowNum}: Box number is required`);
      } else if (boxNumbers.has(item.boxNumber)) {
        errors.push(`Row ${rowNum}: Duplicate Box Number (${item.boxNumber})`);
      }
      boxNumbers.add(item.boxNumber);

      if (item.emptyWeight <= 0) {
        errors.push(`Row ${rowNum}: Empty weight must be greater than zero`);
      }
      if (item.loadedWeight <= item.emptyWeight) {
        errors.push(`Row ${rowNum}: Loaded weight (${item.loadedWeight}kg) must be greater than empty weight (${item.emptyWeight}kg)`);
      }
      if (item.chickenCount <= 0) {
        errors.push(`Row ${rowNum}: Chicken count must be greater than zero`);
      }
    });

    return errors;
  };

  const getPayload = () => ({
    vehicleId,
    farmId,
    batchId,
    collectionDate,
    driverName: driverName || null,
    remarks: remarks || null,
    items: items.map(item => ({
      boxNumber: Number(item.boxNumber),
      emptyWeight: Number(item.emptyWeight),
      loadedWeight: Number(item.loadedWeight),
      chickenCount: Number(item.chickenCount),
    })),
  });

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !farmId || !batchId || !collectionDate) {
      toast.error('Please fill in all required header fields.');
      return;
    }
    saveMutation.mutate(getPayload());
  };

  const handleSubmitFinal = () => {
    const errors = getValidationErrors();
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to SUBMIT this report? This will finalize details, update batch sales weight, and lock edits.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00A859',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, submit report',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        submitMutation.mutate();
      }
    });
  };

  if (isEditMode && isLoadingReport) {
    return <div className="text-center py-8 text-gray-400">Loading collection report details...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/collection-reports"
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isSubmitted ? 'View Collection Report' : isEditMode ? 'Edit Draft Report' : 'Log Collection Report'}
            </h1>
            <p className="text-sm text-gray-400 font-normal mt-1">
              {isSubmitted ? 'This report has been finalized and cannot be modified.' : 'Log empty/loaded crate weights.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isSubmitted && (
            <>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saveMutation.isPending || submitMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Save size={16} />
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleSubmitFinal}
                disabled={saveMutation.isPending || submitMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#00A859] hover:bg-[#008F4B] rounded-xl shadow-sm transition-all"
              >
                <Send size={16} />
                Submit Final
              </button>
            </>
          )}
          {isEditMode && (
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
            >
              <Printer size={16} />
              Print
            </button>
          )}
        </div>
      </div>

      {/* Main Print Layout / Interactive Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: Form fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Crate Weights Grid */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden print:border-none print:shadow-none">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4 flex items-center justify-between print:mb-2">
              <span>Crates / Boxes Allocation</span>
              {!isSubmitted && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#00A859] hover:bg-[#008F4B] rounded-lg transition-all print:hidden"
                >
                  <Plus size={14} /> Add Box
                </button>
              )}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-[10px] tracking-wider print:bg-gray-100">
                    <th className="px-4 py-3 w-24">Box No</th>
                    <th className="px-4 py-3 text-center">Empty (Kg)</th>
                    <th className="px-4 py-3 text-center">Loaded (Kg)</th>
                    <th className="px-4 py-3 text-center">Chicken Count</th>
                    <th className="px-4 py-3 text-center">Chicken Wt (Kg)</th>
                    {!isSubmitted && <th className="px-4 py-3 text-right print:hidden">Remove</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {calculatedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 print:hover:bg-transparent">
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          required
                          disabled={isSubmitted}
                          min="1"
                          value={item.boxNumber || ''}
                          onChange={(e) => handleItemChange(idx, 'boxNumber', parseInt(e.target.value, 10))}
                          className="w-full px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00A859] font-semibold text-gray-900 disabled:bg-transparent disabled:border-none print:disabled:px-0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          required
                          disabled={isSubmitted}
                          step="0.01"
                          min="0.1"
                          value={item.emptyWeight || ''}
                          onChange={(e) => handleItemChange(idx, 'emptyWeight', parseFloat(e.target.value))}
                          className="w-full text-center px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00A859] disabled:bg-transparent disabled:border-none print:disabled:px-0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          required
                          disabled={isSubmitted}
                          step="0.01"
                          min="0.1"
                          value={item.loadedWeight || ''}
                          onChange={(e) => handleItemChange(idx, 'loadedWeight', parseFloat(e.target.value))}
                          className="w-full text-center px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00A859] disabled:bg-transparent disabled:border-none print:disabled:px-0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          required
                          disabled={isSubmitted}
                          min="1"
                          value={item.chickenCount || ''}
                          onChange={(e) => handleItemChange(idx, 'chickenCount', parseInt(e.target.value, 10))}
                          className="w-full text-center px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00A859] disabled:bg-transparent disabled:border-none print:disabled:px-0"
                        />
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-900">
                        {item.chickenWeight.toFixed(2)}
                      </td>
                      {!isSubmitted && (
                        <td className="px-4 py-3 text-right print:hidden">
                          <button
                            type="button"
                            disabled={items.length === 1}
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Section: Header summary details */}
        <div className="space-y-6">
          {/* Header Metadata */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:border-none print:shadow-none">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4 print:mb-2">Collection Header</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Assign Vehicle *
                </label>
                <select
                  required
                  disabled={isSubmitted}
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] disabled:bg-transparent disabled:border-none disabled:p-0 disabled:text-gray-900 font-bold"
                >
                  <option value="">-- Choose vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.vehicleNo} ({v.model || 'No Model'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Assign Farm *
                </label>
                <select
                  required
                  disabled={isSubmitted || isEditMode}
                  value={farmId}
                  onChange={(e) => setFarmId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] disabled:bg-transparent disabled:border-none disabled:p-0 disabled:text-gray-900 font-bold"
                >
                  <option value="">-- Choose farm --</option>
                  {farms.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Active Batch
                </label>
                <select
                  disabled
                  value={batchId}
                  className="w-full px-3 py-2 text-sm border border-gray-100 bg-gray-50 text-gray-400 rounded-lg focus:outline-none disabled:bg-transparent disabled:border-none disabled:p-0 disabled:text-gray-900 font-mono font-bold"
                >
                  <option value="">-- Auto selected --</option>
                  {activeBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.batchNo}</option>
                  ))}
                  {isEditMode && report && (
                    <option value={batchId}>
                      {typeof report.batchId === 'object' && report.batchId ? report.batchId.batchNo : 'Loaded Batch'}
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Collection Date *
                </label>
                <input
                  type="date"
                  required
                  disabled={isSubmitted}
                  value={collectionDate}
                  onChange={(e) => setCollectionDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] disabled:bg-transparent disabled:border-none disabled:p-0 disabled:text-gray-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Robert Ford"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] disabled:bg-transparent disabled:border-none disabled:p-0 disabled:text-gray-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  disabled={isSubmitted}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Any observation during load..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] disabled:bg-transparent disabled:border-none disabled:p-0 disabled:text-gray-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Aggregate Yield Panel */}
          <div className="bg-gradient-to-br from-[#00A859] to-[#008F4B] p-6 rounded-2xl text-white shadow-md relative overflow-hidden print:border print:border-gray-200 print:text-gray-900 print:from-transparent print:to-transparent print:shadow-none">
            <h2 className="text-lg font-bold tracking-tight mb-4 border-b border-white/20 pb-2 print:border-gray-200">
              Collection Summary
            </h2>
            
            <div className="space-y-3 font-semibold text-sm">
              <div className="flex justify-between">
                <span className="opacity-80 print:opacity-100">Total Boxes:</span>
                <span>{totalBoxes}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80 print:opacity-100">Total Chickens:</span>
                <span>{totalChickens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80 print:opacity-100">Total Empty Wt (Kg):</span>
                <span>{totalEmptyWeight.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80 print:opacity-100">Total Loaded Wt (Kg):</span>
                <span>{totalLoadedWeight.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-white/20 pt-2 text-base font-bold print:border-gray-200">
                <span>Net Chicken Wt:</span>
                <span>{totalChickenWeight.toFixed(2)} Kg</span>
              </div>
              <div className="flex justify-between text-xs opacity-90 print:opacity-100">
                <span>Average Bird Weight:</span>
                <span>{averageChickenWeight.toFixed(3)} Kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
