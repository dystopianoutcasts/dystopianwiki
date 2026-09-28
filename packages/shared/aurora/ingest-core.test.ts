// Run with: deno test packages/shared/aurora/ingest-core.test.ts
import {
  buildHealthSample,
  buildPlan,
  chunk,
  planRead,
  type TableUpsert,
} from './ingest-core.ts';
import type { AuroraRecord } from './parser.ts';

function assertEquals<T>(actual: T, expected: T, msg = ''): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} expected ${e} got ${a}`);
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

const SERVER = 'test-aurora';

function table(upserts: TableUpsert[], name: string): TableUpsert | undefined {
  return upserts.find((u) => u.table === name);
}

Deno.test('servers is always first so the foreign keys resolve on a cold database', () => {
  const plan = buildPlan([{ k: 'hb', t: 1 }] as AuroraRecord[], SERVER);
  assertEquals(plan.upserts[0].table, 'servers');
  assertEquals(plan.upserts[0].rows[0].id, SERVER);
});

Deno.test('players is upserted before player_positions', () => {
  const recs: AuroraRecord[] = [{ k: 'pos', t: 1, u: 'a', x: 1, y: 2 }];
  const names = buildPlan(recs, SERVER).upserts.map((u) => u.table);
  assert(
    names.indexOf('players') < names.indexOf('player_positions'),
    `players must precede player_positions, got ${names.join(',')}`,
  );
});

Deno.test('repeated positions for one player collapse to the newest', () => {
  const recs: AuroraRecord[] = [
    { k: 'pos', t: 1000, u: 'a', x: 1, y: 1 },
    { k: 'pos', t: 3000, u: 'a', x: 3, y: 3 },
    { k: 'pos', t: 2000, u: 'a', x: 2, y: 2 },
    { k: 'pos', t: 1500, u: 'b', x: 9, y: 9 },
  ];
  const plan = buildPlan(recs, SERVER);
  const positions = table(plan.upserts, 'player_positions');
  assertEquals(positions?.rows.length, 2, 'one row per player');
  const a = positions?.rows.find((r) => r.username === 'a');
  assertEquals(a?.x, 3, 'newest sample wins');
});

Deno.test('history keeps every sample even when positions collapse', () => {
  const recs: AuroraRecord[] = [
    { k: 'pos', t: 1000, u: 'a', x: 1, y: 1 },
    { k: 'pos', t: 2000, u: 'a', x: 2, y: 2 },
    { k: 'pos', t: 3000, u: 'a', x: 3, y: 3 },
  ];
  const plan = buildPlan(recs, SERVER);
  assertEquals(table(plan.upserts, 'player_position_history')?.rows.length, 3);
  assertEquals(table(plan.upserts, 'player_positions')?.rows.length, 1);
});

Deno.test('the players upsert sends only the columns it owns', () => {
  const plan = buildPlan([{ k: 'pos', t: 1, u: 'a', x: 1, y: 2 }] as AuroraRecord[], SERVER);
  const row = table(plan.upserts, 'players')?.rows[0] ?? {};
  assertEquals(
    Object.keys(row).sort(),
    ['last_seen', 'online', 'server_id', 'username'],
    'must not clobber hours_survived, access_level or linked_user_id',
  );
  assertEquals(row.online, true);
});

Deno.test('every keyed table is deduped', () => {
  const recs: AuroraRecord[] = [
    { k: 'veh', t: 1, id: 7, x: 1, y: 1 },
    { k: 'veh', t: 2, id: 7, x: 2, y: 2 },
    { k: 'sh', t: 1, id: 'SH1', x: 0, y: 0, w: 2, h: 2 },
    { k: 'sh', t: 2, id: 'SH1', x: 0, y: 0, w: 3, h: 3 },
    { k: 'zone', t: 1, kd: 'nonpvp', ti: 'Town', x1: 0, y1: 0 },
    { k: 'zone', t: 2, kd: 'nonpvp', ti: 'Town', x1: 0, y1: 0 },
    { k: 'zgrid', t: 1, cx: 1, cy: 1, n: 5 },
    { k: 'zgrid', t: 2, cx: 1, cy: 1, n: 9 },
    { k: 'catalog', t: 1, ft: 'Base.Axe' },
    { k: 'catalog', t: 2, ft: 'Base.Axe' },
  ];
  const plan = buildPlan(recs, SERVER);
  for (const name of ['vehicles', 'safehouses', 'zones', 'zombie_grid', 'item_catalog']) {
    assertEquals(table(plan.upserts, name)?.rows.length, 1, `${name} must dedupe`);
  }
  assertEquals(table(plan.upserts, 'vehicles')?.rows[0].x, 2, 'newest vehicle sample wins');
  assertEquals(table(plan.upserts, 'zombie_grid')?.rows[0].count, 9);
});

Deno.test('zones with the same title but different origins are distinct keys', () => {
  const recs: AuroraRecord[] = [
    { k: 'zone', t: 1, kd: 'nonpvp', ti: 'Town', x1: 0, y1: 0 },
    { k: 'zone', t: 1, kd: 'nonpvp', ti: 'Town', x1: 500, y1: 500 },
  ];
  assertEquals(table(buildPlan(recs, SERVER).upserts, 'zones')?.rows.length, 2);
});

Deno.test('on_conflict targets match the schema primary keys', () => {
  const recs: AuroraRecord[] = [
    { k: 'pos', t: 1, u: 'a', x: 1, y: 1 },
    { k: 'veh', t: 1, id: 1, x: 1, y: 1 },
    { k: 'sh', t: 1, id: 'S', x: 0, y: 0, w: 1, h: 1 },
    { k: 'zone', t: 1, kd: 'k', ti: 't', x1: 0, y1: 0 },
    { k: 'zgrid', t: 1, cx: 0, cy: 0, n: 1 },
    { k: 'catalog', t: 1, ft: 'Base.X' },
  ];
  const plan = buildPlan(recs, SERVER);
  assertEquals(table(plan.upserts, 'players')?.onConflict, 'server_id,username');
  assertEquals(table(plan.upserts, 'player_positions')?.onConflict, 'server_id,username');
  assertEquals(table(plan.upserts, 'vehicles')?.onConflict, 'server_id,vehicle_id');
  assertEquals(table(plan.upserts, 'safehouses')?.onConflict, 'server_id,id');
  assertEquals(table(plan.upserts, 'zones')?.onConflict, 'server_id,kind,title,x1,y1');
  assertEquals(table(plan.upserts, 'zombie_grid')?.onConflict, 'server_id,cell_x,cell_y');
  assertEquals(table(plan.upserts, 'item_catalog')?.onConflict, 'server_id,full_type');
});

Deno.test('server_id comes from the caller, never from the log', () => {
  const plan = buildPlan([{ k: 'pos', t: 1, u: 'a', x: 1, y: 2 }] as AuroraRecord[], 'other');
  for (const upsert of plan.upserts) {
    for (const row of upsert.rows) {
      const id = row.server_id ?? row.id;
      assertEquals(id, 'other', `${upsert.table} must carry the caller's server id`);
    }
  }
});

Deno.test('boot supplies the launch stamp and version', () => {
  const recs: AuroraRecord[] = [
    { k: 'boot', t: 10, gv: '42.20.4', ls: '2026-09-28_03-06' },
    { k: 'boot', t: 20, gv: '42.20.5', ls: '2026-09-28_04-00' },
  ];
  const row = buildPlan(recs, SERVER).upserts[0].rows[0];
  assertEquals(row.game_version, '42.20.5', 'newest boot wins');
  assertEquals(row.last_launch_stamp, '2026-09-28_04-00');
});

Deno.test('link records are routed to the RPC, not to an upsert', () => {
  const recs: AuroraRecord[] = [{ k: 'link', t: 1, c: 'ABCD1234', u: 'a' }];
  const plan = buildPlan(recs, SERVER);
  assertEquals(plan.links.length, 1);
  assertEquals(plan.upserts.some((u) => u.table === 'link_codes'), false);
});

Deno.test('timestamps become ISO strings', () => {
  const plan = buildPlan([{ k: 'pos', t: 0, u: 'a', x: 1, y: 2 }] as AuroraRecord[], SERVER);
  assertEquals(table(plan.upserts, 'player_positions')?.rows[0].t, '1970-01-01T00:00:00.000Z');
});

// --- health sample ---------------------------------------------------------

Deno.test('health sample promotes the mapped keys and keeps everything in raw', () => {
  const stats = {
    'zombies-total': 12000,
    'zombies-loaded': 800,
    'zombies-simulated': 120,
    'zombies-culled': 40,
    'loaded-cells': 36,
    'memory-used': 3000000000,
    'memory-max': 8000000000,
    'avg-update-period': 16.7,
    'sent-bps': 4096,
    'received-bps': 2048,
    'pool-something-obscure': 7,
  };
  const row = buildHealthSample(SERVER, new Date(0), stats, 5);
  assertEquals(row.zombies_total, 12000);
  assertEquals(row.loaded_cells, 36);
  assertEquals(row.avg_update_period_ms, 16.7);
  assertEquals(row.received_bps, 2048);
  assertEquals(row.players, 5, 'roster count wins over any stats key');
  assertEquals((row.raw as Record<string, number>)['pool-something-obscure'], 7);
});

Deno.test('the roster count wins even when the stats block disagrees', () => {
  const row = buildHealthSample(SERVER, new Date(0), { players: 99 }, 3);
  assertEquals(row.players, 3);
  assertEquals((row.raw as Record<string, number>).players, 99, 'raw still records it');
});

Deno.test('missing stats leave their columns unset rather than zero', () => {
  const row = buildHealthSample(SERVER, new Date(0), {}, 0);
  assertEquals('zombies_total' in row, false);
});

// --- cursor / rotation -----------------------------------------------------

Deno.test('a fresh cursor starts at zero', () => {
  assertEquals(planRead(null, 'a_Aurora.txt', 500, 1000), { offset: 0, length: 500, reset: true });
});

Deno.test('an unchanged file resumes from the cursor', () => {
  const w = planRead({ file_name: 'a_Aurora.txt', byte_offset: 200 }, 'a_Aurora.txt', 500, 1000);
  assertEquals(w, { offset: 200, length: 300, reset: false });
});

Deno.test('rotation (file shorter than the cursor) restarts at zero', () => {
  const w = planRead({ file_name: 'a_Aurora.txt', byte_offset: 9000 }, 'a_Aurora.txt', 120, 1000);
  assertEquals(w, { offset: 0, length: 120, reset: true });
});

Deno.test('a new file name restarts at zero', () => {
  const w = planRead({ file_name: 'a_Aurora.txt', byte_offset: 9000 }, 'b_Aurora.txt', 700, 1000);
  assertEquals(w, { offset: 0, length: 700, reset: true });
});

Deno.test('the read is capped at maxBytes', () => {
  const w = planRead({ file_name: 'a', byte_offset: 0 }, 'a', 10_000_000, 1024);
  assertEquals(w.length, 1024);
});

Deno.test('nothing new to read yields a zero-length window', () => {
  const w = planRead({ file_name: 'a', byte_offset: 500 }, 'a', 500, 1000);
  assertEquals(w, { offset: 500, length: 0, reset: false });
});

// --- batching --------------------------------------------------------------

Deno.test('chunk splits on the batch size and keeps order', () => {
  assertEquals(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assertEquals(chunk([], 500), []);
});

Deno.test('chunk rejects a non-positive size instead of looping forever', () => {
  let threw = false;
  try {
    chunk([1], 0);
  } catch {
    threw = true;
  }
  assert(threw, 'chunk(rows, 0) must throw');
});
