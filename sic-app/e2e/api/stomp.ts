import { Client, type IMessage } from '@stomp/stompjs';
import { accessToken, API_PORT } from '../api';

const WS = `ws://localhost:${API_PORT}/ws`;

/** Messages received on one subscription; next() waits for the first one matching a predicate. */
export class Inbox {
  readonly all: any[] = [];
  private waiters: { match: (m: any) => boolean; resolve: (m: any) => void }[] = [];

  push(m: any) {
    this.all.push(m);
    this.waiters = this.waiters.filter((w) => (w.match(m) ? (w.resolve(m), false) : true));
  }

  /** Resolves with the first message (already received or arriving within `ms`) that matches; rejects on timeout. */
  next(match: (m: any) => boolean = () => true, ms = 8000): Promise<any> {
    const seen = this.all.find(match);
    if (seen) return Promise.resolve(seen);
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`no matching message within ${ms}ms (got ${this.all.length}: ${JSON.stringify(this.all).slice(0, 300)})`)), ms);
      this.waiters.push({ match, resolve: (m) => (clearTimeout(t), resolve(m)) });
    });
  }

  /** True when no message matching arrives for `ms` (used for "must NOT be delivered"). */
  async silent(match: (m: any) => boolean = () => true, ms = 1500): Promise<boolean> {
    await new Promise((r) => setTimeout(r, ms));
    return !this.all.some(match);
  }
}

/** Minimal STOMP-over-WebSocket client for the chat/call endpoints; the token goes into the CONNECT frame like the app does. */
export class Stomp {
  private constructor(private readonly client: Client) {}

  /** tokenFile undefined = the first test user; token null = connect without credentials. */
  static async connect(tokenFile?: string, token?: string | null): Promise<Stomp> {
    const bearer = token === null ? undefined : (token ?? (await accessToken(tokenFile)));
    const client = new Client({
      webSocketFactory: () => new WebSocket(WS) as any,
      connectHeaders: bearer ? { Authorization: `Bearer ${bearer}` } : {},
      reconnectDelay: 0,
    });
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('STOMP connect timed out')), 10_000);
      client.onConnect = () => (clearTimeout(t), resolve());
      client.onStompError = (f) => (clearTimeout(t), reject(new Error(`STOMP error: ${f.headers['message']}`)));
      client.onWebSocketError = () => (clearTimeout(t), reject(new Error('WebSocket error')));
      client.activate();
    });
    return new Stomp(client);
  }

  subscribe(destination: string): Inbox {
    const inbox = new Inbox();
    this.client.subscribe(destination, (m: IMessage) => {
      let body: any = m.body;
      try { body = JSON.parse(m.body); } catch {}
      inbox.push(body);
    });
    return inbox;
  }

  send(destination: string, body: unknown) {
    this.client.publish({ destination, body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
  }

  async close() {
    await this.client.deactivate();
  }
}
