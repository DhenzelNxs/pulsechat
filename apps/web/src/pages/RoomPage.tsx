import { useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useSession } from '../features/auth/useSession';
import { useRoom } from '../features/rooms/useRoom';
import { roomDisplayName } from '../features/rooms/roomDisplayName';
import { MessageList } from '../features/messages/MessageList';
import { MessageInput } from '../features/messages/MessageInput';
import { MessageSearch } from '../features/messages/MessageSearch';
import { useRoomChannel } from '../features/realtime/useRoomChannel';

function typingLabel(t: TFunction, usernames: string[]): string {
  if (usernames.length === 1) {
    return t('chat.typingOne', { name: usernames[0] });
  }
  if (usernames.length === 2) {
    return t('chat.typingTwo', { name1: usernames[0], name2: usernames[1] });
  }
  return t('chat.typingMany', { count: usernames.length });
}

export function RoomPage() {
  const { t } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();
  const { data: user } = useSession();
  const room = useRoom(roomId);
  const { onlineUserIds, typingUsers, notifyTyping, stopTyping } = useRoomChannel(roomId);
  const [showSearch, setShowSearch] = useState(false);

  if (room.isLoading) {
    return <p className="p-4 text-sm text-slate-400">{t('chat.loadingChat')}</p>;
  }

  if (!room.data || !roomId) {
    return <p className="p-4 text-sm text-slate-400">{t('chat.chatNotFound')}</p>;
  }

  const otherMember =
    room.data.type === 'dm' ? room.data.memberIds.find((member) => member._id !== user?._id) : undefined;
  const isOtherMemberOnline = otherMember ? onlineUserIds.has(otherMember._id) : false;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
        <Link
          to="/"
          className="text-slate-500 hover:text-slate-800 md:hidden dark:text-slate-400 dark:hover:text-slate-100"
        >
          ←
        </Link>
        <h1 className="flex flex-1 items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          {roomDisplayName(room.data, user?._id)}
          {otherMember && (
            <span
              className={`h-2 w-2 rounded-full ${isOtherMemberOnline ? 'bg-green-500' : 'bg-slate-400 dark:bg-slate-600'}`}
              title={isOtherMemberOnline ? t('chat.online') : t('chat.offline')}
            />
          )}
        </h1>
        <button
          type="button"
          onClick={() => setShowSearch((current) => !current)}
          className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
        >
          {showSearch ? t('chat.hideSearch') : t('chat.search')}
        </button>
      </div>
      {showSearch && <MessageSearch roomId={roomId} onClose={() => setShowSearch(false)} />}
      <MessageList roomId={roomId} otherMemberId={otherMember?._id} />
      {typingUsers.length > 0 && (
        <p className="px-4 pb-1 text-xs text-slate-400 italic">
          {typingLabel(
            t,
            typingUsers.map((typingUser) => typingUser.username),
          )}
        </p>
      )}
      <MessageInput roomId={roomId} onTyping={notifyTyping} onStopTyping={stopTyping} />
    </div>
  );
}
