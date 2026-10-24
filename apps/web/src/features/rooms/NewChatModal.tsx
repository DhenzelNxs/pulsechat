import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import type { User } from '../../api/auth';
import type { Room } from '../../api/rooms';
import { displayName } from '../../lib/displayName';
import { useCreateRoom } from './useCreateRoom';
import { useUserSearch } from './useUserSearch';

interface NewChatModalProps {
  onClose: () => void;
  onCreated: (room: Room) => void;
}

export function NewChatModal({ onClose, onCreated }: NewChatModalProps) {
  const { t } = useTranslation();
  const [type, setType] = useState<'dm' | 'group'>('dm');
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<User[]>([]);
  const search = useUserSearch(query);
  const createRoom = useCreateRoom();

  const canSubmit =
    type === 'dm' ? selected.length === 1 : selected.length >= 1 && name.trim().length > 0;

  const toggleUser = (user: User) => {
    if (type === 'dm') {
      setSelected([user]);
      return;
    }

    setSelected((current) =>
      current.some((u) => u._id === user._id)
        ? current.filter((u) => u._id !== user._id)
        : [...current, user],
    );
  };

  const handleSubmit = () => {
    createRoom.mutate(
      {
        type,
        name: type === 'group' ? name.trim() : undefined,
        memberIds: selected.map((u) => u._id),
      },
      {
        onSuccess: (room) => {
          onCreated(room);
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {t('newChatModal.title')}
        <IconButton aria-label={t('newChatModal.close')} onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <ToggleButtonGroup
            exclusive
            value={type}
            onChange={(_event, value: 'dm' | 'group' | null) => {
              if (!value) {
                return;
              }
              setType(value);
              if (value === 'dm') {
                setSelected((current) => current.slice(0, 1));
              }
            }}
            size="small"
          >
            <ToggleButton value="dm">{t('newChatModal.directMessage')}</ToggleButton>
            <ToggleButton value="group">{t('newChatModal.group')}</ToggleButton>
          </ToggleButtonGroup>

          {type === 'group' && (
            <TextField
              size="small"
              placeholder={t('newChatModal.groupNamePlaceholder')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              fullWidth
            />
          )}

          {selected.length > 0 && (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {selected.map((user) => (
                <Chip key={user._id} label={displayName(user)} size="small" />
              ))}
            </Stack>
          )}

          <TextField
            size="small"
            placeholder={t('newChatModal.searchPlaceholder')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            fullWidth
          />

          <Box sx={{ maxHeight: 160, overflowY: 'auto' }}>
            <List disablePadding dense>
              {search.data?.map((user) => {
                const name = displayName(user);
                const hasFullName = name !== user.username;
                return (
                  <ListItemButton key={user._id} onClick={() => toggleUser(user)}>
                    <ListItemText primary={name} secondary={hasFullName ? `@${user.username}` : undefined} />
                  </ListItemButton>
                );
              })}
            </List>
            {search.isFetched && search.data?.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
                {t('newChatModal.noUsersFound')}
              </Typography>
            )}
          </Box>

          {createRoom.isError && <Alert severity="error">{t('newChatModal.error')}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button fullWidth variant="contained" onClick={handleSubmit} disabled={!canSubmit || createRoom.isPending}>
          {createRoom.isPending ? t('newChatModal.creating') : t('newChatModal.startChat')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
