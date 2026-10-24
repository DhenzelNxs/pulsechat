import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { RoomList } from '../features/rooms/RoomList';
import { ThemeToggle } from './ThemeToggle';
import { useLogout } from '../features/auth/useLogout';
import { useSession } from '../features/auth/useSession';
import { displayName, initials } from '../lib/displayName';

export function ChatLayout() {
  const location = useLocation();
  const hasActiveRoom = location.pathname.startsWith('/rooms/');
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: currentUser } = useSession();

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
        <div className="border-t border-slate-200 dark:border-slate-700">
          {currentUser && (
            <div className="flex items-center gap-2 px-3 pt-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
                {initials(currentUser)}
              </span>
              <span className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {displayName(currentUser)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between p-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <main className={`flex-1 ${hasActiveRoom ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}>
        <Outlet />
      </main>
    </div>
  );
}
