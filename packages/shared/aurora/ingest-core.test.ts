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
  type IngestPlan,
  type TableUpsert,
} from './ingest-core.ts';
import { parseLineDetailed } from './parser.ts';
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

/** The rows the plan sends to aurora.upsert_vehicles (028). */
function vehicleRows(plan: IngestPlan): Record<string, unknown>[] {
  const call = plan.rpcs.find((r) => r.fn === 'upsert_vehicles');
  return ((call?.args.p_rows as Record<string, unknown>[] | undefined) ?? []);
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

Deno.test('hours survived and access level are stored when the record carries them', () => {
  const recs: AuroraRecord[] = [
    { k: 'pos', t: 1, u: 'a', x: 1, y: 2, hs: 41.5, al: 'admin', n: 'Ann', id: 3 },
    { k: 'pos', t: 1, u: 'b', x: 1, y: 2, hs: 7, al: '' },
    { k: 'pos', t: 1, u: 'c', x: 1, y: 2 },
    { k: 'pos', t: 1, u: 'd', x: 1, y: 2, hs: -1 },
    { k: 'pos', t: 1, u: 'e', x: 1, y: 2, hs: Number.NaN },
  ];
  const players = buildPlan(recs, SERVER).upserts.filter((u) => u.table === 'players');
  assertEquals(players.length, 2, 'rows with and without stats go in separate upserts');
  for (const u of players) {
    const keys = u.rows.map((r) => Object.keys(r).sort().join(','));
    assertEquals(new Set(keys).size, 1, 'every row of one upsert has the same keys');
  }
  const all = players.flatMap((u) => u.rows);
  const a = all.find((r) => r.username === 'a');
  assertEquals(a?.hours_survived, 41.5);
  assertEquals(a?.access_level, 'admin');
  assertEquals(all.find((r) => r.username === 'b')?.access_level, null, 'a blank level is stored as null');
  for (const u of ['c', 'd', 'e']) {
    const row = all.find((r) => r.username === u) ?? {};
    assert(!('hours_survived' in row), `${u}: a missing or invalid hs must not overwrite the stored value`);
    assert(!('access_level' in row), `${u}: nor the access level`);
  }
  assert(!('display_name' in (a ?? {})), 'the display name stays owned by players.db');
});

Deno.test('the vehicle script name is read from the exporter key, and from the old one', () => {
  const recs: AuroraRecord[] = [
    { k: 'veh', t: 1, id: 1, x: 1, y: 1, s: 'Base.CarNormal', ty: 'Normal' },
    { k: 'veh', t: 1, id: 2, x: 1, y: 1, sc: 'Base.Van' },
    { k: 'veh', t: 1, id: 3, x: 1, y: 1 },
  ];
  const rows = vehicleRows(buildPlan(recs, SERVER));
  assertEquals(rows.find((r) => r.vehicle_id === 1)?.script_name, 'Base.CarNormal');
  assertEquals(rows.find((r) => r.vehicle_id === 2)?.script_name, 'Base.Van');
  assertEquals(rows.find((r) => r.vehicle_id === 3)?.script_name, null);
});

Deno.test('a real exporter 0.2 vehicle line keeps its script name end to end', () => {
  const parsed = parseLineDetailed(
    '[02-10-26 12:00:00.000] [ 0] A1 {"k":"veh","t":1759406400000,"id":9,"s":"Base.PickUpTruck","ty":"PickUp","x":10.5,"y":20.5,"z":0,"d":null}.',
  );
  assert(parsed.ok, 'the line parses');
  if (!parsed.ok) return;
  const rows = vehicleRows(buildPlan([parsed.record], SERVER));
  assertEquals(rows[0]?.script_name, 'Base.PickUpTruck');
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
  for (const name of ['safehouses', 'zones', 'zombie_grid', 'item_catalog']) {
    assertEquals(table(plan.upserts, name)?.rows.length, 1, `${name} must dedupe`);
  }
  assertEquals(vehicleRows(plan).length, 1, 'vehicles must dedupe');
  assertEquals(vehicleRows(plan)[0].x, 2, 'newest vehicle sample wins');
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
  assertEquals(table(plan.upserts, 'vehicles'), undefined, 'vehicles go through upsert_vehicles, not a plain upsert');
  assertEquals(table(plan.upserts, 'safehouses')?.onConflict, 'server_id,id');
  assertEquals(table(plan.upserts, 'zones')?.onConflict, 'server_id,kind,title,x1,y1');
  assertEquals(table(plan.upserts, 'zombie_grid')?.onConflict, 'server_id,cell_x,cell_y');
  assertEquals(table(plan.upserts, 'item_catalog')?.onConflict, 'server_id,full_type');
});

// --- vehicles: persistent id and claim owner (028) ---------------------------

Deno.test('a record with q keys the row on the save id and carries the claim owner', () => {
  const plan = buildPlan([{ k: 'veh', t: 5, id: 3, q: 4242, x: 1, y: 2, s: 'Base.Van', o: 'alice' }], SERVER);
  const call = plan.rpcs.find((r) => r.fn === 'upsert_vehicles');
  assertEquals(call?.args.p_server, SERVER);
  const row = vehicleRows(plan)[0];
  assertEquals(row.sql_id, 4242);
  assertEquals(row.claimed_by, 'alice');
  assertEquals(row.vehicle_id, 3);
});

Deno.test('an empty owner is a release: claimed_by is null, never an empty string', () => {
  const rows = vehicleRows(buildPlan([{ k: 'veh', t: 5, id: 3, q: 4242, x: 1, y: 2, o: '' }], SERVER));
  assertEquals(rows[0].claimed_by, null);
});

Deno.test('a record with q and no o is unclaimed', () => {
  const rows = vehicleRows(buildPlan([{ k: 'veh', t: 5, id: 3, q: 4242, x: 1, y: 2 }], SERVER));
  assertEquals(rows[0].claimed_by, null);
});

Deno.test('an old record with neither q nor o still maps, with a null sql_id and no claim', () => {
  const rows = vehicleRows(buildPlan([{ k: 'veh', t: 5, id: 3, x: 1, y: 2, s: 'Base.Van' }], SERVER));
  assertEquals(rows[0].sql_id, null);
  assertEquals(rows[0].claimed_by, null);
  assertEquals(rows[0].vehicle_id, 3);
});

Deno.test('an old record cannot claim a car, whatever o it carries', () => {
  const rows = vehicleRows(buildPlan([{ k: 'veh', t: 5, id: 3, x: 1, y: 2, o: 'mallory' }], SERVER));
  assertEquals(rows[0].claimed_by, null);
});

Deno.test('a q that is not a positive whole number is treated as absent', () => {
  const recs: AuroraRecord[] = [
    { k: 'veh', t: 1, id: 1, q: 0, x: 1, y: 1 },
    { k: 'veh', t: 1, id: 2, q: -7, x: 1, y: 1 },
    { k: 'veh', t: 1, id: 3, q: 1.5, x: 1, y: 1 },
    { k: 'veh', t: 1, id: 4, q: Number.NaN, x: 1, y: 1 },
  ];
  for (const r of vehicleRows(buildPlan(recs, SERVER))) assertEquals(r.sql_id, null, `id ${r.vehicle_id}`);
});

Deno.test('one car under two net ids in a batch (a restart) yields one row, the newest', () => {
  const recs: AuroraRecord[] = [
    { k: 'veh', t: 1, id: 5, q: 100, x: 1, y: 1 },
    { k: 'veh', t: 9, id: 7, q: 100, x: 9, y: 9 },
  ];
  const rows = vehicleRows(buildPlan(recs, SERVER));
  assertEquals(rows.length, 1);
  assertEquals(rows[0].vehicle_id, 7);
  assertEquals(rows[0].x, 9);
});

Deno.test('two cars holding one net id across a restart never share a row', () => {
  const recs: AuroraRecord[] = [
    { k: 'veh', t: 1, id: 5, q: 100, x: 1, y: 1 },
    { k: 'veh', t: 9, id: 5, q: 200, x: 9, y: 9 },
  ];
  const rows = vehicleRows(buildPlan(recs, SERVER));
  assertEquals(rows.length, 1);
  assertEquals(rows[0].sql_id, 200);
});

Deno.test('every vehicle row carries the same fields, as jsonb_to_recordset reads them', () => {
  const recs: AuroraRecord[] = [
    { k: 'veh', t: 1, id: 1, q: 10, x: 1, y: 1, o: 'a' },
    { k: 'veh', t: 1, id: 2, x: 1, y: 1 },
  ];
  const rows = vehicleRows(buildPlan(recs, SERVER));
  assertEquals(Object.keys(rows[0]), Object.keys(rows[1]));
});

Deno.test('a real exporter 0.3 vehicle line keeps q and o end to end', () => {
  const parsed = parseLineDetailed(
    '[02-10-26 12:00:00.000] [ 0] A1 {"k":"veh","t":1759406400000,"id":9,"q":4242,"s":"Base.PickUpTruck","ty":"PickUp","x":10.5,"y":20.5,"z":0,"o":"alice"}.',
  );
  assert(parsed.ok, 'the line parses');
  if (!parsed.ok) return;
  const row = vehicleRows(buildPlan([parsed.record], SERVER))[0];
  assertEquals(row.sql_id, 4242);
  assertEquals(row.claimed_by, 'alice');
});

Deno.test('a batch with no vehicles makes no vehicle call', () => {
  assertEquals(buildPlan([{ k: 'pos', t: 1, u: 'a', x: 1, y: 1 }], SERVER).rpcs.length, 0);
});

// --- zombie_grid staleness --------------------------------------------------

function zeroZombieHb(t: number): AuroraRecord {
  return { k: 'hb', t, src: 'tick', st: { game: { 'zombies-loaded': 0 } } } as AuroraRecord;
}

Deno.test('a batch with zgrid records deletes zombie_grid rows older than the newest zgrid t', () => {
  const recs: AuroraRecord[] = [
    { k: 'zgrid', t: 5000, cx: 1, cy: 1, c: 3 },
    { k: 'zgrid', t: 7000, cx: 2, cy: 2, c: 4 },
  ];
  const plan = buildPlan(recs, SERVER);
  assertEquals(plan.deletes.length, 1);
  assertEquals(plan.deletes[0].table, 'zombie_grid');
  assertEquals(plan.deletes[0].filter, `server_id=eq.${SERVER}&t=lt.${encodeURIComponent(toIsoOf(7000))}`);
});

Deno.test('a batch with no zgrid and zombies present deletes nothing', () => {
  const recs: AuroraRecord[] = [
    { k: 'hb', t: 1000, src: 'tick', st: { game: { 'zombies-loaded': 12 } } } as AuroraRecord,
  ];
  assertEquals(buildPlan(recs, SERVER).deletes, []);
  // No heartbeat at all either: still nothing to delete.
  assertEquals(buildPlan([], SERVER).deletes, []);
});

Deno.test('a zero-zombie tick heartbeat with no fresher zgrid clears the whole zombie_grid', () => {
  const recs: AuroraRecord[] = [zeroZombieHb(100_000)];
  const plan = buildPlan(recs, SERVER);
  assertEquals(plan.deletes.length, 1);
  assertEquals(plan.deletes[0].filter, `server_id=eq.${SERVER}`, 'no t filter: every row for this server goes');
});

Deno.test('a zero-zombie heartbeat still clears everything when the only zgrid in the batch is stale (over 90s old)', () => {
  const recs: AuroraRecord[] = [
    { k: 'zgrid', t: 0, cx: 1, cy: 1, c: 5 }, // 100_000 ms before the heartbeat, over the 90s window
    zeroZombieHb(100_000),
  ];
  const plan = buildPlan(recs, SERVER);
  assertEquals(plan.deletes.length, 1);
  assertEquals(plan.deletes[0].filter, `server_id=eq.${SERVER}`, 'the stale zgrid record does not save any row');
});

Deno.test('a zero-zombie heartbeat backs off when a zgrid record inside the 90s window contradicts it', () => {
  const recs: AuroraRecord[] = [
    { k: 'zgrid', t: 20_000, cx: 1, cy: 1, c: 5 }, // 80_000 ms before the heartbeat, inside the 90s window
    zeroZombieHb(100_000),
  ];
  const plan = buildPlan(recs, SERVER);
  assertEquals(plan.deletes.length, 1);
  assertEquals(
    plan.deletes[0].filter,
    `server_id=eq.${SERVER}&t=lt.${encodeURIComponent(toIsoOf(20_000))}`,
    'falls back to the ordinary newest-zgrid-t rule instead of clearing everything',
  );
});

Deno.test('a gametime heartbeat reporting 0 zombies is ignored: only a tick heartbeat can clear the grid', () => {
  const recs: AuroraRecord[] = [
    { k: 'hb', t: 100_000, src: 'gametime', st: { game: { 'zombies-loaded': 0 } } } as AuroraRecord,
  ];
  assertEquals(buildPlan(recs, SERVER).deletes, []);
});

function toIsoOf(t: number): string {
  return new Date(t).toISOString();
}

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

// T25 Do step 4 (laundry A5): the live health rows read zombies_total/loaded/
// simulated 0 at 13:28 UTC with a player online, while the 2026-09-28 round
// logged zombies-loaded 106 at some point. This asks whether HEALTH_COLUMNS
// reads the keys the exporter actually emits, using a REAL tick heartbeat line
// from the host log fixture rather than the synthetic one above.
Deno.test('buildHealthRow maps the zombie keys a real tick heartbeat line actually carries (T25 Do step 4)', () => {
  const text = Deno.readTextFileSync(
    new URL('./fixtures/2026-09-28_23-00_Aurora.txt', import.meta.url),
  );
  // The first tick heartbeat in the fixture with a nonzero zombie population
  // (23:02:51.529, one player online, 11 loaded cells) - the earlier tick
  // heartbeats are all from an empty server (0 everywhere), which would not
  // distinguish "the mapping is broken" from "the server really was empty".
  const line = text
    .split('\n')
    .find((l) => l.includes('"zombies-loaded":79'));
  if (line === undefined) {
    throw new Error('fixture no longer contains the expected zombies-loaded:79 tick heartbeat line');
  }
  const parsed = parseLineDetailed(line);
  if (!parsed.ok || parsed.record.k !== 'hb') {
    throw new Error(`fixture line did not parse as a heartbeat: ${JSON.stringify(parsed)}`);
  }
  assertEquals(isHealthHeartbeat(parsed.record), true, 'src=tick must be treated as a health heartbeat');

  const row = buildHealthRow(parsed.record, SERVER);
  // Read straight off the raw JSON line so this assertion cannot be fooled by
  // a copy-paste of the wrong number into the test.
  assertEquals(row.zombies_total, 79, 'st.game.zombies-total -> zombies_total');
  assertEquals(row.zombies_loaded, 79, 'st.game.zombies-loaded -> zombies_loaded');
  assertEquals(row.zombies_simulated, 0, 'st.game.zombies-simulated -> zombies_simulated');
  assertEquals(row.zombies_culled, 0, 'st.game.zombies-culled -> zombies_culled');
  assertEquals(row.loaded_cells, 11, 'st.game.loaded-cells -> loaded_cells');
  assertEquals(row.players, 1);
  // Answer to the T25 zombie-counter question: HEALTH_COLUMNS reads the exact
  // keys a real heartbeat carries (zombies-total/loaded/simulated/culled,
  // loaded-cells, all present under st.game with no naming drift), so a health
  // row reading 0 zombies elsewhere reflects the game's own state, not a
  // broken mapping. No change made to HEALTH_COLUMNS.
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
  assertEquals(row.tick_ms, null, 'no table, no tick figure - null, never zero');
  assertEquals(row.raw, {}, 'nothing to keep');
});

Deno.test('a malformed table value leaves its column null rather than NaN', () => {
  const row = buildHealthRow(tickHb({ st: { perf: { fps: Number.NaN } } }), SERVER);
  assertEquals(row.tick_ms, null);
});

Deno.test('every health row in a batch has the same keys (PostgREST PGRST102, the 2026-09-29 05:13 stall)', () => {
  const rows = buildHealthRows([
    tickHb(),
    tickHb({ t: 1790629902835, st: { perf: { fps: 101 } } }), // no game or net table
    { k: 'hb', t: 1790629912835, src: 'tick' }, // no st, no players at all
  ], SERVER);
  assertEquals(rows.length, 3);
  const keys = rows.map((r) => Object.keys(r).sort().join(','));
  assertEquals(new Set(keys).size, 1, `mixed key sets: ${keys.join(' | ')}`);
  assertEquals(rows[2].players, null);
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
    ['display_name', 'is_dead', 'last_saved_x', 'last_saved_y', 'server_id', 'username'],
    'must not clobber online, last_seen, linked_user_id or hours_survived',
  );
  assertEquals(bob?.is_dead, false, 'no flag means alive');
});

Deno.test('players.db rows carry the dead flag of the newest character', () => {
  const rows = buildSavedPlayerRows([
    { username: 'kitten', name: 'first life', x: 1, y: 1, isDead: true },
    { username: 'kitten', name: 'second life', x: 2, y: 2, isDead: false },
    { username: 'gone', name: 'only life', x: 3, y: 3, isDead: true },
  ], SERVER);
  assertEquals(rows.find((r) => r.username === 'kitten')?.is_dead, false);
  assertEquals(rows.find((r) => r.username === 'kitten')?.display_name, 'second life');
  assertEquals(rows.find((r) => r.username === 'gone')?.is_dead, true);
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
