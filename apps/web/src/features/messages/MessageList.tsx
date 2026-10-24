import { useEffect, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        {t('chat.loadingMessages')}
      </Typography>
    );
  }

  if (ordered.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        {t('chat.noMessagesYet')}
      </Typography>
    );
  }

  const lastMessage = ordered[ordered.length - 1];
  const showSeenIndicator = Boolean(lastMessage && lastMessage.senderId === user?._id);
  const lastMessageSeen = Boolean(
    showSeenIndicator && otherMemberId && lastMessage?.readBy.includes(otherMemberId),
  );

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
    >
      {messages.isFetchingNextPage && (
        <Typography variant="caption" color="text.secondary" sx={{ pb: 1, textAlign: 'center' }}>
          {t('chat.loadingOlderMessages')}
        </Typography>
      )}
      {ordered.map((message) => {
        const isOwn = message.senderId === user?._id;
        return (
          <Box
            key={message._id}
            id={`message-${message._id}`}
            sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}
          >
            <Box
              sx={{
                maxWidth: { xs: 280, sm: 360 },
                borderRadius: 2,
                px: 1.5,
                py: 1,
                fontSize: '0.875rem',
                wordBreak: 'break-word',
                bgcolor: isOwn ? 'primary.main' : 'action.hover',
                color: isOwn ? 'primary.contrastText' : 'text.primary',
              }}
            >
              <MessageContent content={message.content} />
            </Box>
          </Box>
        );
      })}
      {showSeenIndicator && (
        <Typography variant="caption" color="text.secondary" sx={{ pr: 0.5, textAlign: 'right' }}>
          {lastMessageSeen ? t('chat.seen') : t('chat.sent')}
        </Typography>
      )}
      <div ref={bottomRef} />
    </Box>
  );
}
