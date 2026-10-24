import { apiFetch } from './client';

export interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  content: string;
  mentions: string[];
  readBy: string[];
  editedAt?: string;
  deletedAt?: string;
  createdAt: string;
}

export interface MessagePage {
  messages: Message[];
  nextCursor: string | null;
}

export function listMessages(
  roomId: string,
  params: { cursor?: string; limit?: number } = {},
): Promise<MessagePage> {
  const query = new URLSearchParams();
  if (params.cursor) query.set('cursor', params.cursor);
  if (params.limit) query.set('limit', String(params.limit));
  const qs = query.toString();

  return apiFetch(`/api/rooms/${roomId}/messages${qs ? `?${qs}` : ''}`);
}

export function sendMessage(roomId: string, content: string): Promise<{ message: Message }> {
  return apiFetch(`/api/rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export function searchMessages(roomId: string, q: string): Promise<{ messages: Message[] }> {
  return apiFetch(`/api/rooms/${roomId}/messages/search?q=${encodeURIComponent(q)}`);
}
