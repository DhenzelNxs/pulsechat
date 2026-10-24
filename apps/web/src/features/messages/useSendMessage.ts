import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '../../api/messages';

export function useSendMessage(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessage(roomId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', roomId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
