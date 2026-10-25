import { apiFetch } from './client';
import type { User } from './auth';

export interface RoomMember {
  _id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  avatarUrl?: string;
  status: 'online' | 'offline' | 'away';
}

export interface Room {
  _id: string;
  type: 'dm' | 'group';
  name?: string;
  memberIds: RoomMember[];
  createdBy: string;
  lastMessageAt: string;
  createdAt: string;
  unreadCount: number;
}

export interface CreateRoomInput {
  type: 'dm' | 'group';
  name?: string;
  memberIds: string[];
}

export function listRooms(): Promise<{ rooms: Room[] }> {
  return apiFetch('/api/rooms');
}

export function getRoom(roomId: string): Promise<{ room: Room }> {
  return apiFetch(`/api/rooms/${roomId}`);
}

export function createRoom(input: CreateRoomInput): Promise<{ room: Room }> {
  return apiFetch('/api/rooms', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function searchUsers(q: string): Promise<{ users: User[] }> {
  return apiFetch(`/api/users/search?q=${encodeURIComponent(q)}`);
}

export function markRoomRead(roomId: string): Promise<void> {
  return apiFetch(`/api/rooms/${roomId}/read`, { method: 'POST' });
}
