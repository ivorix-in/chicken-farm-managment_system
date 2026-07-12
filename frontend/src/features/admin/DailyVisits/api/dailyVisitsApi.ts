import { api } from '../../Auth/api/adminAuthApi';

export interface DailyVisit {
  id: string;
  batchId: string;
  supervisorId: string | any;
  visitDate: string;
  mortalityToday: number;
  mortalityTotal: number;
  cullsToday: number;
  weakBirdsToday: number;
  ownUseToday: number;
  birdCount: number;
  approxWeightKg: number;
  feedUsedKg: number;
  feedBagsUsed: number;
  remarks?: string;
  notifyDoctor?: boolean;
  createdAt: string;
}

export async function fetchDailyVisits(): Promise<DailyVisit[]> {
  const { data } = await api.get<{ visits: DailyVisit[] }>('/api/v1/admin/daily-visits');
  return data.visits;
}

export async function fetchBatchVisits(batchId: string): Promise<DailyVisit[]> {
  const { data } = await api.get<{ visits: DailyVisit[] }>(`/api/v1/admin/daily-visits/batch/${batchId}`);
  return data.visits;
}

export interface CreateDailyVisitPayload {
  batchId: string;
  visitDate: string;
  mortalityToday: number;
  cullsToday: number;
  weakBirdsToday: number;
  ownUseToday: number;
  approxWeightKg: number;
  feedUsedKg: number;
  feedBagsUsed: number;
  remarks?: string;
  notifyDoctor?: boolean;
}

export async function createDailyVisit(payload: CreateDailyVisitPayload): Promise<DailyVisit> {
  const { data } = await api.post<{ visit: DailyVisit }>('/api/v1/admin/daily-visits', payload);
  return data.visit;
}
