import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import { useRooms } from './useRooms';
import { roomDisplayName } from './roomDisplayName';
import { NewChatModal } from './NewChatModal';

export function RoomList() {
  const { t } = useTranslation();
  const { data: user } = useSession();
  const rooms = useRooms();
  const navigate = useNavigate();
  const [showNewChat, setShowNewChat] = useState(false);

  return (
    <nav className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t('chat.chats')}</h2>
        <button
          type="button"
          onClick={() => setShowNewChat(true)}
          className="rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          {t('chat.newChat')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rooms.isLoading && <p className="p-4 text-sm text-slate-400">{t('chat.loadingChats')}</p>}

        {rooms.data?.length === 0 && (
          <p className="p-4 text-sm text-slate-400">{t('chat.noChatsYet')}</p>
        )}

        {rooms.data?.map((room) => (
          <NavLink
            key={room._id}
            to={`/rooms/${room._id}`}
            className={({ isActive }) =>
              `block border-b border-slate-100 px-4 py-3 text-sm dark:border-slate-800 ${
                isActive
                  ? 'bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
              }`
            }
          >
            {roomDisplayName(room, user?._id)}
          </NavLink>
        ))}
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreated={(room) => navigate(`/rooms/${room._id}`)}
        />
      )}
    </nav>
  );
}
