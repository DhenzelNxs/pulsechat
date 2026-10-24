import type { LoginInput, RegisterInput } from '@pulsechat/shared';
import { apiFetch } from './client';

export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status: 'online' | 'offline' | 'away';
  lastSeenAt: string;
  createdAt: string;
}

export function register(input: RegisterInput): Promise<{ user: User }> {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function login(input: LoginInput): Promise<{ user: User; accessToken: string }> {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function logout(): Promise<void> {
  return apiFetch('/api/auth/logout', { method: 'POST' });
}

export function fetchCurrentUser(): Promise<{ user: User }> {
  return apiFetch('/api/auth/me');
}

export function refreshAccessToken(): Promise<{ accessToken: string }> {
  return apiFetch('/api/auth/refresh', { method: 'POST' }, { skipAuthRetry: true });
}
