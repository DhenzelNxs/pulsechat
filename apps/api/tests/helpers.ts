import request from 'supertest';
import type { Express } from 'express';

export async function registerAndLogin(app: Express, username: string) {
  const user = { username, email: `${username}@example.com`, password: 'password123' };
  await request(app).post('/api/auth/register').send(user);
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });

  return {
    accessToken: loginRes.body.accessToken as string,
    userId: loginRes.body.user._id as string,
  };
}

export function authed(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}
