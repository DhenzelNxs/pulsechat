import { useEffect, useRef } from 'react';
import { useSession } from '../auth/useSession';
import { useMessages } from './useMessages';

interface MessageListProps {
  roomId: string;
}

export function MessageList({ roomId }: MessageListProps) {
  const { data: user } = useSession();
  const messages = useMessages(roomId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const ordered = messages.data ? [...messages.data.messages].reverse() : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [ordered.length]);

  if (messages.isLoading) {
    return <p className="p-4 text-sm text-slate-400">Loading messages…</p>;
  }

  if (ordered.length === 0) {
    return <p className="p-4 text-sm text-slate-400">No messages yet. Say hi!</p>;
  }

  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-4">
      {ordered.map((message) => {
        const isOwn = message.senderId === user?._id;
        return (
          <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs rounded-lg px-3 py-2 text-sm break-words sm:max-w-sm ${
                isOwn
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
              }`}
            >
              {message.content}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
