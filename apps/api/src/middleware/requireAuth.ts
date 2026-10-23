import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { verifyAccessToken } from '../modules/auth/auth.tokens';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(new AppError(401, 'UNAUTHORIZED', 'Missing or malformed Authorization header'));
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired access token'));
  }
}
