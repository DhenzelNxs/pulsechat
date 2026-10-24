import { useState } from 'react';
import type { User } from '../../api/auth';
import type { Room } from '../../api/rooms';
import { useCreateRoom } from './useCreateRoom';
import { useUserSearch } from './useUserSearch';

interface NewChatModalProps {
  onClose: () => void;
  onCreated: (room: Room) => void;
}

export function NewChatModal({ onClose, onCreated }: NewChatModalProps) {
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
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">New chat</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setType('dm');
              setSelected((current) => current.slice(0, 1));
            }}
            className={`rounded px-3 py-1 text-sm ${
              type === 'dm'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            }`}
          >
            Direct message
          </button>
          <button
            type="button"
            onClick={() => setType('group')}
            className={`rounded px-3 py-1 text-sm ${
              type === 'group'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            }`}
          >
            Group
          </button>
        </div>

        {type === 'group' && (
          <input
            type="text"
            placeholder="Group name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        )}

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((user) => (
              <span
                key={user._id}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200"
              >
                {user.username}
              </span>
            ))}
          </div>
        )}

        <input
          type="text"
          placeholder="Search by username"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />

        <div className="max-h-40 space-y-1 overflow-y-auto">
          {search.data?.map((user) => (
            <button
              key={user._id}
              type="button"
              onClick={() => toggleUser(user)}
              className="block w-full rounded px-2 py-1 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {user.username}
            </button>
          ))}
          {search.isFetched && search.data?.length === 0 && (
            <p className="px-2 py-1 text-sm text-slate-400">No users found</p>
          )}
        </div>

        {createRoom.isError && (
          <p className="text-sm text-red-600">Could not create the chat. Try again.</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || createRoom.isPending}
          className="w-full rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          {createRoom.isPending ? 'Creating…' : 'Start chat'}
        </button>
      </div>
    </div>
  );
}
