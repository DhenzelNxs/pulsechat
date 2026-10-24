import { useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
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

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
      <textarea
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          if (event.target.value) {
            onTyping?.();
          } else {
            onStopTyping?.();
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={t('chat.writeMessage')}
        rows={1}
        className="flex-1 resize-none rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!content.trim() || sendMessage.isPending}
        className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      >
        {t('chat.send')}
      </button>
    </div>
  );
}
