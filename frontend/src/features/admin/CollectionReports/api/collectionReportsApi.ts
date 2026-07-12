import { api } from '../../Auth/api/adminAuthApi';

export interface CollectionReportItem {
  boxNumber: number;
  emptyWeight: number;
  loadedWeight: number;
  chickenWeight?: number;
  chickenCount: number;
}

export interface CollectionReport {
  id: string;
  vehicleId: string | any;
  farmId: string | any;
  batchId: string | any;
  collectionDate: string;
  driverName?: string | null;
  remarks?: string | null;
  status: 'DRAFT' | 'SUBMITTED';
  totalBoxes: number;
  totalChickens: number;
  totalEmptyWeight: number;
  totalLoadedWeight: number;
  totalChickenWeight: number;
  averageChickenWeight: number;
  createdBy: string;
  items: CollectionReportItem[];
  createdAt: string;
}

export async function fetchCollectionReports(filters?: { farmId?: string; vehicleId?: string; status?: string }): Promise<CollectionReport[]> {
  const { data } = await api.get<{ collectionReports: CollectionReport[] }>('/api/v1/admin/collection-reports', {
    params: filters,
  });
  return data.collectionReports;
}

export async function fetchCollectionReport(id: string): Promise<CollectionReport> {
  const { data } = await api.get<{ collectionReport: CollectionReport }>(`/api/v1/admin/collection-reports/${id}`);
  return data.collectionReport;
}

export async function createCollectionReport(payload: Partial<CollectionReport>): Promise<CollectionReport> {
  const { data } = await api.post<{ collectionReport: CollectionReport }>('/api/v1/admin/collection-reports', payload);
  return data.collectionReport;
}

export async function updateCollectionReport(id: string, payload: Partial<CollectionReport>): Promise<CollectionReport> {
  const { data } = await api.put<{ collectionReport: CollectionReport }>(`/api/v1/admin/collection-reports/${id}`, payload);
  return data.collectionReport;
}

export async function submitCollectionReport(id: string): Promise<CollectionReport> {
  const { data } = await api.post<{ collectionReport: CollectionReport }>(`/api/v1/admin/collection-reports/${id}/submit`);
  return data.collectionReport;
}

export async function deleteCollectionReport(id: string): Promise<void> {
  await api.delete(`/api/v1/admin/collection-reports/${id}`);
}
