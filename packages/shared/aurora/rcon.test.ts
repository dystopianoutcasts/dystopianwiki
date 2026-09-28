// Run with: deno test packages/shared/aurora/rcon.test.ts
import {
  encodePacket,
  PacketDecoder,
  parsePlayers,
  parseStats,
  RconClient,
  type Transport,
} from './rcon.ts';

function assertEquals<T>(actual: T, expected: T, msg = ''): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} expected ${e} got ${a}`);
}

/** Scripted transport: each write() enqueues the bytes returned by `onWrite`. */
class FakeTransport implements Transport {
  private queue: Uint8Array[] = [];
  private waiter: (() => void) | null = null;
  written: Uint8Array[] = [];
  closed = false;
  constructor(private onWrite: (pkt: ReturnType<PacketDecoder['next']>) => Uint8Array[]) {}

  write(buf: Uint8Array): Promise<number> {
    this.written.push(buf);
    const dec = new PacketDecoder();
    dec.push(buf);
    const pkt = dec.next();
    for (const reply of this.onWrite(pkt)) this.queue.push(reply);
    this.waiter?.();
    return Promise.resolve(buf.length);
  }

  async read(buf: Uint8Array): Promise<number | null> {
    while (this.queue.length === 0) {
      if (this.closed) return null;
      await new Promise<void>((resolve) => (this.waiter = resolve));
    }
    const chunk = this.queue.shift()!;
    // Simulate a small read buffer so packets can straddle reads.
    const n = Math.min(buf.length, chunk.length);
    buf.set(chunk.subarray(0, n), 0);
    if (n < chunk.length) this.queue.unshift(chunk.subarray(n));
    return n;
  }

  close(): void {
    this.closed = true;
    this.waiter?.();
  }
}

Deno.test('encodePacket layout', () => {
  const pkt = encodePacket(7, 2, 'players');
  const view = new DataView(pkt.buffer);
  assertEquals(view.getInt32(0, true), 4 + 4 + 7 + 2, 'size');
  assertEquals(view.getInt32(4, true), 7, 'id');
  assertEquals(view.getInt32(8, true), 2, 'type');
  assertEquals(pkt.length, 4 + 4 + 4 + 7 + 2, 'total');
  assertEquals([pkt[pkt.length - 2], pkt[pkt.length - 1]], [0, 0], 'trailer');
});

Deno.test('decoder round-trips and handles split delivery', () => {
  const a = encodePacket(5, 0, 'hello');
  const b = encodePacket(6, 0, '');
  const all = new Uint8Array(a.length + b.length);
  all.set(a, 0);
  all.set(b, a.length);
  const dec = new PacketDecoder();
  dec.push(all.subarray(0, 6));
  assertEquals(dec.next(), null, 'incomplete');
  dec.push(all.subarray(6));
  assertEquals(dec.next(), { id: 5, type: 0, body: 'hello' });
  assertEquals(dec.next(), { id: 6, type: 0, body: '' });
  assertEquals(dec.next(), null, 'drained');
});

Deno.test('decoder rejects a malformed size', () => {
  const dec = new PacketDecoder();
  const bad = new Uint8Array(12);
  new DataView(bad.buffer).setInt32(0, 3, true);
  dec.push(bad);
  let threw = false;
  try {
    dec.next();
  } catch {
    threw = true;
  }
  assertEquals(threw, true);
});

Deno.test('exec concatenates a two-chunk response and drops the marker', async () => {
  const t = new FakeTransport((pkt) => {
    if (!pkt) return [];
    if (pkt.type === 3) return [encodePacket(pkt.id, 0, ''), encodePacket(pkt.id, 2, '')];
    if (pkt.body === 'stats game all') {
      return [encodePacket(pkt.id, 0, '\nfoo: 1'), encodePacket(pkt.id, 0, '\nbar: 2')];
    }
    // marker: unknown command, short text reply with the marker id
    return [encodePacket(pkt.id, 0, 'Unknown command')];
  });
  const client = new RconClient(t, 1000);
  await client.authenticate('pw');
  assertEquals(await client.exec('stats game all'), '\nfoo: 1\nbar: 2');
  client.close();
});

Deno.test('exec on an empty response does not hang (marker only)', async () => {
  const t = new FakeTransport((pkt) => {
    if (!pkt) return [];
    if (pkt.type === 3) return [encodePacket(pkt.id, 0, ''), encodePacket(pkt.id, 2, '')];
    if (pkt.body === 'aurora_marker') return [encodePacket(pkt.id, 0, 'Unknown command')];
    return []; // the real command replies with nothing
  });
  const client = new RconClient(t, 1000);
  await client.authenticate('pw');
  assertEquals(await client.exec('some-silent-command'), '');
  client.close();
});

Deno.test('exec times out instead of hanging when the server goes silent', async () => {
  const t = new FakeTransport((pkt) => {
    if (pkt && pkt.type === 3) return [encodePacket(pkt.id, 0, ''), encodePacket(pkt.id, 2, '')];
    return [];
  });
  const client = new RconClient(t, 150);
  await client.authenticate('pw');
  let message = '';
  try {
    await client.exec('players');
  } catch (err) {
    message = (err as Error).message;
  }
  assertEquals(/timed out/.test(message), true, message);
});

Deno.test('wrong password produces a clear error', async () => {
  const t = new FakeTransport((pkt) => {
    if (pkt && pkt.type === 3) return [encodePacket(pkt.id, 0, ''), encodePacket(-1, 2, '')];
    return [];
  });
  const client = new RconClient(t, 1000);
  let message = '';
  try {
    await client.authenticate('bad');
  } catch (err) {
    message = (err as Error).message;
  }
  assertEquals(/authentication failed/.test(message), true, message);
  assertEquals(t.closed, true, 'socket closed');
});

Deno.test('wrong password with an immediate close still errors clearly', async () => {
  const t = new FakeTransport((pkt) => {
    if (pkt && pkt.type === 3) {
      queueMicrotask(() => t.close());
      return [];
    }
    return [];
  });
  const client = new RconClient(t, 1000);
  let message = '';
  try {
    await client.authenticate('bad');
  } catch (err) {
    message = (err as Error).message;
  }
  assertEquals(/authentication failed/.test(message), true, message);
});

Deno.test('parsePlayers', () => {
  assertEquals(parsePlayers('Players connected (2): \n-alice\n-bob smith\n'), ['alice', 'bob smith']);
  assertEquals(parsePlayers('Players connected (0): \n'), []);
  assertEquals(parsePlayers(''), []);
});

Deno.test('parseStats keeps numeric keys and drops the rest', () => {
  const text = '\nfps: 60\nmemory-used: 1234.5\nname: server\nneg: -3\nempty:\n';
  assertEquals(parseStats(text), { fps: 60, 'memory-used': 1234.5, neg: -3 });
  assertEquals(parseStats(''), {});
});
