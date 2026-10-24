import { useNavigate } from 'react-router-dom';
import { useSession } from '../features/auth/useSession';
import { useLogout } from '../features/auth/useLogout';

export function HomePage() {
  const navigate = useNavigate();
  const { data: user } = useSession();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate('/login') });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100">
      <p className="text-lg text-slate-700">Logged in as {user?.username}</p>
      <p className="text-sm text-slate-500">
        The chat UI lands in the next card — see docs/SPEC.md §15.
      </p>
      <button
        type="button"
        onClick={handleLogout}
        disabled={logout.isPending}
        className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {logout.isPending ? 'Logging out…' : 'Log out'}
      </button>
    </div>
  );
}
