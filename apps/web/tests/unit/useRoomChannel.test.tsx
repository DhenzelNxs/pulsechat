import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRoomChannel } from '../../src/features/realtime/useRoomChannel';

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
      trigger: () => {},
      members: { each: () => {} },
      emit: (event: string, payload?: unknown) => {
        (handlers.get(event) ?? []).forEach((callback) => callback(payload));
      },
    },
  };
});

vi.mock('../../src/lib/pusher', () => ({
  subscribe: () => fakeChannel,
  unsubscribe: () => {},
}));

vi.mock('../../src/features/auth/useSession', () => ({
  useSession: () => ({ data: { _id: 'me', username: 'me' } }),
}));

function createWrapper() {
  const queryClient = new QueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useRoomChannel typing indicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a typing user after client-typing:start and clears them after the idle timeout', () => {
    const { result } = renderHook(() => useRoomChannel('room-1'), { wrapper: createWrapper() });

    act(() => {
      fakeChannel.emit('client-typing:start', { userId: 'other', username: 'bob' });
    });

    expect(result.current.typingUsers).toEqual([{ userId: 'other', username: 'bob' }]);

    act(() => {
      vi.advanceTimersByTime(3100);
    });

    expect(result.current.typingUsers).toEqual([]);
  });

  it('clears the typing user immediately on client-typing:stop', () => {
    const { result } = renderHook(() => useRoomChannel('room-1'), { wrapper: createWrapper() });

    act(() => {
      fakeChannel.emit('client-typing:start', { userId: 'other', username: 'bob' });
    });
    expect(result.current.typingUsers).toHaveLength(1);

    act(() => {
      fakeChannel.emit('client-typing:stop', { userId: 'other' });
    });
    expect(result.current.typingUsers).toEqual([]);
  });

  it('ignores a client-typing:start event echoed back from the current user', () => {
    const { result } = renderHook(() => useRoomChannel('room-1'), { wrapper: createWrapper() });

    act(() => {
      fakeChannel.emit('client-typing:start', { userId: 'me', username: 'me' });
    });

    expect(result.current.typingUsers).toEqual([]);
  });
});
