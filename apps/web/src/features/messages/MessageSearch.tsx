import { useState } from 'react';
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
  const [query, setQuery] = useState('');
  const results = useMessageSearch(roomId, query);

  return (
    <div className="border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search in this chat…"
          className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
        />
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
        >
          Close
        </button>
      </div>

      {query.trim() && (
        <div className="mt-2 max-h-48 overflow-y-auto">
          {results.isLoading && <p className="text-xs text-slate-400">Searching…</p>}

          {results.data?.length === 0 && (
            <p className="text-xs text-slate-400">No messages match “{query.trim()}”.</p>
          )}

          {results.data?.map((message) => (
            <button
              key={message._id}
              type="button"
              onClick={() => jumpToMessage(message._id)}
              className="block w-full rounded px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {highlightMatches(message.content, query)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
