// Run with: deno test packages/shared/aurora/worlds.test.ts
import {
  disabledWorlds,
  isMissingColumnError,
  newestWorldRecord,
  OLD_WORLD_PRUNE_DAYS,
  OLD_WORLD_PRUNE_LIMIT,
  probePath,
  PROBE_FAILED_NOTE,
  probeWorlds,
  probeWorldsForRun,
  pruneOldWorlds,
  registerBatchWorld,
  registerWorldArgs,
  summarizeWorlds,
  type WorldDb,
  type WorldState,
} from './worlds.ts';
import type { AuroraRecord, WorldRecord } from './parser.ts';
import type { Row } from './ingest-core.ts';

function assertEquals<T>(actual: T, expected: T, msg = ''): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} expected ${e} got ${a}`);
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

async function rejects(p: Promise<unknown>, msg: string): Promise<string> {
  try {
    await p;
  } catch (err) {
    return String(err);
  }
  throw new Error(`${msg}: did not throw`);
}

/** The errors PostgREST answers, as AuroraRest phrases them ("<what>: <status> <body>"). */
const MISSING_COLUMN =
  'Error: select servers?select=id,current_world_id&id=eq.outcasts-main: 400 {"code":"42703","details":null,"hint":null,"message":"column servers.current_world_id does not exist"}';
const MISSING_FUNCTION =
  'Error: rpc register_world: 404 {"code":"PGRST202","message":"Could not find the function aurora.register_world(p_new, p_server) in the schema cache"}';

function fakeDb(opts: { select?: () => Promise<unknown[]>; rpc?: (fn: string, args: Row) => Promise<unknown> } = {}):
  WorldDb & { selects: string[]; calls: { fn: string; args: Row }[] } {
  const selects: string[] = [];
  const calls: { fn: string; args: Row }[] = [];
  return {
    selects,
    calls,
    select: <T>(path: string) => {
      selects.push(path);
      return (opts.select ?? (() => Promise.resolve([])))() as Promise<T[]>;
    },
    rpc: (fn: string, args: Row) => {
      calls.push({ fn, args });
      return (opts.rpc ?? (() => Promise.resolve(null)))(fn, args);
    },
  };
}

const REC: WorldRecord = { k: 'world', t: 1759000000000, w: '3f2b8c1e-9a4d-4e6f-b7a2-0c5d1e8f9a3b', wn: true, wa: 0.5, ws: 1758999990000 };

// ---------------------------------------------------------------------------
// The probe: three outcomes
// ---------------------------------------------------------------------------

Deno.test('probe: 032 applied with a current world -> enabled with that world', async () => {
  const db = fakeDb({ select: () => Promise.resolve([{ id: 'outcasts-main', current_world_id: 'w3' }]) });
  const w = await probeWorlds(db, 'outcasts-main');
  assertEquals(w, { enabled: true, currentWorldId: 'w3', events: [], note: null });
  assertEquals(db.selects, ['servers?select=id,current_world_id&id=eq.outcasts-main']);
  assertEquals(db.selects[0], probePath('outcasts-main'));
});

Deno.test('probe: 032 applied, no server row or no world yet -> enabled with no current world', async () => {
  assertEquals(await probeWorlds(fakeDb(), 'outcasts-main'), { enabled: true, currentWorldId: null, events: [], note: null });
  const db = fakeDb({ select: () => Promise.resolve([{ id: 'outcasts-main', current_world_id: null }]) });
  assertEquals((await probeWorlds(db, 'outcasts-main')).currentWorldId, null);
});

Deno.test('probe: before 032 (missing column, 42703 or PGRST204, or a missing table) -> disabled, not an error', async () => {
  for (const msg of [
    MISSING_COLUMN,
    'Error: select servers: 400 {"code":"PGRST204","message":"Could not find the \'current_world_id\' column of \'servers\' in the schema cache"}',
    'Error: select servers: 404 {"code":"PGRST205","message":"Could not find the table \'aurora.servers\' in the schema cache"}',
  ]) {
    const w = await probeWorlds(fakeDb({ select: () => Promise.reject(new Error(msg.replace(/^Error: /, ''))) }), 's');
    assertEquals(w.enabled, false, msg);
    assertEquals(w.currentWorldId, null, msg);
  }
});

Deno.test('probe: any other failure throws (the caller skips the tail rather than guess)', async () => {
  const err = await rejects(
    probeWorlds(fakeDb({ select: () => Promise.reject(new Error('select servers: 503 upstream')) }), 's'),
    '503',
  );
  assert(err.includes('503'), err);
});

Deno.test('isMissingColumnError knows 42703 and PGRST204 and nothing else', () => {
  assert(isMissingColumnError(MISSING_COLUMN), '42703');
  assert(isMissingColumnError('400 {"code":"PGRST204"}'), 'PGRST204');
  assert(!isMissingColumnError('500 boom'), '500');
  assert(!isMissingColumnError(MISSING_FUNCTION), 'a missing function is not a missing column');
});

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

Deno.test('register: the args map the record (p_new from wn === true, nulls for absent wa and ws)', () => {
  assertEquals(registerWorldArgs('srv', REC), {
    p_server: 'srv', p_exporter_world_id: REC.w, p_new: true, p_world_age_hours: 0.5, p_started_ms: 1758999990000,
  });
  assertEquals(registerWorldArgs('srv', { k: 'world', t: 1, w: 'abcdefgh' }), {
    p_server: 'srv', p_exporter_world_id: 'abcdefgh', p_new: false, p_world_age_hours: null, p_started_ms: null,
  });
});

Deno.test('register: the answer becomes the current world and is recorded, adopted included', async () => {
  const worlds: WorldState = { enabled: true, currentWorldId: 'w1', events: [], note: null };
  const db = fakeDb({ rpc: () => Promise.resolve({ world_id: 'w2', status: 'current', switched: true }) });
  const ev = await registerBatchWorld(db, 'srv', REC, worlds);
  assertEquals(db.calls.map((c) => c.fn), ['register_world']);
  assertEquals(worlds.currentWorldId, 'w2');
  assertEquals(ev, { exporterWorldId: REC.w, worldId: 'w2', status: 'current', switched: true, adopted: false, t: REC.t });

  const db2 = fakeDb({ rpc: () => Promise.resolve({ world_id: 'w2', status: 'current', switched: false, adopted: true }) });
  const ev2 = await registerBatchWorld(db2, 'srv', REC, worlds);
  assertEquals([ev2?.switched, ev2?.adopted], [false, true]);
  assertEquals(worlds.events.length, 2);
  assertEquals(worlds.currentWorldId, 'w2');
});

Deno.test('register: a pending answer keeps tagging with the world it returns (the current one)', async () => {
  const worlds: WorldState = { enabled: true, currentWorldId: 'w1', events: [], note: null };
  const db = fakeDb({ rpc: () => Promise.resolve({ world_id: 'w1', status: 'pending', switched: false }) });
  await registerBatchWorld(db, 'srv', { ...REC, wn: false, wa: 500 }, worlds);
  assertEquals(worlds.currentWorldId, 'w1');
  assertEquals(worlds.events[0].status, 'pending');
});

Deno.test('register: nothing to do when disabled or when the batch has no world record', async () => {
  const db = fakeDb();
  assertEquals(await registerBatchWorld(db, 'srv', REC, disabledWorlds()), null);
  assertEquals(await registerBatchWorld(db, 'srv', undefined, { enabled: true, currentWorldId: 'w1', events: [], note: null }), null);
  assertEquals(db.calls.length, 0);
});

Deno.test('register: a missing function disables worlds for the run; any other failure throws', async () => {
  const worlds: WorldState = { enabled: true, currentWorldId: 'w1', events: [], note: null };
  const ev = await registerBatchWorld(fakeDb({ rpc: () => Promise.reject(new Error(MISSING_FUNCTION.replace(/^Error: /, ''))) }), 'srv', REC, worlds);
  assertEquals(ev, null);
  assertEquals([worlds.enabled, worlds.currentWorldId], [false, null]);

  const w2: WorldState = { enabled: true, currentWorldId: 'w1', events: [], note: null };
  await rejects(registerBatchWorld(fakeDb({ rpc: () => Promise.reject(new Error('rpc register_world: 500 boom')) }), 'srv', REC, w2), '500');
  assertEquals([w2.enabled, w2.currentWorldId], [true, 'w1'], 'state untouched by a failed call');
  await rejects(registerBatchWorld(fakeDb({ rpc: () => Promise.resolve({ status: 'current' }) }), 'srv', REC, w2), 'no world_id');
  await rejects(registerBatchWorld(fakeDb({ rpc: () => Promise.resolve(null) }), 'srv', REC, w2), 'null answer');
  await rejects(registerBatchWorld(fakeDb({ rpc: () => Promise.resolve({ world_id: '' }) }), 'srv', REC, w2), 'empty id');
  assertEquals(w2.currentWorldId, 'w1');
});

Deno.test('register: world_id null (the server has no current world) is an answer: untagged, not an error', async () => {
  const worlds: WorldState = { enabled: true, currentWorldId: 'w1', events: [], note: null };
  const db = fakeDb({ rpc: () => Promise.resolve({ world_id: null, status: null, switched: false }) });
  const ev = await registerBatchWorld(db, 'srv', REC, worlds);
  assertEquals([ev?.worldId, worlds.currentWorldId, worlds.enabled], [null, null, true]);
});

Deno.test('newestWorldRecord: the newest by t, later wins a tie, undefined without one', () => {
  const recs = [
    { k: 'world', t: 5, w: 'aaaaaaaa' },
    { k: 'pos', t: 9, u: 'x', x: 1, y: 1 },
    { k: 'world', t: 7, w: 'bbbbbbbb' },
    { k: 'world', t: 7, w: 'cccccccc' },
    { k: 'world', t: 6, w: 'dddddddd' },
  ] as AuroraRecord[];
  assertEquals(newestWorldRecord(recs)?.w, 'cccccccc');
  assertEquals(newestWorldRecord(recs.filter((r) => r.k !== 'world')), undefined);
});

// ---------------------------------------------------------------------------
// prune_old_worlds and the summary
// ---------------------------------------------------------------------------

Deno.test('prune: called once with (30, 5000) when enabled; skipped when disabled; missing function is a note', async () => {
  const db = fakeDb({ rpc: () => Promise.resolve(12) });
  const on: WorldState = { enabled: true, currentWorldId: 'w1', events: [], note: null };
  assertEquals(await pruneOldWorlds(db, on), 12);
  assertEquals(db.calls, [{ fn: 'prune_old_worlds', args: { p_days: 30, p_limit: 5000 } }]);
  assertEquals([OLD_WORLD_PRUNE_DAYS, OLD_WORLD_PRUNE_LIMIT], [30, 5000]);

  const off = fakeDb({ rpc: () => Promise.resolve(12) });
  assertEquals(await pruneOldWorlds(off, disabledWorlds()), null);
  assertEquals(off.calls.length, 0);

  const missing = fakeDb({ rpc: () => Promise.reject(new Error('rpc prune_old_worlds: 404 {"code":"PGRST202"}')) });
  const w: WorldState = { enabled: true, currentWorldId: 'w1', events: [], note: null };
  assertEquals(await pruneOldWorlds(missing, w), null);
  assert((w.note ?? '').includes('prune_old_worlds'), 'noted');
  await rejects(pruneOldWorlds(fakeDb({ rpc: () => Promise.reject(new Error('500 boom')) }), w), 'a real failure throws');
});

Deno.test('summary: disabled, or the current world and the events', () => {
  assertEquals(summarizeWorlds(disabledWorlds()), 'disabled');
  assertEquals(summarizeWorlds(disabledWorlds('why')), 'disabled');
  const s = summarizeWorlds({ enabled: true, currentWorldId: 'w2', events: [], note: null });
  assertEquals(s, { state: 'enabled', current: 'w2', events: [], note: null });
});

Deno.test('probeWorldsForRun: a transient probe error means world unknown (enabled, no current world), not a skipped tail', async () => {
  for (const text of ['select servers: 503 upstream', 'fetch failed']) {
    const r = await probeWorldsForRun(fakeDb({ select: () => Promise.reject(new Error(text)) }), 's');
    assertEquals(r.worlds.enabled, true, text);
    assertEquals(r.worlds.currentWorldId, null, text);
    assertEquals(r.worlds.note, PROBE_FAILED_NOTE, text);
    assert((r.error ?? '').includes(text), `error reported: ${r.error}`);
  }
  const missing = await probeWorldsForRun(
    fakeDb({ select: () => Promise.reject(new Error('select servers: 400 {"code":"42703","message":"column does not exist"}')) }),
    's',
  );
  assertEquals(missing.worlds.enabled, false, 'a missing column still disables worlds');
  assertEquals(missing.error, null);
});
