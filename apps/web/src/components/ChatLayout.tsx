import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { RoomList } from '../features/rooms/RoomList';
import { ThemeToggle } from './ThemeToggle';
import { useLogout } from '../features/auth/useLogout';

export function ChatLayout() {
  const location = useLocation();
  const hasActiveRoom = location.pathname.startsWith('/rooms/');
  const navigate = useNavigate();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate('/login') });
  };

  return (
    <div className="flex h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <aside
        className={`w-full border-r border-slate-200 dark:border-slate-700 md:w-80 md:shrink-0 ${
          hasActiveRoom ? 'hidden md:flex md:flex-col' : 'flex flex-col'
        }`}
      >
        <RoomList />
        <div className="flex items-center justify-between border-t border-slate-200 p-3 dark:border-slate-700">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className={`flex-1 ${hasActiveRoom ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}>
        <Outlet />
      </main>
    </div>
  );
}
