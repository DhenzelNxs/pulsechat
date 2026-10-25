import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserChannel } from '../../src/features/realtime/useUserChannel';

type Handler = (payload?: unknown) => void;

const { fakeChannel } = vi.hoisted(() => {
  const handlers = new Map<string, Handler[]>();

  return {
    fakeChannel: {
      bind: (event: string, callback: Handler) => {
        const callbacks = handlers.get(event) ?? [];
        callbacks.push(callback);
        handlers.set(event, callbacks);
      },
      unbind: () => {},
      emit: (event: string, payload?: unknown) => {
        (handlers.get(event) ?? []).forEach((callback) => callback(payload));
      },
    },
  };
});

const subscribeSpy = vi.fn((_channelName: string) => fakeChannel);

vi.mock('../../src/lib/pusher', () => ({
  subscribe: (channelName: string) => subscribeSpy(channelName),
  unsubscribe: () => {},
}));

vi.mock('../../src/features/auth/useSession', () => ({
  useSession: () => ({ data: { _id: 'me', username: 'me' } }),
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useUserChannel', () => {
  it('subscribes to the current user private channel', () => {
    const queryClient = new QueryClient();
    renderHook(() => useUserChannel(), { wrapper: createWrapper(queryClient) });

    expect(subscribeSpy).toHaveBeenCalledWith('private-user-me');
  });

  it('invalidates the rooms query when a room:updated event arrives', () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useUserChannel(), { wrapper: createWrapper(queryClient) });

    act(() => {
      fakeChannel.emit('room:updated', { roomId: 'room-1' });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['rooms'] });
  });
});
