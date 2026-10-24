import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage, type MessagePage } from '../../api/messages';

export function useSendMessage(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sendMessage(roomId, content),
    onSuccess: ({ message }) => {
      queryClient.setQueryData<MessagePage>(['rooms', roomId, 'messages'], (current) => {
        if (!current) {
          return current;
        }
        if (current.messages.some((existing) => existing._id === message._id)) {
          return current;
        }
        return { ...current, messages: [message, ...current.messages] };
      });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
