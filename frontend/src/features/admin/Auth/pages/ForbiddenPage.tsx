import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { ROUTE_PATHS } from '../../../../config/routes';

export default function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <ShieldAlert className="size-16 text-amber-500 mb-4" aria-hidden />
      <h1 className="text-2xl font-bold text-[#090a21] mb-2">Access denied</h1>
      <p className="text-gray-500 max-w-md mb-6">
        You don&apos;t have permission to view this page. Ask a super-admin to grant the required
        permission to your role, then sign out and back in if needed.
      </p>
      <Link
        to={ROUTE_PATHS.ADMIN_DASHBOARD}
        className="text-sm font-semibold text-[oklch(70.4%_0.04_256.788)] hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
