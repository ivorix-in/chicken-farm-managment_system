import { api } from '../../Auth/api/adminAuthApi';

export interface DashboardKPIs {
  activeFarms: number;
  activeBatches: number;
  activeBirds: number;
  totalMortality: number;
  mortalityPct: number;
  feedStock: Array<{
    feedType: string;
    quantityKg: number;
    unitCostPerKg: number;
    lowStock: boolean;
  }>;
  todaysVisits: number;
  alerts: {
    lowFeed: Array<{ feedType: string; quantityKg: number }>;
    lowMedicine: Array<{ name: string; quantityUnits: number; unit: string }>;
  };
}

export async function fetchDashboardKpis(): Promise<DashboardKPIs> {
  const { data } = await api.get<{ kpis: DashboardKPIs }>('/api/v1/admin/dashboard/kpis');
  return data.kpis;
}
