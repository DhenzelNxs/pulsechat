import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRoom, type CreateRoomInput } from '../../api/rooms';

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRoomInput) => createRoom(input).then((res) => res.room),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
