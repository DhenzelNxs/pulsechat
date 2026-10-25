import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markRoomRead } from '../../api/rooms';

export function useMarkRoomRead(roomId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markRoomRead(roomId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
