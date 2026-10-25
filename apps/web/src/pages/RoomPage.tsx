import { useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import { useSession } from '../features/auth/useSession';
import { useRoom } from '../features/rooms/useRoom';
import { roomDisplayName } from '../features/rooms/roomDisplayName';
import { GroupMembersDialog } from '../features/rooms/GroupMembersDialog';
import { RoomAvatar } from '../features/rooms/RoomAvatar';
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
  const [showMembers, setShowMembers] = useState(false);

  if (room.isLoading) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        {t('chat.loadingChat')}
      </Typography>
    );
  }

  if (!room.data || !roomId) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        {t('chat.chatNotFound')}
      </Typography>
    );
  }

  const otherMember =
    room.data.type === 'dm' ? room.data.memberIds.find((member) => member._id !== user?._id) : undefined;
  const isOtherMemberOnline = otherMember ? onlineUserIds.has(otherMember._id) : false;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack direction="row" spacing={1.5} sx={{ p: 2, borderBottom: 1, borderColor: 'divider', alignItems: 'center' }}>
        <IconButton
          component={Link}
          to="/"
          size="small"
          aria-label={t('chat.backToChats')}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0, alignItems: 'center' }}>
          <RoomAvatar room={room.data} currentUserId={user?._id} size={32} />
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
            {roomDisplayName(room.data, user?._id)}
          </Typography>
          {otherMember && (
            <Box
              component="span"
              title={isOtherMemberOnline ? t('chat.online') : t('chat.offline')}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: isOtherMemberOnline ? 'success.main' : 'action.disabled',
                flexShrink: 0,
              }}
            />
          )}
        </Stack>
        {room.data.type === 'group' && (
          <Tooltip title={t('chat.members')}>
            <IconButton size="small" aria-label={t('chat.members')} onClick={() => setShowMembers(true)}>
              <GroupIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={showSearch ? t('chat.hideSearch') : t('chat.search')}>
          <IconButton
            size="small"
            aria-label={showSearch ? t('chat.hideSearch') : t('chat.search')}
            onClick={() => setShowSearch((current) => !current)}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      {showMembers && (
        <GroupMembersDialog members={room.data.memberIds} onClose={() => setShowMembers(false)} />
      )}
      {showSearch && <MessageSearch roomId={roomId} onClose={() => setShowSearch(false)} />}
      <MessageList roomId={roomId} otherMemberId={otherMember?._id} />
      {typingUsers.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, pb: 0.5, fontStyle: 'italic' }}>
          {typingLabel(
            t,
            typingUsers.map((typingUser) => typingUser.username),
          )}
        </Typography>
      )}
      <MessageInput roomId={roomId} onTyping={notifyTyping} onStopTyping={stopTyping} />
    </Box>
  );
}
