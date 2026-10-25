import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribe, unsubscribe } from '../../lib/pusher';
import { useSession } from '../auth/useSession';

export function useUserChannel() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useSession();
  const userId = currentUser?._id;

  useEffect(() => {
    if (!userId) {
      return;
    }

    const channelName = `private-user-${userId}`;
    const channel = subscribe(channelName);

    const handleRoomUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    };

    channel.bind('room:updated', handleRoomUpdated);

    return () => {
      channel.unbind('room:updated', handleRoomUpdated);
      unsubscribe(channelName);
    };
  }, [userId, queryClient]);
}
