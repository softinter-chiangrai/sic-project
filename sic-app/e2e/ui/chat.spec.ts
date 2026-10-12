import { test, expect, type Page } from '@playwright/test';
import { World } from '../api/world';
import { SECOND_TOKEN, mock, secondApi, userId, type Api } from '../api';
import { Ui } from '../ui';

// Chat widget driven by two real browser windows (first user and second user): live messages, edit/cancel, groups, calls.
// Calls use Chromium's fake microphone/camera, so the WebRTC connection is real but carries a test tone/pattern.
// texts carry a per-run tag: a kept DB still holds the messages of earlier runs
const RUN = Math.random().toString(36).slice(2, 6);
let w: World;
let ui1: Ui;
let ui2: Ui;
let u2: Api;
let id1: string;
let id2: string;

test.beforeAll(async ({ browser }) => {
  test.setTimeout(240_000);
  w = await World.create();
  u2 = await secondApi(w.api.businessId!);
  id1 = await userId();
  id2 = await userId(SECOND_TOKEN);
  ui1 = await Ui.open(browser, 'first');
  ui2 = await Ui.open(browser, 'second');
  await Promise.all([ui1.visit('/feature/dashboard'), ui2.visit('/feature/dashboard')]);
});
test.afterAll(async () => {
  await ui1?.close();
  await ui2?.close();
  await w?.cleanup();
});

const list = (b: any): any[] => (Array.isArray(b) ? b : (b?.data ?? []));

async function openPanel(p: Page) {
  if (!(await p.locator('.headchat-panel').count())) await p.locator('.headchat-toggle').evaluate((b) => (b as HTMLElement).click()); // the button never settles (pulse/drag), so no actionability wait
  await expect(p.locator('.headchat-panel')).toBeVisible();
}

/** Open the 1-to-1 window with the other user. */
async function openDirect(p: Page) {
  await openPanel(p);
  await p.locator('.headchat-member-btn').first().click();
  await expect(p.locator('.headchat-window').last()).toBeVisible();
}

async function say(p: Page, text: string) {
  const input = p.locator('.headchat-window .headchat-input-text').last();
  await input.fill(text);
  await input.press('Enter');
}

/** Voice-call button of the 1-to-1 window (the one holding our earlier messages), not of an open group window. */
async function callButton(p: Page) {
  const direct = p.locator('.headchat-window').filter({ hasText: `only mine ${RUN}` }).first();
  await direct.locator('.headchat-win-btn').first().evaluate((b) => (b as HTMLElement).click());
}

const bubble = (p: Page, text: string) => p.locator('.headchat-msg', { hasText: text });

/** The edit / cancel buttons only show on hover: click through the DOM. */
async function act(p: Page, text: string, which: 'edit' | 'cancel') {
  const msg = bubble(p, text).first();
  await msg.hover();
  const buttons = msg.locator('.headchat-msg-action-btn');
  const btn = which === 'cancel' ? msg.locator('.headchat-msg-action-btn--danger') : buttons.nth((await buttons.count()) - 2);
  await btn.evaluate((b) => (b as HTMLElement).click());
}

test.describe.configure({ mode: 'serial' });

test('a message typed in one window appears live in the other', async () => {
  await openDirect(ui2.page); // the receiver already has the window open
  await openDirect(ui1.page);
  await say(ui1.page, `hello from the first window ${RUN}`);
  await expect(bubble(ui2.page, `hello from the first window ${RUN}`)).toBeVisible({ timeout: 15_000 });
  await expect(bubble(ui2.page, `hello from the first window ${RUN}`)).toHaveClass(/received/);
  await expect(bubble(ui1.page, `hello from the first window ${RUN}`)).toHaveClass(/sent/);

  await say(ui2.page, `and back from the second ${RUN}`);
  await expect(bubble(ui1.page, `and back from the second ${RUN}`)).toBeVisible({ timeout: 15_000 });

  // stored, so a refresh keeps them
  const stored = list((await w.api.get(`/api/su/chat/history/${id2}`)).body).map((m) => m.message);
  expect(stored).toEqual(expect.arrayContaining([`hello from the first window ${RUN}`, `and back from the second ${RUN}`]));
});

test('edit a message: the other side sees the new text', async () => {
  await say(ui1.page, `typo mesage ${RUN}`);
  await expect(bubble(ui2.page, `typo mesage ${RUN}`)).toBeVisible({ timeout: 15_000 });
  await act(ui1.page, `typo mesage ${RUN}`, 'edit');
  const input = ui1.page.locator('.headchat-window .headchat-input-text').last();
  await expect(input).toHaveValue(`typo mesage ${RUN}`);
  await input.fill(`typo message, fixed ${RUN}`);
  await input.press('Enter');
  await expect(bubble(ui2.page, `typo message, fixed ${RUN}`)).toBeVisible({ timeout: 15_000 });
  await expect(bubble(ui2.page, `typo mesage ${RUN}`)).toHaveCount(0);
});

test('cancel a message: it is shown as cancelled on both sides', async () => {
  await say(ui1.page, `regret this ${RUN}`);
  await expect(bubble(ui2.page, `regret this ${RUN}`)).toBeVisible({ timeout: 15_000 });
  await act(ui1.page, `regret this ${RUN}`, 'cancel');
  await expect(bubble(ui2.page, `regret this ${RUN}`)).toHaveCount(0, { timeout: 15_000 });
  await expect(ui2.page.locator('.headchat-msg-cancelled').last()).toBeVisible();
  await expect(ui1.page.locator('.headchat-msg-cancelled').last()).toBeVisible();
});

test('the other user cannot edit or cancel what you wrote', async () => {
  await say(ui1.page, `only mine ${RUN}`);
  await expect(bubble(ui2.page, `only mine ${RUN}`)).toBeVisible({ timeout: 15_000 });
  await bubble(ui2.page, `only mine ${RUN}`).first().hover();
  await expect(bubble(ui2.page, `only mine ${RUN}`).first().locator('.headchat-msg-action-btn--danger')).toHaveCount(0); // no cancel on a received message
});

test('create a group in the UI; both members see it and chat in it live', async () => {
  const name = mock('team');
  await openPanel(ui1.page);
  await ui1.page.locator('.headchat-create-group-btn').click();
  await ui1.page.locator('.headchat-create-group-input').fill(name);
  await ui1.page.locator('.headchat-create-group-members .headchat-member-checkbox').first().locator('input').check();
  await ui1.page.locator('.headchat-create-group-footer .headchat-btn-primary').click();

  await expect.poll(async () => JSON.stringify((await u2.get('/api/su/chat/groups')).body), { timeout: 15_000 }).toContain(name);
  await openPanel(ui2.page);
  const group = ui2.page.locator('.headchat-group-btn', { hasText: name });
  await expect(group).toBeVisible({ timeout: 15_000 });
  await group.click();

  await say(ui2.page, `group hello from 2 ${RUN}`);
  await expect(bubble(ui1.page, `group hello from 2 ${RUN}`)).toBeVisible({ timeout: 15_000 });
  await say(ui1.page, `group reply from 1 ${RUN}`);
  await expect(bubble(ui2.page, `group reply from 1 ${RUN}`)).toBeVisible({ timeout: 15_000 });
});

test('voice call: ring -> accept -> connected -> hang up, and the call is logged', async () => {
  test.setTimeout(120_000);
  await callButton(ui1.page);
  await expect(ui2.page.locator('.headchat-incoming-fullscreen')).toBeVisible({ timeout: 15_000 });

  await ui2.page.locator('.headchat-fullscreen-btn--accept').click();
  await expect(ui1.page.locator('.headchat-btn-hangup')).toBeVisible({ timeout: 20_000 });
  await expect(ui2.page.locator('.headchat-btn-hangup')).toBeVisible({ timeout: 20_000 });

  await ui1.page.waitForTimeout(3000); // talk for a moment: the duration is stored
  await ui1.page.locator('.headchat-btn-hangup').click();
  await expect(ui2.page.locator('.headchat-btn-hangup')).toHaveCount(0, { timeout: 15_000 });
  await expect(ui1.page.locator('.headchat-btn-hangup')).toHaveCount(0);

  await expect
    .poll(async () => list((await w.api.get(`/api/su/chat/history/${id2}`)).body).some((m) => m.messageType === 'CALL' && m.callAccepted === true && (m.callDurationSeconds ?? 0) >= 2), { timeout: 15_000, message: 'accepted call with its duration should be logged' })
    .toBe(true);
});

test('a declined call is logged as not accepted', async () => {
  test.setTimeout(120_000);
  await callButton(ui1.page);
  await expect(ui2.page.locator('.headchat-incoming-fullscreen')).toBeVisible({ timeout: 15_000 });
  await ui2.page.locator('.headchat-fullscreen-btn--reject').click();
  await expect(ui2.page.locator('.headchat-incoming-fullscreen')).toHaveCount(0, { timeout: 15_000 });
  await expect(ui1.page.locator('.headchat-btn-hangup')).toHaveCount(0, { timeout: 15_000 });
  await expect
    .poll(async () => list((await w.api.get(`/api/su/chat/history/${id2}`)).body).filter((m) => m.messageType === 'CALL').some((m) => m.callAccepted === false), { timeout: 15_000 })
    .toBe(true);
});
