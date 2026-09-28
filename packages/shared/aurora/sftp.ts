// SFTP client for the PZ host, written for Deno (Supabase Edge Functions) on top
// of npm:ssh2. Kept and reused by the ingest function (T08) if the spike passes.
//
// `Client` is loaded lazily so a load failure surfaces as a catchable error with
// the exact message, instead of failing the whole function at boot.

// deno-lint-ignore no-explicit-any
type Any = any;

export interface SftpOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  connectTimeoutMs?: number;
}

export interface DirEntry {
  name: string;
  size: number;
  mtime: number; // unix seconds
  isDir: boolean;
}

export interface FileStat {
  size: number;
  mtime: number;
}

export class SftpSession {
  constructor(private conn: Any, private sftp: Any) {}

  list(dir: string): Promise<DirEntry[]> {
    return new Promise((resolve, reject) => {
      this.sftp.readdir(dir, (err: Error | undefined, items: Any[]) => {
        if (err) return reject(new Error(`SFTP readdir ${dir}: ${err.message}`));
        resolve(items.map((i) => ({
          name: i.filename as string,
          size: i.attrs.size as number,
          mtime: i.attrs.mtime as number,
          // mode bits: S_IFMT (0o170000) == S_IFDIR (0o040000)
          isDir: ((i.attrs.mode as number) & 0o170000) === 0o040000,
        })));
      });
    });
  }

  stat(path: string): Promise<FileStat> {
    return new Promise((resolve, reject) => {
      this.sftp.stat(path, (err: Error | undefined, attrs: Any) => {
        if (err) return reject(new Error(`SFTP stat ${path}: ${err.message}`));
        resolve({ size: attrs.size, mtime: attrs.mtime });
      });
    });
  }

  /** Read `length` bytes starting at `offset` (fewer if the file ends first). */
  readRange(path: string, offset: number, length: number): Promise<Uint8Array> {
    if (length <= 0) return Promise.resolve(new Uint8Array(0));
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      const stream = this.sftp.createReadStream(path, { start: offset, end: offset + length - 1 });
      stream.on('data', (c: Uint8Array) => chunks.push(c));
      stream.on('error', (e: Error) => reject(new Error(`SFTP read ${path}: ${e.message}`)));
      stream.on('end', () => resolve(concat(chunks)));
    });
  }

  async download(path: string): Promise<Uint8Array> {
    const { size } = await this.stat(path);
    return this.readRange(path, 0, size);
  }

  close(): void {
    try {
      this.conn.end();
    } catch { /* already closed */ }
  }
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const c of chunks) {
    out.set(c, pos);
    pos += c.length;
  }
  return out;
}

export async function connect(opts: SftpOptions): Promise<SftpSession> {
  const { Client } = await import('npm:ssh2@1.16.0');
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const fail = (e: Error) => {
      try {
        conn.end();
      } catch { /* ignore */ }
      reject(e);
    };
    conn.on('ready', () => {
      conn.sftp((err: Error | undefined, sftp: Any) => {
        if (err) return fail(new Error(`SFTP subsystem: ${err.message}`));
        resolve(new SftpSession(conn, sftp));
      });
    });
    conn.on('error', (e: Error) => fail(new Error(`SSH: ${e.message}`)));
    conn.connect({
      host: opts.host,
      port: opts.port,
      username: opts.username,
      password: opts.password,
      readyTimeout: opts.connectTimeoutMs ?? 10000,
    });
  });
}
