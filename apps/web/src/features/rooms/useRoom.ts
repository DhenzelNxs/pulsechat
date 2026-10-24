import { useQuery } from '@tanstack/react-query';
import { getRoom } from '../../api/rooms';

export function useRoom(roomId: string | undefined) {
  return useQuery({
    queryKey: ['rooms', roomId],
    queryFn: () => getRoom(roomId as string).then((res) => res.room),
    enabled: Boolean(roomId),
  });
}
