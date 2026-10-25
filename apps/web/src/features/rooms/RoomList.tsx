import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import { useSession } from '../auth/useSession';
import { useRooms } from './useRooms';
import { roomDisplayName } from './roomDisplayName';
import { RoomAvatar } from './RoomAvatar';
import { NewChatModal } from './NewChatModal';

export function RoomList() {
  const { t } = useTranslation();
  const { data: user } = useSession();
  const rooms = useRooms();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNewChat, setShowNewChat] = useState(false);

  return (
    <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack
        direction="row"
        sx={{ p: 2, borderBottom: 1, borderColor: 'divider', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          {t('chat.chats')}
        </Typography>
        <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setShowNewChat(true)}>
          {t('chat.newChat')}
        </Button>
      </Stack>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {rooms.isLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            {t('chat.loadingChats')}
          </Typography>
        )}

        {rooms.data?.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            {t('chat.noChatsYet')}
          </Typography>
        )}

        <List disablePadding>
          {rooms.data?.map((room) => {
            const isActive = location.pathname === `/rooms/${room._id}`;
            return (
              <ListItemButton key={room._id} component={Link} to={`/rooms/${room._id}`} selected={isActive} divider>
                <ListItemAvatar>
                  <RoomAvatar room={room} currentUserId={user?._id} />
                </ListItemAvatar>
                <ListItemText slotProps={{ primary: { noWrap: true } }} primary={roomDisplayName(room, user?._id)} />
                {room.unreadCount > 0 && (
                  <Chip
                    label={room.unreadCount > 99 ? '99+' : room.unreadCount}
                    color="primary"
                    size="small"
                    aria-label={t('chat.unreadCount', { count: room.unreadCount })}
                    sx={{ ml: 1, height: 20, minWidth: 20, fontSize: '0.7rem', flexShrink: 0 }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {showNewChat && (
        <NewChatModal onClose={() => setShowNewChat(false)} onCreated={(room) => navigate(`/rooms/${room._id}`)} />
      )}
    </Box>
  );
}
