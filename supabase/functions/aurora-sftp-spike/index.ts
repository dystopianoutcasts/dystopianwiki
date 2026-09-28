// Spike T02: prove SFTP byte-range reads work from an Edge Function. Reads
// credentials from function secrets only; never echoes them.
import { connect } from '../../../packages/shared/aurora/sftp.ts';

const LOG_DIR = 'server-data/Logs';
const TAIL_BYTES = 4096;

Deno.serve(async () => {
  const host = Deno.env.get('AURORA_SFTP_HOST');
  const port = Number(Deno.env.get('AURORA_SFTP_PORT'));
  const username = Deno.env.get('AURORA_SFTP_USER');
  const password = Deno.env.get('AURORA_SFTP_PASSWORD');
  if (!host || !port || !username || !password) {
    return Response.json({ error: 'AURORA_SFTP_* secrets are not set' }, { status: 500 });
  }

  const t0 = performance.now();
  const step: Record<string, unknown> = {};
  try {
    const session = await connect({ host, port, username, password });
    const tConnected = performance.now();
    try {
      const root = (await session.list('.')).map((e) => (e.isDir ? `${e.name}/` : e.name));
      const logs = await session.list(LOG_DIR);
      const outcast = logs.filter((e) => !e.isDir && /_Outcast\.txt$/.test(e.name))
        .sort((a, b) => b.mtime - a.mtime);
      const newest = outcast[0];
      let file: string | null = null;
      let size = 0;
      let tail = '';
      let tRead = performance.now();
      if (newest) {
        file = `${LOG_DIR}/${newest.name}`;
        size = (await session.stat(file)).size;
        const start = Math.max(0, size - TAIL_BYTES);
        const bytes = await session.readRange(file, start, size - start);
        tail = new TextDecoder().decode(bytes);
        tRead = performance.now();
      }
      let memory: unknown = null;
      try {
        memory = Deno.memoryUsage();
      } catch { /* not available */ }
      return Response.json({
        root,
        logs: logs.map((e) => e.name),
        outcast_logs: outcast.map((e) => e.name),
        file,
        size,
        tail_bytes: tail.length,
        tail,
        memory,
        ms: {
          connect: Math.round(tConnected - t0),
          read: Math.round(tRead - tConnected),
          total: Math.round(performance.now() - t0),
        },
      });
    } finally {
      session.close();
    }
  } catch (err) {
    return Response.json(
      { error: (err as Error).message, step, ms: { total: Math.round(performance.now() - t0) } },
      { status: 502 },
    );
  }
});
