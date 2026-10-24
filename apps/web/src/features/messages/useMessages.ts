import { useInfiniteQuery } from '@tanstack/react-query';
import { listMessages } from '../../api/messages';

export function useMessages(roomId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['rooms', roomId, 'messages'],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      listMessages(roomId as string, { cursor: pageParam, limit: 50 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(roomId),
  });
}
