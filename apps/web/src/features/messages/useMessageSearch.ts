import { useQuery } from '@tanstack/react-query';
import { searchMessages } from '../../api/messages';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export function useMessageSearch(roomId: string | undefined, query: string) {
  const debounced = useDebouncedValue(query.trim(), 300);

  return useQuery({
    queryKey: ['rooms', roomId, 'messages', 'search', debounced],
    queryFn: () => searchMessages(roomId as string, debounced).then((res) => res.messages),
    enabled: Boolean(roomId) && debounced.length > 0,
  });
}
