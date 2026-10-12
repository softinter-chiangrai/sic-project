import { test, expect } from '@playwright/test';
import { World, idOf } from './world';
import { Api, SECOND_TOKEN, mock, secondApi, userId } from '../api';
import { Stomp } from './stomp';

// Chat between two real users: REST history/permissions, groups and their members, live delivery over STOMP/WebSocket,
// presence, and call signalling (start / answer / ICE / end + the call log). Media itself (WebRTC audio/video) is not covered.
let w: World;
let u1: Api; // owner
let u2: Api; // second user, same business
let id1: string;
let id2: string;

test.beforeAll(async () => {
  w = await World.create();
  u1 = w.api;
  u2 = await secondApi(u1.businessId!);
  id1 = await userId();
  id2 = await userId(SECOND_TOKEN);
});

const list = (b: any): any[] => (Array.isArray(b) ? b : (b?.data ?? []));

/** A group both users belong to (created by u1). */
async function newGroup(members: string[] = [id1, id2]): Promise<string> {
  const g = await u1.post('/api/su/chat/group/create', { name: mock('grp'), groupDescription: 'e2e', memberUserIds: members });
  expect(g.status, JSON.stringify(g.body)).toBeLessThan(300);
  return idOf(g.body) ?? g.body.groupId;
}

test.describe('1-to-1 chat', () => {
  test('send both ways, history on both sides, members list', async () => {
    const a = await u1.post('/api/su/chat/send', { receiverId: id2, message: 'hi from 1', messageType: 'TEXT' });
    expect(a.status, JSON.stringify(a.body)).toBeLessThan(300);
    const b = await u2.post('/api/su/chat/send', { receiverId: id1, message: 'hi from 2', messageType: 'TEXT' });
    expect(b.status, JSON.stringify(b.body)).toBeLessThan(300);
    for (const [api, other] of [[u1, id2], [u2, id1]] as const) {
      const h = list((await api.get(`/api/su/chat/history/${other}`)).body).map((m) => m.message);
      expect(h).toEqual(expect.arrayContaining(['hi from 1', 'hi from 2']));
    }
    expect(JSON.stringify((await u1.get('/api/su/chat/members')).body)).toContain(id2);
  });

  test('only the sender may edit or cancel a message', async () => {
    const sent = await u1.post('/api/su/chat/send', { receiverId: id2, message: 'mine', messageType: 'TEXT' });
    const mid = idOf(sent.body);
    expect((await u2.post(`/api/su/chat/edit/${mid}`, { message: 'hacked' })).status, 'receiver edits').toBe(403);
    expect((await u1.post(`/api/su/chat/edit/${mid}`, { message: 'mine, edited' })).status).toBeLessThan(300);
    expect(list((await u2.get(`/api/su/chat/history/${id1}`)).body).find((m) => m.id === mid)?.message).toBe('mine, edited');

    await u2.post(`/api/su/chat/cancel/${mid}`); // receiver cannot cancel
    expect(list((await u1.get(`/api/su/chat/history/${id2}`)).body).find((m) => m.id === mid)?.cancelled ?? list((await u1.get(`/api/su/chat/history/${id2}`)).body).find((m) => m.id === mid)?.isCancelled).toBeFalsy();
    expect((await u1.post(`/api/su/chat/cancel/${mid}`)).status).toBeLessThan(300);
    const after = list((await u1.get(`/api/su/chat/history/${id2}`)).body).find((m) => m.id === mid);
    expect(after?.cancelled ?? after?.isCancelled).toBeTruthy();
  });

  test('empty / missing message is refused politely', async () => {
    const r = await u1.post('/api/su/chat/send', { receiverId: id2 });
    expect(r.status, JSON.stringify(r.body)).toBeLessThan(500);
  });

  test('message with an uploaded image attached', async () => {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const up = await u1.upload('/api/storage/upload/image', { file: { name: 'chat.png', mimeType: 'image/png', buffer: png } });
    expect(up.status, JSON.stringify(up.body)).toBeLessThan(300);
    const attachmentId = up.body.id;
    const r = await u1.post('/api/su/chat/send', { receiverId: id2, message: 'look', messageType: 'IMAGE', attachmentId });
    expect(r.status, JSON.stringify(r.body)).toBeLessThan(300);
    const got = list((await u2.get(`/api/su/chat/history/${id1}`)).body).find((m) => m.id === idOf(r.body));
    expect(got?.attachmentId).toBe(attachmentId);
  });
});

test.describe('groups', () => {
  test('create, both members see it, members listed, messages in order', async () => {
    const gid = await newGroup();
    for (const api of [u1, u2]) expect(JSON.stringify((await api.get('/api/su/chat/groups')).body)).toContain(gid);
    const members = JSON.stringify((await u1.get(`/api/su/chat/group/${gid}/members`)).body);
    expect(members).toContain(id1);
    expect(members).toContain(id2);

    expect((await u1.post('/api/su/chat/group/send', { groupId: gid, message: 'one', messageType: 'TEXT' })).status).toBeLessThan(300);
    expect((await u2.post('/api/su/chat/group/send', { groupId: gid, message: 'two', messageType: 'TEXT' })).status).toBeLessThan(300);
    const h = list((await u1.get(`/api/su/chat/group/${gid}/history`)).body).map((m) => m.message);
    expect(h.indexOf('one')).toBeGreaterThanOrEqual(0);
    expect(h.indexOf('two')).toBeGreaterThan(h.indexOf('one'));
  });

  test('update name and members: removed member loses the group', async () => {
    const gid = await newGroup();
    const upd = await u1.post('/api/su/chat/group/update', { groupId: gid, name: mock('renamed'), groupDescription: 'e2e', memberUserIds: [id1] });
    expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
    expect(JSON.stringify((await u2.get('/api/su/chat/groups')).body), 'removed member still lists the group').not.toContain(gid);
    expect(JSON.stringify((await u1.get(`/api/su/chat/group/${gid}/members`)).body)).not.toContain(id2);

    // add them back
    ((await u1.post('/api/su/chat/group/update', { groupId: gid, name: mock('again'), groupDescription: 'e2e', memberUserIds: [id1, id2] })).status);
    expect(JSON.stringify((await u2.get('/api/su/chat/groups')).body)).toContain(gid);
  });

  test('a user who is not in the group can neither read, post to nor list it', async () => {
    const gid = await newGroup([id1]); // u2 is outside
    await u1.post('/api/su/chat/group/send', { groupId: gid, message: 'private to the group', messageType: 'TEXT' });
    const read = await u2.get(`/api/su/chat/group/${gid}/history`);
    expect(JSON.stringify(read.body), 'outsider reads group history').not.toContain('private to the group');
    expect((await u2.post('/api/su/chat/group/send', { groupId: gid, message: 'intruder', messageType: 'TEXT' })).status, 'outsider posts').toBeGreaterThanOrEqual(400);
    expect(JSON.stringify((await u2.get(`/api/su/chat/group/${gid}/members`)).body), 'outsider lists members').not.toContain(id1);
    expect(JSON.stringify((await u1.get(`/api/su/chat/group/${gid}/history`)).body)).not.toContain('intruder');
  });

  test('only a member may rename or change the members of a group', async () => {
    const gid = await newGroup([id1]);
    const r = await u2.post('/api/su/chat/group/update', { groupId: gid, name: 'taken over', groupDescription: 'x', memberUserIds: [id2] });
    expect(r.status, 'outsider updates the group').toBeGreaterThanOrEqual(400);
    expect(JSON.stringify((await u1.get('/api/su/chat/groups')).body)).not.toContain('taken over');
  });
});

test.describe('live delivery (STOMP over WebSocket)', () => {
  test('1-to-1 message reaches the receiver at once (REST send and WebSocket send)', async () => {
    const s2 = await Stomp.connect(SECOND_TOKEN);
    const s1 = await Stomp.connect();
    try {
      const inbox = s2.subscribe('/user/queue/messages');
      const mine = s1.subscribe('/user/queue/messages');
      const viaRest = await u1.post('/api/su/chat/send', { receiverId: id2, message: 'live rest', messageType: 'TEXT' });
      const got = await inbox.next((m) => m.message === 'live rest');
      expect(got.id).toBe(idOf(viaRest.body));
      expect(got.senderId).toBe(id1);

      s1.send('/app/chat/private', { receiverId: id2, message: 'live ws', messageType: 'TEXT' });
      expect((await inbox.next((m) => m.message === 'live ws')).senderId).toBe(id1);
      await mine.next((m) => m.message === 'live ws'); // the sender gets its own copy
      expect(list((await u2.get(`/api/su/chat/history/${id1}`)).body).map((m) => m.message)).toContain('live ws'); // and it was stored
    } finally {
      await s1.close();
      await s2.close();
    }
  });

  test('edit and cancel are pushed to the other side', async () => {
    const s2 = await Stomp.connect(SECOND_TOKEN);
    try {
      const edits = s2.subscribe('/user/queue/messages/edit');
      const cancels = s2.subscribe('/user/queue/messages/cancel');
      const mid = idOf((await u1.post('/api/su/chat/send', { receiverId: id2, message: 'to change', messageType: 'TEXT' })).body);
      await u1.post(`/api/su/chat/edit/${mid}`, { message: 'changed' });
      expect((await edits.next((m) => m.id === mid)).message).toBe('changed');
      await u1.post(`/api/su/chat/cancel/${mid}`);
      await cancels.next((m) => JSON.stringify(m).includes(mid));
    } finally {
      await s2.close();
    }
  });

  test('group message reaches subscribed members; edit/cancel topics too', async () => {
    const gid = await newGroup();
    const s2 = await Stomp.connect(SECOND_TOKEN);
    try {
      const topic = s2.subscribe(`/topic/group/${gid}`);
      const edits = s2.subscribe(`/topic/group/${gid}/edit`);
      const cancels = s2.subscribe(`/topic/group/${gid}/cancel`);
      const sent = await u1.post('/api/su/chat/group/send', { groupId: gid, message: 'group live', messageType: 'TEXT' });
      const mid = idOf(sent.body);
      expect((await topic.next((m) => m.message === 'group live')).senderId).toBe(id1);

      const s1 = await Stomp.connect();
      s1.send('/app/chat/group', { groupId: gid, message: 'group ws', messageType: 'TEXT' });
      await topic.next((m) => m.message === 'group ws');
      await s1.close();

      await u1.post(`/api/su/chat/edit/${mid}`, { message: 'group edited' });
      await edits.next((m) => m.id === mid);
      await u1.post(`/api/su/chat/cancel/${mid}`);
      await cancels.next((m) => JSON.stringify(m).includes(mid));
    } finally {
      await s2.close();
    }
  });

  test('group membership changes are pushed to the people concerned', async () => {
    const s2 = await Stomp.connect(SECOND_TOKEN);
    try {
      const updates = s2.subscribe('/user/queue/groups/update');
      const gid = await newGroup();
      await updates.next((m) => JSON.stringify(m).includes(gid));
    } finally {
      await s2.close();
    }
  });

  test('a connection without a valid token cannot post messages as someone', async () => {
    const anon = await Stomp.connect(undefined, null).catch(() => null);
    if (!anon) return; // refused at connect: fine
    const before = list((await u2.get(`/api/su/chat/history/${id1}`)).body).length;
    anon.send('/app/chat/private', { receiverId: id2, message: 'from nobody', messageType: 'TEXT' });
    await new Promise((r) => setTimeout(r, 1500));
    await anon.close();
    const after = list((await u2.get(`/api/su/chat/history/${id1}`)).body);
    expect(after.length).toBe(before);
    expect(after.map((m) => m.message)).not.toContain('from nobody');
  });

  test('a forged token is refused', async () => {
    const forged = 'eyJhbGciOiJub25lIn0.' + Buffer.from(JSON.stringify({ sub: id1 })).toString('base64url') + '.';
    const s = await Stomp.connect(undefined, forged).catch(() => null);
    if (!s) return;
    const inbox = s.subscribe('/user/queue/messages');
    await u2.post('/api/su/chat/send', { receiverId: id1, message: 'for the real user 1', messageType: 'TEXT' });
    expect(await inbox.silent((m) => m.message === 'for the real user 1'), 'forged token received someone else\'s private message').toBe(true);
    await s.close();
  });
});

test.describe('presence', () => {
  test('connecting and disconnecting is announced on /topic/user-status', async () => {
    const watcher = await Stomp.connect();
    const status = watcher.subscribe('/topic/user-status');
    const s2 = await Stomp.connect(SECOND_TOKEN);
    try {
      await status.next((m) => JSON.stringify(m).includes(id2), 8000);
    } finally {
      await s2.close();
      await watcher.close();
    }
  });
});

test.describe('calls (signalling only; no audio/video media)', () => {
  test('1-to-1: start -> answer -> ICE -> end, and the call is logged with its duration', async () => {
    const s1 = await Stomp.connect();
    const s2 = await Stomp.connect(SECOND_TOKEN);
    try {
      const in1 = s1.subscribe('/user/queue/call');
      const in2 = s2.subscribe('/user/queue/call');

      s1.send('/app/call/signal', { action: 'start', targetUserId: id2, callType: 'audio', sdpOffer: 'offer-sdp' });
      const start = await in2.next((m) => m.action === 'start');
      expect(start.callerId).toBe(id1);
      expect(start.callType).toBe('audio');
      expect(start.sdpOffer).toBe('offer-sdp');

      s2.send('/app/call/signal', { action: 'answer', targetUserId: id1, sdpAnswer: 'answer-sdp', accepted: true });
      expect((await in1.next((m) => m.action === 'answer')).sdpAnswer).toBe('answer-sdp');

      s1.send('/app/call/signal', { action: 'ice-candidate', targetUserId: id2, iceCandidate: 'cand-1' });
      s2.send('/app/call/signal', { action: 'ice-candidate', targetUserId: id1, iceCandidate: 'cand-2' });
      await in2.next((m) => m.iceCandidate === 'cand-1');
      await in1.next((m) => m.iceCandidate === 'cand-2');

      s1.send('/app/call/signal', { action: 'end', targetUserId: id2, accepted: true, durationSeconds: 42 });
      await in2.next((m) => m.action === 'end');
      await expect
        .poll(async () => list((await u2.get(`/api/su/chat/history/${id1}`)).body).some((m) => m.messageType === 'CALL' && m.callDurationSeconds === 42 && m.callAccepted === true), { timeout: 8000, message: 'call log with duration not stored' })
        .toBe(true);
    } finally {
      await s1.close();
      await s2.close();
    }
  });

  test('a declined / unanswered call is logged as not accepted', async () => {
    const s1 = await Stomp.connect();
    const s2 = await Stomp.connect(SECOND_TOKEN);
    try {
      const in2 = s2.subscribe('/user/queue/call');
      s1.send('/app/call/signal', { action: 'start', targetUserId: id2, callType: 'video' });
      await in2.next((m) => m.action === 'start' && m.callType === 'video');
      s1.send('/app/call/signal', { action: 'end', targetUserId: id2, accepted: false, durationSeconds: 0 });
      await expect
        .poll(async () => list((await u1.get(`/api/su/chat/history/${id2}`)).body).some((m) => m.messageType === 'CALL' && m.callAccepted === false), { timeout: 8000 })
        .toBe(true);
    } finally {
      await s1.close();
      await s2.close();
    }
  });

  test('group call rings every member except the caller', async () => {
    const gid = await newGroup();
    const s1 = await Stomp.connect();
    const s2 = await Stomp.connect(SECOND_TOKEN);
    try {
      const in1 = s1.subscribe('/user/queue/call');
      const in2 = s2.subscribe('/user/queue/call');
      s1.send('/app/call/signal', { action: 'start', groupId: gid, groupName: 'team', callType: 'audio' });
      expect((await in2.next((m) => m.action === 'start' && m.groupId === gid)).callerId).toBe(id1);
      expect(await in1.silent((m) => m.action === 'start', 1000), 'caller rings itself').toBe(true);
      s1.send('/app/call/signal', { action: 'end', groupId: gid });
      await in2.next((m) => m.action === 'end' && m.groupId === gid);
    } finally {
      await s1.close();
      await s2.close();
    }
  });

  test('the caller identity cannot be forged', async () => {
    const s1 = await Stomp.connect();
    const s2 = await Stomp.connect(SECOND_TOKEN);
    try {
      const in1 = s1.subscribe('/user/queue/call');
      s2.send('/app/call/signal', { action: 'start', targetUserId: id1, callType: 'audio', callerId: 'someone-else', callerName: 'The Boss' });
      const got = await in1.next((m) => m.action === 'start');
      expect(got.callerId, 'receiver was told a different caller').toBe(id2);
    } finally {
      await s1.close();
      await s2.close();
    }
  });

  test('a non-member cannot ring a group', async () => {
    const gid = await newGroup([id1]); // u2 is outside
    const s1 = await Stomp.connect();
    const s2 = await Stomp.connect(SECOND_TOKEN);
    try {
      const in1 = s1.subscribe('/user/queue/call');
      s2.send('/app/call/signal', { action: 'start', groupId: gid, groupName: 'not mine', callType: 'audio' });
      expect(await in1.silent((m) => m.action === 'start' && m.groupId === gid, 2000), 'outsider started a call in a group').toBe(true);
    } finally {
      await s1.close();
      await s2.close();
    }
  });
});
