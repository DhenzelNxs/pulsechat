import { useQuery } from '@tanstack/react-query';
import { listMessages } from '../../api/messages';

export function useMessages(roomId: string | undefined) {
  return useQuery({
    queryKey: ['rooms', roomId, 'messages'],
    queryFn: () => listMessages(roomId as string, { limit: 50 }),
    enabled: Boolean(roomId),
  });
}
