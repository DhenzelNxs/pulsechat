import request from 'supertest';
import { createApp } from '../src/app';
import { pusher } from '../src/config/pusher';
import { authed, registerAndLogin } from './helpers';

const app = createApp();

describe('POST /api/rooms', () => {
  it('creates a DM room including the creator', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');

    const res = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: [bob.userId] });

    expect(res.status).toBe(201);
    expect(res.body.room.type).toBe('dm');
    expect(res.body.room.memberIds.sort()).toEqual([alice.userId, bob.userId].sort());
  });

  it('creates a group room with a name', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');
    const carol = await registerAndLogin(app, 'carol');

    const res = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'group', name: 'Trio', memberIds: [bob.userId, carol.userId] });

    expect(res.status).toBe(201);
    expect(res.body.room.name).toBe('Trio');
    expect(res.body.room.memberIds).toHaveLength(3);
  });

  it('rejects a group without a name', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');

    const res = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'group', memberIds: [bob.userId] });

    expect(res.status).toBe(400);
  });

  it('rejects a DM with more than two total members', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');
    const carol = await registerAndLogin(app, 'carol');

    const res = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: [bob.userId, carol.userId] });

    expect(res.status).toBe(400);
  });

  it('rejects a nonexistent member id', async () => {
    const alice = await registerAndLogin(app, 'alice');

    const res = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: ['000000000000000000000000'] });

    expect(res.status).toBe(400);
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({ type: 'dm', memberIds: ['000000000000000000000000'] });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/rooms', () => {
  it('lists only rooms the user belongs to, newest activity first', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');
    const carol = await registerAndLogin(app, 'carol');

    const roomWithBob = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: [bob.userId] });

    const bobCarolRoom = await request(app)
      .post('/api/rooms')
      .set(authed(bob.accessToken))
      .send({ type: 'dm', memberIds: [carol.userId] });

    await request(app)
      .post(`/api/rooms/${roomWithBob.body.room._id}/messages`)
      .set(authed(alice.accessToken))
      .send({ content: 'bumping this room' });

    const res = await request(app).get('/api/rooms').set(authed(alice.accessToken));

    expect(res.status).toBe(200);
    const ids = res.body.rooms.map((room: { _id: string }) => room._id);
    expect(ids).toContain(roomWithBob.body.room._id);
    expect(ids).not.toContain(bobCarolRoom.body.room._id);
  });
});

describe('GET /api/rooms/:id', () => {
  it('returns room details for a member', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');

    const room = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: [bob.userId] });

    const res = await request(app)
      .get(`/api/rooms/${room.body.room._id}`)
      .set(authed(bob.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.room._id).toBe(room.body.room._id);
  });

  it('rejects a non-member', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');
    const carol = await registerAndLogin(app, 'carol');

    const room = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: [bob.userId] });

    const res = await request(app)
      .get(`/api/rooms/${room.body.room._id}`)
      .set(authed(carol.accessToken));

    expect(res.status).toBe(403);
  });

  it('returns 400 for a malformed room id', async () => {
    const alice = await registerAndLogin(app, 'alice');

    const res = await request(app).get('/api/rooms/not-an-id').set(authed(alice.accessToken));

    expect(res.status).toBe(400);
  });

  it('returns 404 for a well-formed but nonexistent room id', async () => {
    const alice = await registerAndLogin(app, 'alice');

    const res = await request(app)
      .get('/api/rooms/000000000000000000000000')
      .set(authed(alice.accessToken));

    expect(res.status).toBe(404);
  });
});

describe('messages', () => {
  it('sends a message and advances the room lastMessageAt', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');

    const room = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: [bob.userId] });

    const sendRes = await request(app)
      .post(`/api/rooms/${room.body.room._id}/messages`)
      .set(authed(alice.accessToken))
      .send({ content: 'hey bob' });

    expect(sendRes.status).toBe(201);
    expect(sendRes.body.message.content).toBe('hey bob');

    const roomRes = await request(app)
      .get(`/api/rooms/${room.body.room._id}`)
      .set(authed(alice.accessToken));

    expect(new Date(roomRes.body.room.lastMessageAt).getTime()).toBeGreaterThanOrEqual(
      new Date(room.body.room.createdAt).getTime(),
    );

    expect(pusher.trigger).toHaveBeenCalledWith(
      `private-room-${room.body.room._id}`,
      'message:new',
      expect.objectContaining({ content: 'hey bob' }),
    );
  });

  it('rejects sending a message as a non-member', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');
    const carol = await registerAndLogin(app, 'carol');

    const room = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: [bob.userId] });

    const res = await request(app)
      .post(`/api/rooms/${room.body.room._id}/messages`)
      .set(authed(carol.accessToken))
      .send({ content: 'sneaky' });

    expect(res.status).toBe(403);
  });

  it('rejects empty content', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');

    const room = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: [bob.userId] });

    const res = await request(app)
      .post(`/api/rooms/${room.body.room._id}/messages`)
      .set(authed(alice.accessToken))
      .send({ content: '   ' });

    expect(res.status).toBe(400);
  });

  it('paginates message history with a cursor, newest first', async () => {
    const alice = await registerAndLogin(app, 'alice');
    const bob = await registerAndLogin(app, 'bob');

    const room = await request(app)
      .post('/api/rooms')
      .set(authed(alice.accessToken))
      .send({ type: 'dm', memberIds: [bob.userId] });

    for (let i = 0; i < 5; i += 1) {
      await request(app)
        .post(`/api/rooms/${room.body.room._id}/messages`)
        .set(authed(alice.accessToken))
        .send({ content: `message ${i}` });
    }

    const firstPage = await request(app)
      .get(`/api/rooms/${room.body.room._id}/messages?limit=2`)
      .set(authed(alice.accessToken));

    expect(firstPage.status).toBe(200);
    expect(firstPage.body.messages).toHaveLength(2);
    expect(firstPage.body.messages[0].content).toBe('message 4');
    expect(firstPage.body.nextCursor).toBeTruthy();

    const secondPage = await request(app)
      .get(
        `/api/rooms/${room.body.room._id}/messages?limit=2&cursor=${encodeURIComponent(
          firstPage.body.nextCursor,
        )}`,
      )
      .set(authed(alice.accessToken));

    expect(secondPage.status).toBe(200);
    expect(secondPage.body.messages).toHaveLength(2);
    expect(secondPage.body.messages[0].content).toBe('message 2');

    const firstPageIds = firstPage.body.messages.map((m: { _id: string }) => m._id);
    const secondPageIds = secondPage.body.messages.map((m: { _id: string }) => m._id);
    expect(firstPageIds).not.toEqual(expect.arrayContaining(secondPageIds));
  });
});
