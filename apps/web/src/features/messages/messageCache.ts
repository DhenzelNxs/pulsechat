import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { Message, MessagePage } from '../../api/messages';

export function prependMessage(queryClient: QueryClient, roomId: string, message: Message): void {
  queryClient.setQueryData<InfiniteData<MessagePage>>(['rooms', roomId, 'messages'], (current) => {
    if (!current) {
      return current;
    }

    const [firstPage, ...rest] = current.pages;
    if (!firstPage) {
      return current;
    }
    if (firstPage.messages.some((existing) => existing._id === message._id)) {
      return current;
    }

    return {
      ...current,
      pages: [{ ...firstPage, messages: [message, ...firstPage.messages] }, ...rest],
    };
  });
}
