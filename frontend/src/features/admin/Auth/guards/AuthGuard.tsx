import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTE_PATHS } from '../../../../config/routes';
import { useAdminSession } from '../hooks/useAdminSession';
import { AuthRouteFallback } from './AuthRouteFallback';

type AuthGuardProps = { requireAuth?: boolean };

/** `requireAuth` true: protected subtree. false: login-only subtree (redirects to dashboard when already signed in). */
export function AuthGuard({ requireAuth = true }: AuthGuardProps) {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAdminSession();

  if (isLoading) {
    return <AuthRouteFallback />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.ADMIN_LOGIN} replace state={{ from: location }} />;
  }

  if (!requireAuth && isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.ADMIN_DASHBOARD} replace />;
  }

  return <Outlet />;
}
