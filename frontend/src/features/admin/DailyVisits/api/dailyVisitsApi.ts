import { api } from '../../Auth/api/adminAuthApi';

export interface DailyVisit {
  id: string;
  batchId: string;
  supervisorId: string;
  mortalityToday: number;
  mortalityTotal: number;
  birdCount: number;
  approxWeight?: number;
  feedUsed?: number;
  remarks?: string;
  visitedAt: string;
  createdAt: string;
}

export async function fetchDailyVisits(): Promise<DailyVisit[]> {
  const { data } = await api.get<{ data: DailyVisit[] }>('/api/v1/admin/daily-visits');
  return data.data;
}
