import { useQuery } from '@tanstack/react-query';
import { listRooms } from '../../api/rooms';

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: () => listRooms().then((res) => res.rooms),
  });
}
