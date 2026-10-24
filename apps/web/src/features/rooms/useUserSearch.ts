import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../../api/rooms';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export function useUserSearch(term: string) {
  const debounced = useDebouncedValue(term.trim(), 300);

  return useQuery({
    queryKey: ['users', 'search', debounced],
    queryFn: () => searchUsers(debounced).then((res) => res.users),
    enabled: debounced.length > 0,
  });
}
