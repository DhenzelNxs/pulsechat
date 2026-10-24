import bcrypt from 'bcrypt';
import { User, type UserDocument } from '../../models/User';
import { AppError } from '../../errors/AppError';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './auth.tokens';
import type { LoginInput, RegisterInput } from '@pulsechat/shared';

const BCRYPT_COST_FACTOR = 12;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(input: RegisterInput): Promise<UserDocument> {
  const existing = await User.findOne({
    $or: [{ email: input.email }, { username: input.username }],
  });

  if (existing) {
    const field = existing.email === input.email ? 'email' : 'username';
    throw new AppError(409, 'CONFLICT', `An account with that ${field} already exists`);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST_FACTOR);

  return User.create({
    username: input.username,
    email: input.email,
    passwordHash,
  });
}

export async function loginUser(input: LoginInput): Promise<{ user: UserDocument } & AuthTokens> {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');

  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  user.refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_COST_FACTOR);
  user.status = 'online';
  user.lastSeenAt = new Date();
  await user.save();

  return { user, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  let userId: string;

  try {
    userId = verifyRefreshToken(refreshToken).sub;
  } catch {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
  }

  const user = await User.findById(userId).select('+refreshTokenHash');

  if (!user?.refreshTokenHash) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
  }

  const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);

  if (!matches) {
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
  }

  const accessToken = signAccessToken(user.id);
  return { accessToken, refreshToken };
}

export async function logoutUser(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
}

export async function getUserById(userId: string): Promise<UserDocument> {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  return user;
}
