import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../features/auth/useSession';

export function ProtectedRoute() {
  const { data: user, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">Loading...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
