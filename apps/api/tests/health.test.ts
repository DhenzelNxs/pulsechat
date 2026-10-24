import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('GET /api/health', () => {
  it('reports ok status with the Mongo connection state and uptime', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.mongo).toBe('connected');
    expect(typeof res.body.uptimeSeconds).toBe('number');
  });
});
