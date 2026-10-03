// Run with: deno test packages/shared/aurora/tail.test.ts
import {
  DEFAULT_RUN_BUDGET_MS,
  emptyTotals,
  findTarget,
  type LoopClock,
  resolveRunBudget,
  runTailLoop,
  type TailConfig,
  type TailDb,
  type TailSession,
  tailStep,
} from './tail.ts';
import type { Row } from './ingest-core.ts';
import { disabledWorlds, type WorldState } from './worlds.ts';

function assertEquals<T>(actual: T, expected: T, msg = ''): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} expected ${e} got ${a}`);
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

/** A clock that only moves when the code under test sleeps or a step "costs" time. */
class FakeClock implements LoopClock {
  constructor(public t: number) {}
  now(): number {
    return this.t;
  }
  sleep(ms: number): Promise<void> {
    this.t += ms;
    return Promise.resolve();
  }
}

// ---------------------------------------------------------------------------
// The loop
// ---------------------------------------------------------------------------

Deno.test('the loop stops at the deadline and never begins a step with under 5 s left', async () => {
  // Run starts at 0 with the 55 s budget; the first (out-of-loop) step began at 1 s.
  const clock = new FakeClock(1_500);
  const starts: number[] = [];
  const result = await runTailLoop({
    deadline: DEFAULT_RUN_BUDGET_MS,
    lastStepAt: 1_000,
    clock,
    step: () => {
      starts.push(clock.t);
      clock.t += 400; // each step costs 400 ms
      return Promise.resolve();
    },
  });
  // 6, 11, ... 46 s: the next would be 51 s with 4 s left, so it is not begun.
  assertEquals(starts, [6_000, 11_000, 16_000, 21_000, 26_000, 31_000, 36_000, 41_000, 46_000]);
  assertEquals(result, { loops: 9, stoppedBy: 'deadline', error: null });
  assert(clock.t <= DEFAULT_RUN_BUDGET_MS, `loop ran past the deadline: ${clock.t}`);
  for (const s of starts) assert(DEFAULT_RUN_BUDGET_MS - s >= 5_000, `step began at ${s} with under 5 s left`);
});

Deno.test('a slow step pushes the next one back rather than stacking them', async () => {
  const clock = new FakeClock(0);
  const starts: number[] = [];
  await runTailLoop({
    deadline: 30_000,
    lastStepAt: 0,
    clock,
    step: () => {
      starts.push(clock.t);
      clock.t += starts.length === 1 ? 7_000 : 100; // the first step overruns the interval
      return Promise.resolve();
    },
  });
  // 5 s, then 12 s (immediately after the 7 s step), then every 5 s from there.
  assertEquals(starts, [5_000, 12_000, 17_000, 22_000]);
});

Deno.test('no step at all when the setup already used the budget', async () => {
  const clock = new FakeClock(52_000);
  let calls = 0;
  const result = await runTailLoop({
    deadline: 55_000,
    lastStepAt: 51_000,
    clock,
    step: () => {
      calls++;
      return Promise.resolve();
    },
  });
  assertEquals(calls, 0);
  assertEquals(result.loops, 0);
  assertEquals(clock.t, 52_000, 'must not even sleep');
});

Deno.test('an error stops the loop and is reported, with the steps before it counted', async () => {
  const clock = new FakeClock(0);
  let n = 0;
  const result = await runTailLoop({
    deadline: 55_000,
    lastStepAt: 0,
    clock,
    step: () => {
      n++;
      if (n === 3) return Promise.reject(new Error('SFTP read: connection lost'));
      return Promise.resolve();
    },
  });
  assertEquals(result, { loops: 2, stoppedBy: 'error', error: 'Error: SFTP read: connection lost' });
  assertEquals(n, 3, 'no step after the error');
});

// ---------------------------------------------------------------------------
// The budget
// ---------------------------------------------------------------------------

Deno.test('resolveRunBudget: default, override, and refusal outside the lock-safe range', () => {
  assertEquals(resolveRunBudget(undefined), 55_000);
  assertEquals(resolveRunBudget(''), 55_000);
  assertEquals(resolveRunBudget('70000'), 70_000); // the T23 overlap test value
  assertEquals(resolveRunBudget('80000'), 80_000); // 90 s TTL - 10 s margin
  for (const bad of ['80001', '9999', '55s', '55000.5', '-1']) {
    let threw = false;
    try {
      resolveRunBudget(bad);
    } catch {
      threw = true;
    }
    assert(threw, `accepted ${bad}`);
  }
});

// ---------------------------------------------------------------------------
// The step, against a growing file and a fake database
// ---------------------------------------------------------------------------

const enc = new TextEncoder();
const FILE = '2026-09-29_03-09_Aurora.txt';
const CFG: TailConfig = { serverId: 'test-aurora', logDir: 'Logs', maxReadBytes: 262_144, batchRows: 500 };

function posLine(i: number): string {
  const t = 1790636586629 + i * 5_000;
  return `[29-09-26 05:00:00.000] A1 {"k":"pos","t":${t},"u":"admin","x":${12000 + i},"y":11000,"z":0}.\n`;
}

class FakeFile {
  bytes = new Uint8Array(0);
  append(s: string): void {
    const add = enc.encode(s);
    const next = new Uint8Array(this.bytes.length + add.length);
    next.set(this.bytes, 0);
    next.set(add, this.bytes.length);
    this.bytes = next;
  }
}

function fakeSession(file: FakeFile, failReadAt = 0): TailSession & { reads: number } {
  const s = {
    reads: 0,
    list: () => Promise.resolve([{ name: 'chat.txt', isDir: false }, { name: FILE, isDir: false }]),
    stat: () => Promise.resolve({ size: file.bytes.length }),
    readRange: (_p: string, offset: number, length: number) => {
      s.reads++;
      if (s.reads === failReadAt) return Promise.reject(new Error('SFTP read: connection lost'));
      return Promise.resolve(file.bytes.slice(offset, offset + length));
    },
  };
  return s;
}

function fakeDb(): TailDb & { tables: Record<string, Row[]> } {
  const tables: Record<string, Row[]> = {};
  return {
    tables,
    select: <T>() => Promise.resolve((tables['ingest_cursor'] ?? []) as T[]),
    upsert: (table: string, rows: Row[], onConflict: string) => {
      if (table === 'ingest_cursor') tables[table] = rows; // single-row by server_id
      else if (onConflict === '') (tables[table] ??= []).push(...rows); // append-only, like history
      else (tables[table] ??= []).push(...rows);
      return Promise.resolve();
    },
    patch: () => Promise.resolve(),
    delete: () => Promise.resolve(),
    rpc: () => Promise.resolve(null),
  };
}

Deno.test('a run over a growing file writes every history row exactly once, partial lines included', async () => {
  const file = new FakeFile();
  for (let i = 0; i < 3; i++) file.append(posLine(i));
  const session = fakeSession(file);
  const db = fakeDb();
  const clock = new FakeClock(0);

  const target = await findTarget(session, db, CFG);
  assert(target !== null, 'target');
  const totals = emptyTotals();
  await tailStep(session, db, CFG, target!, totals);

  // Between steps the exporter writes one and a half lines, completing the half next time.
  let i = 3;
  let half = '';
  const grow = () => {
    const line = posLine(i++);
    file.append(half + line);
    const nextLine = posLine(i++);
    const cut = Math.floor(nextLine.length / 2);
    file.append(nextLine.slice(0, cut));
    half = nextLine.slice(cut);
  };
  clock.sleep = (ms: number) => {
    clock.t += ms;
    grow();
    return Promise.resolve();
  };

  const result = await runTailLoop({
    deadline: 55_000,
    lastStepAt: 0,
    clock,
    step: () => tailStep(session, db, CFG, target!, totals),
  });
  assertEquals(result.stoppedBy, 'deadline');

  // Every complete line in the file, and only those, is in history once.
  const text = new TextDecoder().decode(file.bytes);
  const complete = text.slice(0, text.lastIndexOf('\n') + 1);
  const completeLines = complete.split('\n').filter((l) => l !== '').length;
  const history = db.tables['player_position_history'] ?? [];
  assertEquals(history.length, completeLines, 'history rows');
  assertEquals(new Set(history.map((r) => r.t)).size, history.length, 'duplicate history rows');
  assertEquals(db.tables['ingest_cursor'][0].byte_offset, enc.encode(complete).length, 'cursor');
  assertEquals(totals.batches, result.loops + 1, 'every step read a batch');
});

Deno.test('an error mid-loop still commits the earlier batches, and the cursor stops at them', async () => {
  const file = new FakeFile();
  file.append(posLine(0));
  const session = fakeSession(file, 3); // the third read fails
  const db = fakeDb();
  const clock = new FakeClock(0);
  let i = 1;
  clock.sleep = (ms: number) => {
    clock.t += ms;
    file.append(posLine(i++));
    return Promise.resolve();
  };

  const target = (await findTarget(session, db, CFG))!;
  const totals = emptyTotals();
  await tailStep(session, db, CFG, target, totals); // read 1: line 0
  const result = await runTailLoop({
    deadline: 55_000,
    lastStepAt: 0,
    clock,
    step: () => tailStep(session, db, CFG, target, totals), // read 2: line 1; read 3 throws
  });

  assertEquals(result.stoppedBy, 'error');
  assertEquals(result.loops, 1);
  const history = db.tables['player_position_history'];
  assertEquals(history.map((r) => r.x), [12000, 12001], 'the two committed batches');
  const committed = enc.encode(posLine(0) + posLine(1)).length;
  assertEquals(db.tables['ingest_cursor'][0].byte_offset, committed, 'cursor at the last committed batch');

  // The next run resumes from the stored cursor and writes line 2 once.
  const next = fakeSession(file);
  const target2 = (await findTarget(next, db, CFG))!;
  await tailStep(next, db, CFG, target2, emptyTotals());
  assertEquals(db.tables['player_position_history'].map((r) => r.x), [12000, 12001, 12002], 'resumed without a gap or a duplicate');
});

Deno.test('the cursor is written only after the batch rows', async () => {
  const file = new FakeFile();
  file.append(posLine(0));
  const order: string[] = [];
  const db = fakeDb();
  const upsert = db.upsert;
  db.upsert = (table, rows, onConflict) => {
    order.push(table);
    return upsert(table, rows, onConflict);
  };
  const session = fakeSession(file);
  const target = (await findTarget(session, db, CFG))!;
  await tailStep(session, db, CFG, target, emptyTotals());
  assertEquals(order.at(-1), 'ingest_cursor');
  assert(order.indexOf('player_position_history') < order.indexOf('ingest_cursor'), 'history before cursor');
});

Deno.test('a zero-zombie tick heartbeat batch calls db.delete on zombie_grid and totals it (T25)', async () => {
  const file = new FakeFile();
  const t = 1790636586629;
  file.append(
    `[29-09-26 05:00:00.000] A1 {"k":"hb","t":${t},"src":"tick","st":{"game":{"zombies-loaded":0}}}.\n`,
  );
  const session = fakeSession(file);
  const db = fakeDb();
  const deletes: string[] = [];
  const del = db.delete;
  db.delete = (path: string) => {
    deletes.push(path);
    return del(path);
  };
  const target = (await findTarget(session, db, CFG))!;
  const totals = emptyTotals();
  await tailStep(session, db, CFG, target, totals);
  assertEquals(deletes, ['zombie_grid?server_id=eq.test-aurora']);
  assertEquals(totals.deletes, 1);
});

Deno.test('each batch records its log-to-row lag against the newest record in it', async () => {
  const file = new FakeFile();
  file.append(posLine(0) + posLine(1)); // t of line 1 = base + 5 s
  const session = fakeSession(file);
  const db = fakeDb();
  const target = (await findTarget(session, db, CFG))!;
  const totals = emptyTotals();
  const base = 1790636586629;
  await tailStep(session, db, CFG, target, totals, () => base + 5_000 + 3_200);
  assertEquals([totals.lagMinMs, totals.lagMaxMs, totals.lagSumMs], [3_200, 3_200, 3_200]);
  file.append(posLine(2)); // t = base + 10 s
  await tailStep(session, db, CFG, target, totals, () => base + 10_000 + 7_000);
  assertEquals([totals.lagMinMs, totals.lagMaxMs, totals.lagSumMs], [3_200, 7_000, 10_200]);
  await tailStep(session, db, CFG, target, totals, () => base + 99_000); // nothing new: no lag sample
  assertEquals(totals.lagSumMs, 10_200);
});

Deno.test('vehicle records go to aurora.upsert_vehicles, before the cursor is written', async () => {
  const file = new FakeFile();
  file.append(
    '[02-10-26 12:00:00.000] A1 {"k":"veh","t":1759406400000,"id":9,"q":4242,"s":"Base.Van","x":10,"y":20,"z":0,"o":"alice"}.\n',
  );
  const order: string[] = [];
  const calls: { fn: string; args: Row }[] = [];
  const db = fakeDb();
  const upsert = db.upsert;
  db.upsert = (table, rows, onConflict) => {
    order.push(table);
    return upsert(table, rows, onConflict);
  };
  db.rpc = (fn, args) => {
    order.push(`rpc:${fn}`);
    calls.push({ fn, args });
    return Promise.resolve(null);
  };

  const session = fakeSession(file);
  const target = (await findTarget(session, db, CFG))!;
  const totals = emptyTotals();
  await tailStep(session, db, CFG, target, totals);

  assertEquals(calls.length, 1);
  assertEquals(calls[0].fn, 'upsert_vehicles');
  assertEquals(calls[0].args.p_server, 'test-aurora');
  assertEquals((calls[0].args.p_rows as Row[])[0].sql_id, 4242);
  assertEquals(totals.rows['upsert_vehicles'], 1);
  assert(order.indexOf('servers') < order.indexOf('rpc:upsert_vehicles'), 'the server row comes first');
  assert(order.indexOf('rpc:upsert_vehicles') < order.indexOf('ingest_cursor'), 'rows before the cursor');
  assertEquals(db.tables['vehicles'], undefined, 'no plain upsert into vehicles');
});

// ---------------------------------------------------------------------------
// 029 not applied yet: the npc writes are optional and must never stall the cursor
// ---------------------------------------------------------------------------

const NPC_LINES =
  '[02-10-26 12:00:00.000] A1 {"k":"npc","t":1759406400000,"id":"squad:1","f":"r","fn":"R","st":"hostile","n":2,"x":1,"y":2,"z":0,"src":"actor","act":"active","enc":"patrol","sen":false}.\n'
  + '[02-10-26 12:00:00.000] A1 {"k":"npcgone","t":1759406400000,"id":"squad:2"}.\n'
  + '[02-10-26 12:00:00.000] A1 {"k":"npco","t":1759406400000,"id":"site:1","x1":1,"y1":2,"x2":3,"y2":4,"hid":false}.\n';

function dbWithoutNpcTables(): TailDb & { tables: Record<string, Row[]> } {
  const db = fakeDb();
  const missing = (what: string) => Promise.reject(new Error(`${what}: 404 {"code":"PGRST205","message":"Could not find the table"}`));
  const upsert = db.upsert;
  db.upsert = (table, rows, onConflict) => table.startsWith('npc_') ? missing(`upsert ${table}`) : upsert(table, rows, onConflict);
  db.delete = (path) => path.startsWith('npc_') ? missing(`delete ${path}`) : Promise.resolve();
  return db;
}

Deno.test('with 029 not applied, npc records are skipped and counted and the cursor still advances', async () => {
  const file = new FakeFile();
  file.append(NPC_LINES + posLine(0));
  const session = fakeSession(file);
  const db = dbWithoutNpcTables();
  const target = (await findTarget(session, db, CFG))!;
  const totals = emptyTotals();
  await tailStep(session, db, CFG, target, totals); // must not throw
  assert(totals.skippedOptional >= 2, `skipped ${totals.skippedOptional}`);
  assertEquals(totals.rows['npc_groups'], undefined, 'nothing counted as written');
  assertEquals(totals.deletes, 0, 'a skipped delete is not counted as a delete');
  assertEquals(db.tables['player_positions']?.length, 1, 'the other kinds in the batch were written');
  assert((db.tables['ingest_cursor']?.[0]?.byte_offset as number) > 0, 'the cursor advanced');
  assertEquals(target.cursor?.byte_offset, db.tables['ingest_cursor'][0].byte_offset);
});

Deno.test('a real failure on an npc write (not a missing table) still stops the step and holds the cursor', async () => {
  const file = new FakeFile();
  file.append(NPC_LINES);
  const session = fakeSession(file);
  const db = fakeDb();
  db.upsert = (table) =>
    table === 'npc_groups' ? Promise.reject(new Error('upsert npc_groups: 500 boom')) : Promise.resolve();
  const target = (await findTarget(session, db, CFG))!;
  let threw = false;
  try {
    await tailStep(session, db, CFG, target, emptyTotals());
  } catch {
    threw = true;
  }
  assert(threw, 'a 500 is a failure');
  assertEquals(db.tables['ingest_cursor'], undefined, 'the cursor was not written');
});

Deno.test('the live tail stamps npc rows with its own clock (seen_at), not the log time', async () => {
  const file = new FakeFile();
  file.append(NPC_LINES);
  const session = fakeSession(file);
  const db = fakeDb();
  const target = (await findTarget(session, db, CFG))!;
  await tailStep(session, db, CFG, target, emptyTotals(), () => Date.UTC(2030, 5, 7, 8, 9, 10));
  assertEquals(db.tables['npc_groups'][0].seen_at, '2030-06-07T08:09:10.000Z');
  assertEquals(db.tables['npc_outposts'][0].seen_at, '2030-06-07T08:09:10.000Z');
  assert(db.tables['npc_groups'][0].t !== db.tables['npc_groups'][0].seen_at, 't is still the log time');
});

Deno.test('with 029 applied, npc rows and gone deletes are written and counted', async () => {
  const file = new FakeFile();
  file.append(NPC_LINES);
  const session = fakeSession(file);
  const db = fakeDb();
  const deletes: string[] = [];
  db.delete = (path) => {
    deletes.push(path);
    return Promise.resolve();
  };
  const target = (await findTarget(session, db, CFG))!;
  const totals = emptyTotals();
  await tailStep(session, db, CFG, target, totals);
  assertEquals(totals.skippedOptional, 0);
  assertEquals(totals.rows['npc_groups'], 1);
  assertEquals(totals.rows['npc_outposts'], 1);
  assertEquals(deletes.length, 1);
  assert(deletes[0].startsWith('npc_groups?'), deletes[0]);
  assertEquals(totals.deletes, 1);
});

// ---------------------------------------------------------------------------
// Worlds (032, T48): register before writing, tag every row, hold the cursor on failure
// ---------------------------------------------------------------------------

const WORLD_T = 1790636586629;
function worldLine(w: string, extra = ''): string {
  return `[29-09-26 05:00:00.000] A1 {"k":"world","t":${WORLD_T},"w":"${w}"${extra}}.\n`;
}
const W_NEW = '3f2b8c1e-9a4d-4e6f-b7a2-0c5d1e8f9a3b';

/** A fake database that records every write in order and answers register_world from `answer`. */
function worldDb(answer: (args: Row) => Promise<unknown>) {
  const db = fakeDb();
  const order: string[] = [];
  const rpcs: { fn: string; args: Row }[] = [];
  const upsert = db.upsert;
  db.upsert = (table, rows, onConflict) => {
    order.push(table);
    return upsert(table, rows, onConflict);
  };
  db.rpc = (fn, args) => {
    order.push(`rpc:${fn}`);
    rpcs.push({ fn, args });
    return fn === 'register_world' ? answer(args) : Promise.resolve(null);
  };
  return Object.assign(db, { order, rpcs });
}

function enabled(current: string | null): WorldState {
  return { enabled: true, currentWorldId: current, events: [], note: null };
}

Deno.test('worlds: a batch with a world record registers it before any data row, and tags the batch with the answer', async () => {
  const file = new FakeFile();
  // The position comes BEFORE the world record in the file: the whole batch still gets the new world.
  file.append(posLine(0) + worldLine(W_NEW, ',"wn":true,"wa":0.2,"ws":1790636500000'));
  const session = fakeSession(file);
  const db = worldDb(() => Promise.resolve({ world_id: 'w2', status: 'current', switched: true }));
  const worlds = enabled('w1');
  const target = (await findTarget(session, db, CFG))!;
  await tailStep(session, db, CFG, target, emptyTotals(), Date.now, worlds);

  const reg = db.order.indexOf('rpc:register_world');
  assert(reg >= 0, 'register_world called');
  // Only the bare server row (the worlds FK) may precede it.
  assertEquals(db.order.slice(0, reg), ['servers'], 'writes before register_world');
  assertEquals(db.tables['servers'][0], { id: 'test-aurora' }, 'the pre-registration server row is the bare id');
  for (const t of ['players', 'player_positions', 'player_position_history']) {
    assert(db.order.indexOf(t) > reg, `${t} after register_world`);
    for (const r of db.tables[t]) assertEquals(r.world_id, 'w2', `${t} tagged with the answer`);
  }
  assertEquals(db.rpcs[0].args, {
    p_server: 'test-aurora', p_exporter_world_id: W_NEW, p_new: true, p_world_age_hours: 0.2, p_started_ms: 1790636500000,
  });
  assertEquals(worlds.currentWorldId, 'w2');
  assertEquals(worlds.events.map((e) => [e.worldId, e.switched]), [['w2', true]]);
  assertEquals(db.order.at(-1), 'ingest_cursor');
});

Deno.test('worlds: the next batch without a record keeps the registered world, and does not call register_world again', async () => {
  const file = new FakeFile();
  file.append(worldLine(W_NEW) + posLine(0));
  const session = fakeSession(file);
  const db = worldDb(() => Promise.resolve({ world_id: 'w5', status: 'current', switched: false, adopted: true }));
  const worlds = enabled(null);
  const target = (await findTarget(session, db, CFG))!;
  await tailStep(session, db, CFG, target, emptyTotals(), Date.now, worlds);
  file.append(posLine(1));
  const before = db.tables['player_position_history'].length;
  await tailStep(session, db, CFG, target, emptyTotals(), Date.now, worlds);
  const second = db.tables['player_position_history'].slice(before);
  assertEquals(second.length, 1);
  assertEquals(second[0].world_id, 'w5');
  assertEquals(db.rpcs.filter((c) => c.fn === 'register_world').length, 1);
  assertEquals(worlds.events[0].adopted, true);
});

Deno.test('worlds: a failing register_world stops the step before any data row and before the cursor', async () => {
  const file = new FakeFile();
  file.append(posLine(0) + worldLine(W_NEW));
  const session = fakeSession(file);
  const db = worldDb(() => Promise.reject(new Error('rpc register_world: 500 boom')));
  const worlds = enabled('w1');
  const target = (await findTarget(session, db, CFG))!;
  let threw = false;
  try {
    await tailStep(session, db, CFG, target, emptyTotals(), Date.now, worlds);
  } catch {
    threw = true;
  }
  assert(threw, 'the step throws');
  assertEquals(db.tables['ingest_cursor'], undefined, 'the cursor was not written');
  assertEquals(db.tables['player_position_history'], undefined, 'no data row was written');
  assertEquals(target.cursor, null, 'the in-memory cursor did not move');
  assertEquals(worlds.currentWorldId, 'w1');
});

Deno.test('worlds: a missing register_world disables worlds and the batch still writes, untagged', async () => {
  const file = new FakeFile();
  file.append(worldLine(W_NEW) + posLine(0));
  const session = fakeSession(file);
  const db = worldDb(() => Promise.reject(new Error('rpc register_world: 404 {"code":"PGRST202","message":"Could not find the function"}')));
  const worlds = enabled('w1');
  const target = (await findTarget(session, db, CFG))!;
  await tailStep(session, db, CFG, target, emptyTotals(), Date.now, worlds);
  assertEquals(worlds.enabled, false);
  for (const t of ['players', 'player_positions', 'player_position_history']) {
    for (const r of db.tables[t]) assert(!('world_id' in r), `${t} carries no world key`);
  }
  assert((db.tables['ingest_cursor']?.[0]?.byte_offset as number) > 0, 'the cursor advanced');
});

Deno.test('worlds: disabled or absent, the step sends what it sent before 032 (no RPC, no world key)', async () => {
  for (const worlds of [undefined, disabledWorlds()]) {
    const file = new FakeFile();
    file.append(worldLine(W_NEW) + posLine(0));
    const session = fakeSession(file);
    const db = worldDb(() => Promise.resolve({ world_id: 'w9', status: 'current', switched: true }));
    const target = (await findTarget(session, db, CFG))!;
    const totals = emptyTotals();
    await tailStep(session, db, CFG, target, totals, Date.now, worlds);
    assertEquals(db.rpcs.length, 0, 'no register_world');
    for (const rows of Object.values(db.tables)) {
      for (const r of rows) assert(!('world_id' in r), 'no world key');
    }
    assertEquals(totals.kinds['world'], 1, 'the record is still counted');
  }
});

Deno.test('worlds: enabled with no current world and no record sends no world key (NULL stays current)', async () => {
  const file = new FakeFile();
  file.append(posLine(0));
  const session = fakeSession(file);
  const db = worldDb(() => Promise.resolve({ world_id: 'w9', status: 'current', switched: true }));
  const target = (await findTarget(session, db, CFG))!;
  await tailStep(session, db, CFG, target, emptyTotals(), Date.now, enabled(null));
  assertEquals(db.rpcs.length, 0);
  for (const r of db.tables['player_position_history']) assert(!('world_id' in r), 'no world_id: null either');
});
