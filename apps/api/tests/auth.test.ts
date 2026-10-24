import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';

const app = createApp();

const validUser = {
  firstName: 'Test',
  lastName: 'User',
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
};

describe('POST /api/auth/register', () => {
  it('creates a new user and never returns the password hash', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      firstName: validUser.firstName,
      lastName: validUser.lastName,
      username: validUser.username,
      email: validUser.email,
      status: 'offline',
    });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.user.refreshTokenHash).toBeUndefined();

    const stored = await User.findOne({ email: validUser.email }).select('+passwordHash');
    expect(stored?.passwordHash).not.toBe(validUser.password);
  });

  it('rejects a name containing digits', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, firstName: 'Test1' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('accepts accented letters in a name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, firstName: 'José', lastName: "O'Neil-Souza" });

    expect(res.status).toBe(201);
    expect(res.body.user.firstName).toBe('José');
    expect(res.body.user.lastName).toBe("O'Neil-Souza");
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, username: 'anotherone' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects a duplicate username', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'someone-else@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects an invalid payload', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ab', email: 'not-an-email', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('logs in with correct credentials and sets a refresh cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(String(cookies)).toMatch(/refreshToken=/);
    expect(String(cookies)).toMatch(/HttpOnly/i);
  });

  it('rejects an incorrect password without revealing which field was wrong', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects an unknown email with the same error as a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: validUser.password });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('authenticated session flow', () => {
  const agent = request.agent(app);
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    accessToken = loginRes.body.accessToken;
    userId = loginRes.body.user._id;
  });

  it('GET /api/auth/me returns the current user', async () => {
    const res = await agent.get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  it('rejects /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects /me with a malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-jwt');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/auth/refresh issues a new access token from the cookie', async () => {
    const res = await agent.post('/api/auth/refresh');

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('rejects /refresh without a refresh cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('rejects /refresh with a garbage cookie', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', ['refreshToken=not-a-real-token']);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('POST /api/auth/logout revokes the refresh token', async () => {
    const logoutRes = await agent
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(logoutRes.status).toBe(204);

    const refreshRes = await agent.post('/api/auth/refresh');
    expect(refreshRes.status).toBe(401);
  });

  it('rejects a refresh token still valid as a JWT but revoked server-side', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    const refreshCookie = String(loginRes.headers['set-cookie']).match(/refreshToken=[^;]+/)?.[0];

    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .set('Cookie', [refreshCookie as string]);

    const res = await request(app).post('/api/auth/refresh').set('Cookie', [refreshCookie as string]);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('rejects a refresh token superseded by a later login', async () => {
    const now = Date.now();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);

    const firstLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    const staleCookie = String(firstLogin.headers['set-cookie']).match(/refreshToken=[^;]+/)?.[0];

    vi.setSystemTime(now + 2000);

    await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    vi.useRealTimers();

    const res = await request(app).post('/api/auth/refresh').set('Cookie', [staleCookie as string]);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('rejects /me for a token whose user no longer exists', async () => {
    await User.findByIdAndDelete(userId);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /api/unknown-route', () => {
  it('returns a 404 with a NOT_FOUND code', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
