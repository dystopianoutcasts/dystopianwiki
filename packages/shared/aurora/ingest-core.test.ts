// Run with: deno test packages/shared/aurora/ingest-core.test.ts
import {
  buildHealthRow,
  buildHealthRows,
  buildPlan,
  buildSavedPlayerRows,
  chunk,
  isHealthHeartbeat,
  ONLINE_WINDOW_MS,
  planRead,
  type TableUpsert,
} from './ingest-core.ts';
import type { AuroraRecord, HbRecord } from './parser.ts';

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
    { k: 'zone', t: 1, kind: 'nonpvp', ti: 'Town', x1: 0, y1: 0 },
    { k: 'zone', t: 2, kind: 'nonpvp', ti: 'Town', x1: 0, y1: 0 },
    { k: 'zgrid', t: 1, cx: 1, cy: 1, c: 5 },
    { k: 'zgrid', t: 2, cx: 1, cy: 1, c: 9 },
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
    { k: 'zone', t: 1, kind: 'nonpvp', ti: 'Town', x1: 0, y1: 0 },
    { k: 'zone', t: 1, kind: 'nonpvp', ti: 'Town', x1: 500, y1: 500 },
  ];
  assertEquals(table(buildPlan(recs, SERVER).upserts, 'zones')?.rows.length, 2);
});

Deno.test('on_conflict targets match the schema primary keys', () => {
  const recs: AuroraRecord[] = [
    { k: 'pos', t: 1, u: 'a', x: 1, y: 1 },
    { k: 'veh', t: 1, id: 1, x: 1, y: 1 },
    { k: 'sh', t: 1, id: 'S', x: 0, y: 0, w: 1, h: 1 },
    { k: 'zone', t: 1, kind: 'k', ti: 't', x1: 0, y1: 0 },
    { k: 'zgrid', t: 1, cx: 0, cy: 0, c: 1 },
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

Deno.test('the launch stamp comes from the file name, and boot sets no game version', () => {
  const recs: AuroraRecord[] = [
    { k: 'boot', t: 10, v: '0.0.0', schema: 1, players: 0, apis: { getOnlinePlayers: true } },
  ];
  const withStamp = buildPlan(recs, SERVER, { launchStamp: '2026-09-28_21-10' }).upserts[0].rows[0];
  assertEquals(withStamp.last_launch_stamp, '2026-09-28_21-10');
  assertEquals('game_version' in withStamp, false, 'the exporter emits no game version yet');

  const without = buildPlan(recs, SERVER).upserts[0].rows[0];
  assertEquals('last_launch_stamp' in without, false, 'no stamp when the caller has none');
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

// --- hb -> health_samples --------------------------------------------------

/** A revision 2 tick heartbeat with every mapped key plus the two traps. */
function tickHb(over: Partial<HbRecord> = {}): HbRecord {
  return {
    k: 'hb',
    t: 1790629892835,
    players: 2,
    src: 'tick',
    st: {
      perf: {
        'fps': 104,
        'min-update-period': 98,
        'max-update-period': 131,
        'avg-update-period': 5,
        'memory-used': 3000000000,
        'memory-max': 8000000000,
        'Pool<IsoGridSquare>': 512,
        'Pool<Vector2>': 9000,
      },
      game: {
        'players': 3,
        'zombies-total': 12000,
        'zombies-loaded': 800,
        'zombies-simulated': 120,
        'zombies-culled': 40,
        'loaded-cells': 36,
      },
      net: { 'sent-bps': 4096, 'received-bps': 2048, 'Pool<Packet>': 12 },
    },
    ...over,
  };
}

type Raw = { src?: string; perf?: Record<string, number>; game?: Record<string, number>; net?: Record<string, number> };

Deno.test('a tick heartbeat maps every named column from the three tables', () => {
  const row = buildHealthRow(tickHb(), SERVER);
  assertEquals(row.server_id, SERVER);
  assertEquals(row.t, '2026-09-28T21:11:32.835Z');
  assertEquals(row.tick_ms, 104, 'perf.fps is the tick DURATION');
  assertEquals(row.tick_min_ms, 98);
  assertEquals(row.tick_max_ms, 131);
  assertEquals(row.memory_used, 3000000000);
  assertEquals(row.memory_max, 8000000000);
  assertEquals(row.zombies_total, 12000);
  assertEquals(row.zombies_loaded, 800);
  assertEquals(row.zombies_simulated, 120);
  assertEquals(row.zombies_culled, 40);
  assertEquals(row.loaded_cells, 36);
  assertEquals(row.sent_bps, 4096);
  assertEquals(row.received_bps, 2048);
});

Deno.test('avg-update-period is never promoted to a column, only kept in raw', () => {
  const row = buildHealthRow(tickHb(), SERVER);
  for (const col of Object.keys(row)) {
    assert(!/avg/i.test(col), `no column may be derived from avg-update-period, found ${col}`);
  }
  assertEquals((row.raw as Raw).perf?.['avg-update-period'], 5, 'raw keeps it for forensics');
});

Deno.test('Pool< keys are dropped from raw but every other key survives', () => {
  const raw = buildHealthRow(tickHb(), SERVER).raw as Raw;
  const allKeys = [...Object.keys(raw.perf ?? {}), ...Object.keys(raw.game ?? {}), ...Object.keys(raw.net ?? {})];
  assertEquals(allKeys.some((k) => k.startsWith('Pool<')), false, 'pool counters must not be stored');
  assertEquals(raw.perf?.fps, 104);
  assertEquals(raw.net?.['sent-bps'], 4096);
  assertEquals(raw.src, 'tick');
});

Deno.test('the online count prefers the game table over the top-level field', () => {
  assertEquals(buildHealthRow(tickHb(), SERVER).players, 3, 'st.game.players wins');
  assertEquals(buildHealthRow(tickHb({ st: { perf: {} } }), SERVER).players, 2, 'falls back to hb.players');
});

Deno.test('only tick heartbeats become health samples; gametime ones are skipped', () => {
  assertEquals(isHealthHeartbeat(tickHb()), true);
  assertEquals(isHealthHeartbeat(tickHb({ src: 'gametime' })), false);
  const rows = buildHealthRows([tickHb(), tickHb({ t: 1790629902835, src: 'gametime' })], SERVER);
  assertEquals(rows.length, 1);
  assertEquals(rows[0].t, '2026-09-28T21:11:32.835Z');
});

Deno.test('a v0.0 heartbeat with no src and no st still yields a players-only sample', () => {
  const hb: HbRecord = { k: 'hb', t: 1790629892835, players: 0 };
  assertEquals(isHealthHeartbeat(hb), true, 'pre-revision-2 logs on the host must still count');
  const row = buildHealthRow(hb, SERVER);
  assertEquals(row.players, 0);
  assertEquals('tick_ms' in row, false, 'no table, no tick figure - never zero');
  assertEquals(row.raw, {}, 'nothing to keep');
});

Deno.test('a malformed table value leaves its column unset rather than NaN', () => {
  const row = buildHealthRow(tickHb({ st: { perf: { fps: Number.NaN } } }), SERVER);
  assertEquals('tick_ms' in row, false);
});

Deno.test('health rows are deduped on t, the primary key', () => {
  const rows = buildHealthRows([tickHb(), tickHb({ players: 9 })], SERVER);
  assertEquals(rows.length, 1);
});

Deno.test('buildPlan places health_samples right after servers', () => {
  const names = buildPlan([tickHb(), { k: 'pos', t: 1790629892835, u: 'a', x: 1, y: 2 }], SERVER).upserts.map((u) => u.table);
  assertEquals(names[0], 'servers');
  assertEquals(names[1], 'health_samples');
  assertEquals(table(buildPlan([tickHb()], SERVER).upserts, 'health_samples')?.onConflict, 'server_id,t');
});

// --- players.online reconcile ----------------------------------------------

const NOW = 1790629892835;

Deno.test('a position inside the online window marks the player online, an older one offline', () => {
  const recs: AuroraRecord[] = [
    { k: 'pos', t: NOW, u: 'fresh', x: 1, y: 1 },
    { k: 'pos', t: NOW - ONLINE_WINDOW_MS - 1, u: 'stale', x: 1, y: 1 },
  ];
  const rows = table(buildPlan(recs, SERVER).upserts, 'players')?.rows ?? [];
  assertEquals(rows.find((r) => r.username === 'fresh')?.online, true);
  assertEquals(rows.find((r) => r.username === 'stale')?.online, false);
});

Deno.test('"now" defaults to the newest record, so a replayed old bundle is not marked offline', () => {
  const recs: AuroraRecord[] = [{ k: 'pos', t: 1000, u: 'a', x: 1, y: 1 }];
  assertEquals(table(buildPlan(recs, SERVER).upserts, 'players')?.rows[0].online, true);
  assertEquals(
    table(buildPlan(recs, SERVER, { now: 1000 + ONLINE_WINDOW_MS + 1 }).upserts, 'players')?.rows[0].online,
    false,
    'an explicit now is honoured',
  );
});

Deno.test('a heartbeat reporting 0 players, newer than every position, marks everyone offline', () => {
  const recs: AuroraRecord[] = [
    { k: 'pos', t: NOW - 1000, u: 'a', x: 1, y: 1 },
    { k: 'hb', t: NOW, players: 0, src: 'tick' },
  ];
  const plan = buildPlan(recs, SERVER);
  assertEquals(plan.patches.length, 1);
  assertEquals(plan.patches[0].table, 'players');
  assertEquals(plan.patches[0].body, { online: false });
  assert(plan.patches[0].filter.includes('online=is.true'), 'only flips rows that are online');
  assert(plan.patches[0].filter.includes(`server_id=eq.${SERVER}`), 'scoped to the server');
});

Deno.test('a 0-player heartbeat older than a position does not override it', () => {
  const recs: AuroraRecord[] = [
    { k: 'hb', t: NOW - 1000, players: 0, src: 'tick' },
    { k: 'pos', t: NOW, u: 'a', x: 1, y: 1 },
  ];
  assertEquals(buildPlan(recs, SERVER).patches.length, 0);
});

Deno.test('a heartbeat with players online produces no patch', () => {
  const recs: AuroraRecord[] = [{ k: 'hb', t: NOW, players: 2, src: 'tick' }];
  assertEquals(buildPlan(recs, SERVER).patches.length, 0);
});

// --- players.db rows -------------------------------------------------------

Deno.test('players.db rows are keyed on the account name and store whole squares', () => {
  const rows = buildSavedPlayerRows([
    { username: 'Fanare', name: 'Bob Bingy', x: 11854.4, y: 6602.9 },
    { username: '', name: 'ghost', x: 1, y: 1 },
    { username: 'kitten', name: 'kitten pitten', x: 9987.6, y: 9789.4 },
    { username: 'kitten', name: 'kitten pitten', x: 10000.2, y: 9800.7 },
    { username: 'nan', name: 'x', x: Number.NaN, y: 1 },
  ], SERVER);
  assertEquals(rows.length, 2, 'blank username and NaN coordinates are skipped, duplicates collapse');
  const bob = rows.find((r) => r.username === 'Fanare');
  assertEquals(bob?.display_name, 'Bob Bingy');
  assertEquals(bob?.last_saved_x, 11854);
  assertEquals(bob?.last_saved_y, 6603);
  assertEquals(rows.find((r) => r.username === 'kitten')?.last_saved_x, 10000, 'last occurrence wins');
  assertEquals(
    Object.keys(bob ?? {}).sort(),
    ['display_name', 'last_saved_x', 'last_saved_y', 'server_id', 'username'],
    'must not clobber online, last_seen, linked_user_id or hours_survived',
  );
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

Deno.test('every exporter field name lands in its column (T09 record shapes)', () => {
  const recs: AuroraRecord[] = [
    { k: 'sh', t: 1, id: 7, x: 10, y: 20, w: 5, h: 6, o: 'alice', ti: 'Home', p: ['alice'], lv: 100000, cr: 50000 },
    { k: 'zone', t: 1, kind: 'nonpvp', ti: 'Spawn', x1: 1, y1: 2, x2: 3, y2: 4 },
    { k: 'zgrid', t: 1, cx: 42, cy: 40, c: 17 },
    { k: 'catalogv', t: 1, cv: 'abc' },
    { k: 'catalog', t: 1, ft: 'Base.Axe', dn: 'Axe', cat: 'Weapon', w: 3, cv: 'abc' },
  ];
  const plan = buildPlan(recs, SERVER);
  const sh = table(plan.upserts, 'safehouses')?.rows[0] ?? {};
  assertEquals([sh.id, sh.owner, sh.title, sh.created_at, sh.last_visited], ['7', 'alice', 'Home', '1970-01-01T00:00:50.000Z', '1970-01-01T00:01:40.000Z'], 'sh: numeric id stored as text, cr is created_at');
  const zone = table(plan.upserts, 'zones')?.rows[0] ?? {};
  assertEquals([zone.kind, zone.title, zone.x2, zone.y2], ['nonpvp', 'Spawn', 3, 4], 'zone: kind field');
  const cell = table(plan.upserts, 'zombie_grid')?.rows[0] ?? {};
  assertEquals([cell.cell_x, cell.cell_y, cell.count], [42, 40, 17], 'zgrid: c is count');
  const item = table(plan.upserts, 'item_catalog')?.rows[0] ?? {};
  assertEquals([item.full_type, item.display_name, item.category, item.weight, item.catalog_version], ['Base.Axe', 'Axe', 'Weapon', 3, 'abc'], 'catalog: w is weight');
  assertEquals(plan.upserts.some((u) => u.table === 'catalogv'), false, 'catalogv produces no table rows');
});
