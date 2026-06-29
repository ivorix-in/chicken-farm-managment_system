import axios from 'axios';
import { api } from '../../Auth/api/adminAuthApi';
import type { Seller, SellerInput } from '../types/seller';

const PREFIX = '/api/v1/admin';

export function getSellerApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as {
      error?: { message?: string; details?: { fieldErrors?: Record<string, string[]> } };
    };
    if (data?.error?.message) return data.error.message;
  }
  return fallback;
}

export async function fetchSellers(): Promise<Seller[]> {
  const { data } = await api.get<{ sellers: Seller[] }>(`${PREFIX}/sellers`);
  return data.sellers;
}

export async function fetchSellerById(id: string): Promise<Seller | null> {
  try {
    const { data } = await api.get<{ seller: Seller }>(`${PREFIX}/sellers/${id}`);
    return data.seller;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function createSeller(input: SellerInput & { password: string }): Promise<Seller> {
  const { data } = await api.post<{ seller: Seller }>(`${PREFIX}/sellers`, input);
  return data.seller;
}

export async function updateSeller(id: string, input: SellerInput): Promise<Seller> {
  const { data } = await api.patch<{ seller: Seller }>(`${PREFIX}/sellers/${id}`, input);
  return data.seller;
}

export async function deleteSeller(id: string): Promise<void> {
  await api.delete(`${PREFIX}/sellers/${id}`);
}
