import request from 'supertest';
import { createApp } from '../src/app';
import { authed, registerAndLogin } from './helpers';

const app = createApp();

describe('GET /api/users/search', () => {
  it('finds users by a case-insensitive username match, excluding the caller', async () => {
    const alice = await registerAndLogin(app, 'alice');
    await registerAndLogin(app, 'bobsmith');
    await registerAndLogin(app, 'carol');

    const res = await request(app).get('/api/users/search?q=bob').set(authed(alice.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0].username).toBe('bobsmith');
  });

  it('never returns the caller themselves', async () => {
    const alice = await registerAndLogin(app, 'alice');

    const res = await request(app).get('/api/users/search?q=alice').set(authed(alice.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(0);
  });

  it('rejects an empty query', async () => {
    const alice = await registerAndLogin(app, 'alice');

    const res = await request(app).get('/api/users/search?q=').set(authed(alice.accessToken));

    expect(res.status).toBe(400);
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).get('/api/users/search?q=bob');

    expect(res.status).toBe(401);
  });
});
