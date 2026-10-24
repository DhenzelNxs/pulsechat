import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/requireAuth';
import { AppError } from '../../errors/AppError';
import * as authService from './auth.service';
import { clearRefreshCookie, getRefreshCookie, setRefreshCookie } from './auth.cookies';
import type { LoginInput, RegisterInput } from '@pulsechat/shared';

export async function register(req: Request<unknown, unknown, RegisterInput>, res: Response) {
  const user = await authService.registerUser(req.body);
  res.status(201).json({ user });
}

export async function login(req: Request<unknown, unknown, LoginInput>, res: Response) {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(200).json({ user, accessToken });
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = getRefreshCookie(req.cookies);

  if (!refreshToken) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'No refresh token provided');
  }

  const tokens = await authService.refreshAccessToken(refreshToken);
  res.status(200).json({ accessToken: tokens.accessToken });
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  await authService.logoutUser(req.userId as string);
  clearRefreshCookie(res);
  res.status(204).send();
}

export async function me(req: AuthenticatedRequest, res: Response) {
  const user = await authService.getUserById(req.userId as string);
  res.status(200).json({ user });
}
