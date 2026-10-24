import Pusher, { type Channel } from 'pusher-js';
import { getAccessToken } from './authToken';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

let client: Pusher | null = null;

function getClient(): Pusher {
  if (!client) {
    client = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      channelAuthorization: {
        customHandler: ({ socketId, channelName }, callback) => {
          fetch(`${API_BASE_URL}/api/pusher/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAccessToken() ?? ''}`,
            },
            credentials: 'include',
            body: JSON.stringify({ socket_id: socketId, channel_name: channelName }),
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error(`Pusher auth failed with status ${res.status}`);
              }
              return res.json();
            })
            .then((authData) => callback(null, authData))
            .catch((error: Error) => callback(error, null));
        },
      },
    });
  }

  return client;
}

export function subscribe(channelName: string): Channel {
  return getClient().subscribe(channelName);
}

export function unsubscribe(channelName: string): void {
  getClient().unsubscribe(channelName);
}
