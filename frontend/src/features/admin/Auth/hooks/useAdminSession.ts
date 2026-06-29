import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ADMIN_TOKEN_KEY,
  clearStoredToken,
  fetchAdminMe,
  type AdminMe,
} from '../api/adminAuthApi';

export const adminMeQueryKey = ['admin', 'me'] as const;

export function useAdminSession() {
  const token =
    typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_TOKEN_KEY) : null;

  const { data: admin, isPending, isError, error, refetch } = useQuery<AdminMe>({
    queryKey: adminMeQueryKey,
    queryFn: fetchAdminMe,
    enabled: Boolean(token),
    retry: false,
    staleTime: 60 * 1000,
  });

  const isAuthenticated = Boolean(token) && Boolean(admin) && !isError;

  return {
    admin,
    token,
    isLoading: Boolean(token) && isPending,
    isAuthenticated,
    isError,
    error,
    refetch,
  };
}

export function useInvalidateAdminSession() {
  const queryClient = useQueryClient();
  return () => {
    clearStoredToken();
    queryClient.removeQueries({ queryKey: adminMeQueryKey });
  };
}
