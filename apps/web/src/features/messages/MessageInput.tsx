import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { useSendMessage } from './useSendMessage';

interface MessageInputProps {
  roomId: string;
  onTyping?: () => void;
  onStopTyping?: () => void;
}

export function MessageInput({ roomId, onTyping, onStopTyping }: MessageInputProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const sendMessage = useSendMessage(roomId);

  const submit = () => {
    const trimmed = content.trim();
    if (!trimmed || sendMessage.isPending) {
      return;
    }

    onStopTyping?.();
    sendMessage.mutate(trimmed, {
      onSuccess: () => setContent(''),
    });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, p: 1.5, borderTop: 1, borderColor: 'divider' }}>
      <TextField
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          if (event.target.value) {
            onTyping?.();
          } else {
            onStopTyping?.();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={t('chat.writeMessage')}
        multiline
        maxRows={6}
        fullWidth
        size="small"
      />
      <IconButton
        color="primary"
        onClick={submit}
        disabled={!content.trim() || sendMessage.isPending}
        aria-label={t('chat.send')}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}
