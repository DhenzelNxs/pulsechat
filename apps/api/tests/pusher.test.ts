import request from 'supertest';
import { createApp } from '../src/app';
import { authed, registerAndLogin } from './helpers';

const app = createApp();

describe('POST /api/pusher/auth', () => {
  it('authorizes a member for private-room-{roomId}', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');

    const room = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: [bob.userId] });

    const res = await request(app)
      .post('/api/pusher/auth')
      .set(authed(alice.accessToken))
      .send({ socket_id: '123.456', channel_name: `private-room-${room.body.room._id}` });

    expect(res.status).toBe(200);
    expect(res.body.auth).toBeDefined();
  });

  it('authorizes a member for presence-room-{roomId} with user_info', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');

    const room = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: [bob.userId] });

    const res = await request(app)
      .post('/api/pusher/auth')
      .set(authed(alice.accessToken))
      .send({ socket_id: '123.456', channel_name: `presence-room-${room.body.room._id}` });

    expect(res.status).toBe(200);
    expect(res.body.auth).toBeDefined();
    expect(res.body.channel_data).toBeDefined();
    const channelData = JSON.parse(res.body.channel_data);
    expect(channelData.user_id).toBe(alice.userId);
    expect(channelData.user_info.username).toBe('alice');
  });

  it('rejects a non-member of the room channel', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');
    const carol = await registerAndLogin(app, 'carol');

    const room = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: [bob.userId] });

    const res = await request(app)
      .post('/api/pusher/auth')
      .set(authed(carol.accessToken))
      .send({ socket_id: '123.456', channel_name: `private-room-${room.body.room._id}` });

    expect(res.status).toBe(403);
  });

  it('authorizes a user for their own private-user-{userId} channel', async () => {
    const alice = await registerAndLogin(app, 'alice');

    const res = await request(app)
      .post('/api/pusher/auth')
      .set(authed(alice.accessToken))
      .send({ socket_id: '123.456', channel_name: `private-user-${alice.userId}` });

    expect(res.status).toBe(200);
  });

  it("rejects subscribing to another user's private channel", async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');

    const res = await request(app)
      .post('/api/pusher/auth')
      .set(authed(alice.accessToken))
      .send({ socket_id: '123.456', channel_name: `private-user-${bob.userId}` });

    expect(res.status).toBe(403);
  });

  it('rejects an unrecognized channel pattern', async () => {
    const alice = await registerAndLogin(app, 'alice');

    const res = await request(app)
      .post('/api/pusher/auth')
      .set(authed(alice.accessToken))
      .send({ socket_id: '123.456', channel_name: 'public-whatever' });

    expect(res.status).toBe(400);
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/pusher/auth')
      .send({ socket_id: '123.456', channel_name: 'private-room-x' });

    expect(res.status).toBe(401);
  });
});
