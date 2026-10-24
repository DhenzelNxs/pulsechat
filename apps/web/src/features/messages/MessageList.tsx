import { useEffect, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '../auth/useSession';
import { useMessages } from './useMessages';
import { useMarkRoomRead } from './useMarkRoomRead';
import { MessageContent } from './MessageContent';

interface MessageListProps {
  roomId: string;
  otherMemberId?: string;
}

const LOAD_MORE_THRESHOLD_PX = 100;

export function MessageList({ roomId, otherMemberId }: MessageListProps) {
  const { t } = useTranslation();
  const { data: user } = useSession();
  const messages = useMessages(roomId);
  const { mutate: markRead } = useMarkRoomRead(roomId);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);

  const pages = messages.data?.pages ?? [];
  const ordered = pages.flatMap((page) => page.messages).reverse();
  const newestPageCount = pages[0]?.messages.length ?? 0;

  useEffect(() => {
    if (roomId && newestPageCount > 0) {
      markRead();
    }
  }, [roomId, newestPageCount, markRead]);

  useEffect(() => {
    if (prevScrollHeightRef.current === 0) {
      bottomRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [newestPageCount]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || prevScrollHeightRef.current === 0) {
      return;
    }
    container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
    prevScrollHeightRef.current = 0;
  }, [pages.length]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || !messages.hasNextPage || messages.isFetchingNextPage) {
      return;
    }
    if (container.scrollTop < LOAD_MORE_THRESHOLD_PX) {
      prevScrollHeightRef.current = container.scrollHeight;
      messages.fetchNextPage();
    }
  };

  if (messages.isLoading) {
    return <p className="p-4 text-sm text-slate-400">{t('chat.loadingMessages')}</p>;
  }

  if (ordered.length === 0) {
    return <p className="p-4 text-sm text-slate-400">{t('chat.noMessagesYet')}</p>;
  }

  const lastMessage = ordered[ordered.length - 1];
  const showSeenIndicator = Boolean(lastMessage && lastMessage.senderId === user?._id);
  const lastMessageSeen = Boolean(
    showSeenIndicator && otherMemberId && lastMessage?.readBy.includes(otherMemberId),
  );

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 space-y-2 overflow-y-auto p-4"
    >
      {messages.isFetchingNextPage && (
        <p className="pb-2 text-center text-xs text-slate-400">
          {t('chat.loadingOlderMessages')}
        </p>
      )}
      {ordered.map((message) => {
        const isOwn = message.senderId === user?._id;
        return (
          <div
            key={message._id}
            id={`message-${message._id}`}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs rounded-lg px-3 py-2 text-sm break-words sm:max-w-sm ${
                isOwn
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
              }`}
            >
              <MessageContent content={message.content} />
            </div>
          </div>
        );
      })}
      {showSeenIndicator && (
        <p className="pr-1 text-right text-xs text-slate-400">
          {lastMessageSeen ? t('chat.seen') : t('chat.sent')}
        </p>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
