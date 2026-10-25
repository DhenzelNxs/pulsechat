import type { Response } from 'express';
import ms from 'ms';
import { env } from '../../config/env';

const REFRESH_COOKIE_NAME = 'refreshToken';

const isProduction = env.NODE_ENV === 'production';

export function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: ms(env.JWT_REFRESH_EXPIRES_IN as ms.StringValue),
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    path: '/api/auth',
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });
}

export function getRefreshCookie(cookies: Record<string, string | undefined>): string | undefined {
  return cookies[REFRESH_COOKIE_NAME];
}
