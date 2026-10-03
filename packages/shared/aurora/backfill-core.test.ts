// Run with: deno test packages/shared/aurora/backfill-core.test.ts
import { type BackfillDb, replayFile } from './backfill-core.ts';
import type { Row } from './ingest-core.ts';

function assertEquals<T>(actual: T, expected: T, msg = ''): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} expected ${e} got ${a}`);
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

const SERVER = 'outcasts-main';
const NAME = '2026-10-01_10-00_Aurora.txt';
const W_OLD = 'aaaaaaaa-1111-2222-3333-444444444444';
const P = '[01-10-26 10:00:00.000]';

function pos(i: number): string {
  return `${P} A1 {"k":"pos","t":${1759312800000 + i * 5000},"u":"alice","x":${100 + i},"y":200}.\n`;
}
function world(w: string): string {
  return `${P} A1 {"k":"world","t":1759312800000,"w":"${w}","wn":false,"wa":300}.\n`;
}
function veh(): string {
  return `${P} A1 {"k":"veh","t":1759312801000,"id":9,"q":4242,"s":"Base.Van","x":10,"y":20}.\n`;
}

/** Records every call; `worlds` is what the aurora.worlds lookup answers. */
function fakeDb(worlds: { world_id: string; status: string }[] | Error) {
  const calls: string[] = [];
  const rows: Record<string, Row[]> = {};
  const rpcs: { fn: string; args: Row }[] = [];
  const db: BackfillDb = {
    select: <T>(path: string) => {
      calls.push(`select ${path}`);
      if (worlds instanceof Error) return Promise.reject(worlds);
      return Promise.resolve(worlds as unknown as T[]);
    },
    upsert: (table, r) => {
      calls.push(`upsert ${table}`);
      (rows[table] ??= []).push(...r);
      return Promise.resolve();
    },
    patch: (path) => {
      calls.push(`patch ${path}`);
      return Promise.resolve();
    },
    rpc: (fn, args) => {
      calls.push(`rpc ${fn}`);
      rpcs.push({ fn, args });
      return Promise.resolve(null);
    },
  };
  return { db, calls, rows, rpcs };
}

Deno.test('backfill: a world nobody registered skips the whole file, and nothing is written', async () => {
  const f = fakeDb([]);
  const r = await replayFile(f.db, SERVER, NAME, world(W_OLD) + pos(0) + veh());
  assert(r.skipped !== null && r.skipped.includes(W_OLD), `skip reason: ${r.skipped}`);
  assertEquals(f.calls, [
    `select worlds?select=world_id,status&server_id=eq.${SERVER}&exporter_world_id=eq.${W_OLD}`,
  ]);
  assertEquals(r.rowsWritten, 0);
});

Deno.test('backfill: a file with no world record is skipped without a lookup', async () => {
  const f = fakeDb([{ world_id: 'w1', status: 'current' }]);
  const r = await replayFile(f.db, SERVER, NAME, pos(0) + pos(1));
  assertEquals(r.skipped, 'no world record in the file');
  assertEquals(f.calls, []);
});

Deno.test('backfill: no worlds table (032 not applied) skips the file and says why', async () => {
  const f = fakeDb(new Error('select worlds: 404 {"code":"PGRST205","message":"Could not find the table"}'));
  const r = await replayFile(f.db, SERVER, NAME, world(W_OLD) + pos(0));
  assert((r.skipped ?? '').includes('032'), `skip reason: ${r.skipped}`);
  assertEquals(f.calls.filter((c) => !c.startsWith('select')), []);
});

Deno.test('backfill: a known ENDED world tags every row with it (history replay)', async () => {
  const f = fakeDb([{ world_id: 'w1', status: 'ended' }]);
  const r = await replayFile(f.db, SERVER, NAME, pos(0) + world(W_OLD) + pos(1) + veh());
  assertEquals(r.skipped, null);
  assertEquals(r.worldId, 'w1');
  for (const t of ['players', 'player_positions', 'player_position_history']) {
    assert((f.rows[t]?.length ?? 0) > 0, `${t} written`);
    for (const row of f.rows[t]) assertEquals(row.world_id, 'w1', t);
  }
  assert(!('world_id' in f.rows['servers'][0]), 'servers is not per world');
  // upsert_vehicles stamps the server's CURRENT world itself (032): a replayed car
  // lands in the current world, a limit of 032's design recorded in STATUS.
  const vehCall = f.rpcs.find((c) => c.fn === 'upsert_vehicles');
  assertEquals(Object.keys(vehCall?.args ?? {}).sort(), ['p_rows', 'p_server']);
});

Deno.test('backfill: register_world is never called, whatever the files hold', async () => {
  for (const answer of [[], [{ world_id: 'w1', status: 'current' }], [{ world_id: 'w2', status: 'ended' }]]) {
    const f = fakeDb(answer);
    await replayFile(f.db, SERVER, NAME, world(W_OLD) + pos(0));
    await replayFile(f.db, SERVER, NAME, pos(0));
    assertEquals(f.rpcs.filter((c) => c.fn === 'register_world').length, 0);
    assert(!f.calls.some((c) => c.includes('register_world')), 'no register_world anywhere');
  }
});

Deno.test('backfill: the dry run looks nothing up and plans untagged', async () => {
  const r = await replayFile(null, SERVER, NAME, world(W_OLD) + pos(0));
  assertEquals([r.skipped, r.worldId, r.rowsWritten], [null, null, 0]);
  assert(r.plan.upserts.every((u) => u.rows.every((row) => !('world_id' in row))), 'untagged');
  assertEquals(r.plan.counts['world'], 1);
});
