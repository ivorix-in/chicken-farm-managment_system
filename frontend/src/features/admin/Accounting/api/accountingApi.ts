import { api } from '../../Auth/api/adminAuthApi';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  referenceId?: string;
  description: string;
  batchId?: string;
  farmId?: string;
  createdAt: string;
}

export interface PnlSummary {
  income: number;
  expenses: number;
  netProfit: number;
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data } = await api.get<{ data: Transaction[] }>('/api/v1/admin/accounting/transactions');
  return data.data;
}

export async function createTransaction(payload: Partial<Transaction>): Promise<Transaction> {
  const { data } = await api.post<{ data: Transaction }>('/api/v1/admin/accounting/transactions', payload);
  return data.data;
}

export async function fetchPnlSummary(): Promise<PnlSummary> {
  const { data } = await api.get<{ data: PnlSummary }>('/api/v1/admin/accounting/pnl/summary');
  return data.data;
}
