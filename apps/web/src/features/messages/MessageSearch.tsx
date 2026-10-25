import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Typography from '@mui/material/Typography';
import { useMessageSearch } from './useMessageSearch';
import { highlightMatches } from './highlightMatches';

interface MessageSearchProps {
  roomId: string;
  onClose: () => void;
}

function jumpToMessage(messageId: string) {
  document.getElementById(`message-${messageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function MessageSearch({ roomId, onClose }: MessageSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const results = useMessageSearch(roomId, query);

  return (
    <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <TextField
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('chat.searchInChat')}
          size="small"
          fullWidth
        />
        <IconButton size="small" onClick={onClose} aria-label={t('chat.close')}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      {query.trim() && (
        <Box sx={{ mt: 1, maxHeight: 192, overflowY: 'auto' }}>
          {results.isLoading && (
            <Typography variant="caption" color="text.secondary">
              {t('chat.searching')}
            </Typography>
          )}

          {results.data?.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              {t('chat.noResults', { query: query.trim() })}
            </Typography>
          )}

          <List disablePadding dense>
            {results.data?.map((message) => (
              <ListItemButton key={message._id} onClick={() => jumpToMessage(message._id)}>
                <Typography variant="body2" noWrap>
                  {highlightMatches(message.content, query)}
                </Typography>
              </ListItemButton>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
