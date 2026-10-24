import { Link, useParams } from 'react-router-dom';
import { useSession } from '../features/auth/useSession';
import { useRoom } from '../features/rooms/useRoom';
import { roomDisplayName } from '../features/rooms/roomDisplayName';
import { MessageList } from '../features/messages/MessageList';
import { MessageInput } from '../features/messages/MessageInput';

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: user } = useSession();
  const room = useRoom(roomId);

  if (room.isLoading) {
    return <p className="p-4 text-sm text-slate-400">Loading chat…</p>;
  }

  if (!room.data || !roomId) {
    return <p className="p-4 text-sm text-slate-400">Chat not found.</p>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-700">
        <Link
          to="/"
          className="text-slate-500 hover:text-slate-800 md:hidden dark:text-slate-400 dark:hover:text-slate-100"
        >
          ←
        </Link>
        <h1 className="font-semibold text-slate-900 dark:text-slate-100">
          {roomDisplayName(room.data, user?._id)}
        </h1>
      </div>
      <MessageList roomId={roomId} />
      <MessageInput roomId={roomId} />
    </div>
  );
}
