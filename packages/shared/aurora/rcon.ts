// Source RCON client for the Project Zomboid server, written for Deno (Supabase
// Edge Functions). Kept and reused by the ingest function (T08).
//
// Wire format: int32 LE size (= 4 + 4 + len(body) + 2), int32 LE id, int32 LE
// type, body, 0x00 0x00. Types: 3 auth, 2 exec, 0 response.
//
// PZ quirks this client works around:
//  - An exec reply is split into chunks of <= 4086 bytes, each (id, 0, chunk),
//    with NO terminator, and an empty response sends NOTHING. So every exec is
//    followed by a second exec (`aurora_marker`, id + 1); we read until a packet
//    carrying the marker id arrives and drop it.
//  - A wrong password answers the auth with id -1 and closes the socket.

const TYPE_RESPONSE = 0;
const TYPE_EXEC = 2;
const TYPE_AUTH = 3;
const MARKER_COMMAND = 'aurora_marker';
const EXEC_TIMEOUT_MS = 5000;
const MAX_PACKET_SIZE = 8192;

export interface Packet {
  id: number;
  type: number;
  body: string;
}

export interface Transport {
  read(buf: Uint8Array): Promise<number | null>;
  write(buf: Uint8Array): Promise<number>;
  close(): void;
}

export interface RconOptions {
  host: string;
  port: number;
  password: string;
  execTimeoutMs?: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function encodePacket(id: number, type: number, body: string): Uint8Array {
  const payload = encoder.encode(body);
  const size = 4 + 4 + payload.length + 2;
  const out = new Uint8Array(4 + size);
  const view = new DataView(out.buffer);
  view.setInt32(0, size, true);
  view.setInt32(4, id, true);
  view.setInt32(8, type, true);
  out.set(payload, 12);
  return out; // trailing two bytes are already 0x00
}

/** Incremental decoder: feed raw socket bytes, pull complete packets. */
export class PacketDecoder {
  private buf = new Uint8Array(0);

  push(chunk: Uint8Array): void {
    const merged = new Uint8Array(this.buf.length + chunk.length);
    merged.set(this.buf, 0);
    merged.set(chunk, this.buf.length);
    this.buf = merged;
  }

  next(): Packet | null {
    if (this.buf.length < 4) return null;
    const view = new DataView(this.buf.buffer, this.buf.byteOffset, this.buf.byteLength);
    const size = view.getInt32(0, true);
    if (size < 10 || size > MAX_PACKET_SIZE) {
      throw new Error(`RCON: malformed packet size ${size}`);
    }
    if (this.buf.length < 4 + size) return null;
    const id = view.getInt32(4, true);
    const type = view.getInt32(8, true);
    const body = decoder.decode(this.buf.subarray(12, 4 + size - 2));
    this.buf = this.buf.slice(4 + size);
    return { id, type, body };
  }
}

export class RconError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RconError';
  }
}

export class RconClient {
  private decoder = new PacketDecoder();
  private nextId = 10;
  private closed = false;
  private readonly readBuf = new Uint8Array(8192);

  constructor(private transport: Transport, private execTimeoutMs = EXEC_TIMEOUT_MS) {}

  /** Wait for the next full packet, or reject on timeout / closed socket. */
  private async readPacket(deadline: number): Promise<Packet> {
    for (;;) {
      const pkt = this.decoder.next();
      if (pkt) return pkt;
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw new RconError('RCON: timed out waiting for response');
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new RconError('RCON: timed out waiting for response')), remaining);
      });
      try {
        const n = await Promise.race([this.transport.read(this.readBuf), timeout]);
        if (n === null || n === 0) throw new RconError('RCON: connection closed by server');
        this.decoder.push(this.readBuf.subarray(0, n));
      } finally {
        clearTimeout(timer);
      }
    }
  }

  async authenticate(password: string): Promise<void> {
    const deadline = Date.now() + this.execTimeoutMs;
    const id = this.nextId++;
    try {
      await this.transport.write(encodePacket(id, TYPE_AUTH, password));
      for (;;) {
        const pkt = await this.readPacket(deadline);
        if (pkt.id === -1) throw new RconError('RCON: authentication failed (wrong password)');
        // First packet is (id, 0, ""), second is (id, 2, "").
        if (pkt.type === TYPE_EXEC && pkt.id === id) return;
      }
    } catch (err) {
      this.close();
      if (err instanceof RconError && /connection closed/.test(err.message)) {
        // The server drops the socket right after a bad-password reply.
        throw new RconError('RCON: authentication failed (connection closed during auth)');
      }
      throw err;
    }
  }

  async exec(command: string): Promise<string> {
    if (this.closed) throw new RconError('RCON: client is closed');
    const id = this.nextId;
    const markerId = id + 1;
    this.nextId += 2;
    const deadline = Date.now() + this.execTimeoutMs;
    try {
      await this.transport.write(encodePacket(id, TYPE_EXEC, command));
      await this.transport.write(encodePacket(markerId, TYPE_EXEC, MARKER_COMMAND));
      let out = '';
      for (;;) {
        const pkt = await this.readPacket(deadline);
        if (pkt.id === markerId) return out;
        if (pkt.id === id && pkt.type === TYPE_RESPONSE) out += pkt.body;
      }
    } catch (err) {
      this.close();
      throw err;
    }
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    try {
      this.transport.close();
    } catch { /* already closed */ }
  }
}

// Deno's connection type, referenced structurally so this file does not depend
// on Deno's lib typings being present at type-check time.
interface DenoLike {
  connect(opts: { hostname: string; port: number }): Promise<Transport>;
}

export async function connect(opts: RconOptions): Promise<RconClient> {
  const deno = (globalThis as unknown as { Deno?: DenoLike }).Deno;
  if (!deno) throw new RconError('RCON: Deno.connect is unavailable in this runtime');
  const timeoutMs = opts.execTimeoutMs ?? EXEC_TIMEOUT_MS;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new RconError('RCON: TCP connect timed out')), timeoutMs);
  });
  let transport: Transport;
  try {
    transport = await Promise.race([deno.connect({ hostname: opts.host, port: opts.port }), timeout]);
  } finally {
    clearTimeout(timer);
  }
  const client = new RconClient(transport, timeoutMs);
  await client.authenticate(opts.password);
  return client;
}

/** `Players connected (N): \n-name\n-name\n` -> ['name', 'name'] */
export function parsePlayers(text: string): string[] {
  const names: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith('-')) {
      const name = line.slice(1).trim();
      if (name) names.push(name);
    }
  }
  return names;
}

/** `\nkey: value` per line -> numeric entries only (non-numeric values dropped). */
export function parseStats(text: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const line of text.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const raw = line.slice(idx + 1).trim();
    if (!key || raw === '') continue;
    const value = Number(raw);
    if (Number.isFinite(value)) out[key] = value;
  }
  return out;
}
