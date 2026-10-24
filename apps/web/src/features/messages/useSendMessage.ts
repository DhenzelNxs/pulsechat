import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '../../api/messages';
import { prependMessage } from './messageCache';

export function useSendMessage(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessage(roomId, content),
    onSuccess: ({ message }) => {
      prependMessage(queryClient, roomId, message);
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
