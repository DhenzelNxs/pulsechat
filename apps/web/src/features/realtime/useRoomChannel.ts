import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Channel, PresenceChannel } from 'pusher-js';
import { subscribe, unsubscribe } from '../../lib/pusher';
import { useSession } from '../auth/useSession';
import type { Message, MessagePage } from '../../api/messages';

const TYPING_IDLE_MS = 3000;

export interface TypingUser {
  userId: string;
  username: string;
}

interface PresenceMember {
  id: string;
}

export function useRoomChannel(roomId: string | undefined) {
  const queryClient = useQueryClient();
  const { data: currentUser } = useSession();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<Channel | null>(null);
  const typingTimeoutsRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const isTypingRef = useRef(false);
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const messageChannel = subscribe(`private-room-${roomId}`);
    const presenceChannel = subscribe(`presence-room-${roomId}`) as PresenceChannel;
    channelRef.current = messageChannel;
    const typingTimeouts = typingTimeoutsRef.current;

    const clearTypingTimeout = (userId: string) => {
      const timeout = typingTimeouts.get(userId);
      if (timeout) {
        clearTimeout(timeout);
        typingTimeouts.delete(userId);
      }
    };

    const removeTypingUser = (userId: string) => {
      clearTypingTimeout(userId);
      setTypingUsers((current) => current.filter((user) => user.userId !== userId));
    };

    const handleNewMessage = (message: Message) => {
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
    };

    const handleTypingStart = (payload: TypingUser) => {
      if (payload.userId === currentUser?._id) {
        return;
      }

      clearTypingTimeout(payload.userId);
      setTypingUsers((current) => {
        if (current.some((user) => user.userId === payload.userId)) {
          return current;
        }
        return [...current, payload];
      });
      typingTimeoutsRef.current.set(
        payload.userId,
        setTimeout(() => removeTypingUser(payload.userId), TYPING_IDLE_MS),
      );
    };

    const handleTypingStop = (payload: { userId: string }) => {
      removeTypingUser(payload.userId);
    };

    const handleSubscriptionSucceeded = () => {
      const ids = new Set<string>();
      presenceChannel.members.each((member: PresenceMember) => ids.add(member.id));
      setOnlineUserIds(ids);
    };

    const handleMemberAdded = (member: PresenceMember) => {
      setOnlineUserIds((current) => new Set(current).add(member.id));
    };

    const handleMemberRemoved = (member: PresenceMember) => {
      setOnlineUserIds((current) => {
        const next = new Set(current);
        next.delete(member.id);
        return next;
      });
    };

    messageChannel.bind('message:new', handleNewMessage);
    messageChannel.bind('client-typing:start', handleTypingStart);
    messageChannel.bind('client-typing:stop', handleTypingStop);
    presenceChannel.bind('pusher:subscription_succeeded', handleSubscriptionSucceeded);
    presenceChannel.bind('pusher:member_added', handleMemberAdded);
    presenceChannel.bind('pusher:member_removed', handleMemberRemoved);

    return () => {
      messageChannel.unbind('message:new', handleNewMessage);
      messageChannel.unbind('client-typing:start', handleTypingStart);
      messageChannel.unbind('client-typing:stop', handleTypingStop);
      presenceChannel.unbind('pusher:subscription_succeeded', handleSubscriptionSucceeded);
      presenceChannel.unbind('pusher:member_added', handleMemberAdded);
      presenceChannel.unbind('pusher:member_removed', handleMemberRemoved);
      unsubscribe(`private-room-${roomId}`);
      unsubscribe(`presence-room-${roomId}`);

      channelRef.current = null;
      typingTimeouts.forEach(clearTimeout);
      typingTimeouts.clear();
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
        stopTypingTimeoutRef.current = null;
      }
      isTypingRef.current = false;
      setTypingUsers([]);
      setOnlineUserIds(new Set());
    };
  }, [roomId, queryClient, currentUser?._id]);

  const stopTyping = useCallback(() => {
    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
      stopTypingTimeoutRef.current = null;
    }
    if (isTypingRef.current && channelRef.current && currentUser) {
      channelRef.current.trigger('client-typing:stop', {
        userId: currentUser._id,
        username: currentUser.username,
      });
      isTypingRef.current = false;
    }
  }, [currentUser]);

  const notifyTyping = useCallback(() => {
    if (!channelRef.current || !currentUser) {
      return;
    }

    if (!isTypingRef.current) {
      channelRef.current.trigger('client-typing:start', {
        userId: currentUser._id,
        username: currentUser.username,
      });
      isTypingRef.current = true;
    }

    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }
    stopTypingTimeoutRef.current = setTimeout(stopTyping, TYPING_IDLE_MS);
  }, [currentUser, stopTyping]);

  return { onlineUserIds, typingUsers, notifyTyping, stopTyping };
}
