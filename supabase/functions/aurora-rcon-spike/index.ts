// Spike T01: prove RCON works from an Edge Function. Reads credentials from
// function secrets only; never echoes them.
import { connect, parsePlayers, parseStats } from '../../../packages/shared/aurora/rcon.ts';

Deno.serve(async () => {
  const host = Deno.env.get('AURORA_RCON_HOST');
  const port = Number(Deno.env.get('AURORA_RCON_PORT'));
  const password = Deno.env.get('AURORA_RCON_PASSWORD');
  if (!host || !port || !password) {
    return Response.json({ error: 'AURORA_RCON_* secrets are not set' }, { status: 500 });
  }

  const t0 = performance.now();
  try {
    const client = await connect({ host, port, password });
    const tConnected = performance.now();
    try {
      const players = parsePlayers(await client.exec('players'));
      const version = (await client.exec('stats version')).trim();
      const game = parseStats(await client.exec('stats game all'));
      const performanceStats = parseStats(await client.exec('stats performance all'));
      const network = parseStats(await client.exec('stats network all'));
      const tEnd = performance.now();
      return Response.json({
        players,
        version,
        game,
        performance: performanceStats,
        network,
        ms: { connect: Math.round(tConnected - t0), total: Math.round(tEnd - t0) },
      });
    } finally {
      client.close();
    }
  } catch (err) {
    return Response.json(
      { error: (err as Error).message, ms: { total: Math.round(performance.now() - t0) } },
      { status: 502 },
    );
  }
});
