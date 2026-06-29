import axios from 'axios';

/** Base URL — no trailing slash. In dev with Vite proxy (`/api` → backend), leave unset so requests stay same-origin. */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export const ADMIN_TOKEN_KEY = 'chicken_farm_management_admin_access_token';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Clear token after 401 unless the request was for login page (no token yet). */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      const path = err.config?.url ?? '';
      if (!path.includes('/auth/login')) {
        clearStoredToken();
      }
    }
    return Promise.reject(err);
  }
);

export function getStoredToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export interface AdminMe {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: { code?: string | null; permissions?: unknown };
}

export async function loginAdmin({ email, password }: { email: string; password: string }) {
  const { data } = await api.post<{
    accessToken: string;
    admin: AdminMe;
  }>('/api/v1/admin/auth/login', { email, password });
  return data;
}

export async function fetchAdminMe(): Promise<AdminMe> {
  const { data } = await api.get<{ admin: AdminMe }>('/api/v1/admin/auth/me');
  return data.admin;
}
