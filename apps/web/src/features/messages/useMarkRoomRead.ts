import { useMutation } from '@tanstack/react-query';
import { markRoomRead } from '../../api/rooms';

export function useMarkRoomRead(roomId: string | undefined) {
  return useMutation({
    mutationFn: () => markRoomRead(roomId as string),
  });
}
