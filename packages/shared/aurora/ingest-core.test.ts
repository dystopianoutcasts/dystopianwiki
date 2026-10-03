// Run with: deno test packages/shared/aurora/ingest-core.test.ts
import {
  buildFactionRows,
  buildLifeSampleRows,
  buildNpcGroupRow,
  buildNpcOutpostRow,
  isMissingObjectError,
  runPlanStep,
  buildHealthRow,
  buildHealthRows,
  buildPlan,
  buildSavedPlayerRows,
  tagRows,
  chunk,
  isHealthHeartbeat,
  ONLINE_WINDOW_MS,
  planRead,
  type IngestPlan,
  type Row,
  type TableUpsert,
} from './ingest-core.ts';
import { parseLineDetailed } from './parser.ts';
import type { AuroraRecord, HbRecord, NpcOutpostRecord, NpcRecord, PosRecord } from './parser.ts';

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

// ---------------------------------------------------------------------------
// npc, npcgone, npco, npcogone -> npc_groups, npc_outposts (029)
// ---------------------------------------------------------------------------

const npcRec = (o: Partial<NpcRecord> & { id: string; t: number }): NpcRecord =>
  ({ k: 'npc', x: 10, y: 20, n: 2, f: 'raiders', fn: 'Road Raiders', st: 'hostile', z: 0, src: 'actor', act: 'active', enc: 'patrol', sen: false, ...o }) as NpcRecord;

const outRec = (o: Partial<NpcOutpostRecord> & { id: string; t: number }): NpcOutpostRecord =>
  ({ k: 'npco', x1: 1, y1: 2, x2: 30, y2: 40, z: 0, f: 'raiders', fn: 'Road Raiders', st: 'hostile', hp: true, state: 'built', hid: false, ...o }) as NpcOutpostRecord;

Deno.test('npc records upsert npc_groups on (server_id, group_id), marked optional', () => {
  const plan = buildPlan([npcRec({ id: 'squad:1', t: 1000 })], SERVER);
  const t = table(plan.upserts, 'npc_groups');
  assertEquals(t?.onConflict, 'server_id,group_id');
  assertEquals(t?.optional, true);
  const row = t!.rows[0];
  assertEquals(row.group_id, 'squad:1');
  assertEquals(row.server_id, SERVER);
  assertEquals(row.faction_name, 'Road Raiders');
  assertEquals(row.size, 2);
  assertEquals(row.active, true);
  assertEquals(row.source, 'actor');
  assertEquals(row.sensitive, false);
  assertEquals(row.t, new Date(1000).toISOString());
});

Deno.test('seen_at is the ingest clock passed in, not the record time, and the npc upserts are liveOnly', () => {
  const seen = '2031-01-02T03:04:05.000Z';
  const plan = buildPlan(
    [npcRec({ id: 'g', t: 1000 }), outRec({ id: 's', t: 2000 })],
    SERVER,
    { seenAt: seen },
  );
  const g = table(plan.upserts, 'npc_groups')!;
  const o = table(plan.upserts, 'npc_outposts')!;
  assertEquals(g.rows[0].seen_at, seen);
  assertEquals(g.rows[0].t, new Date(1000).toISOString(), 't stays the record time');
  assertEquals(o.rows[0].seen_at, seen);
  assertEquals(g.liveOnly, true);
  assertEquals(buildNpcGroupRow({ k: 'npc', t: 1, id: 'g', x: 1, y: 2 } as NpcRecord, SERVER).stance, null, 'no stance is stored as null');
  assertEquals(o.liveOnly, true);
  assertEquals(plan.upserts.filter((u) => u.liveOnly).map((u) => u.table).sort(), ['npc_groups', 'npc_outposts']);
});

Deno.test('a group record that does not say sen:false is stored SENSITIVE (fail closed)', () => {
  const rec = { k: 'npc', t: 1, id: 'g', x: 1, y: 2 } as NpcRecord;
  assertEquals(buildNpcGroupRow(rec, SERVER).sensitive, true);
  assertEquals(buildNpcGroupRow({ ...rec, sen: true } as NpcRecord, SERVER).sensitive, true);
  assertEquals(buildNpcGroupRow({ ...rec, sen: false } as NpcRecord, SERVER).sensitive, false);
  assertEquals(buildNpcGroupRow({ ...rec, sen: 'false' as unknown as boolean } as NpcRecord, SERVER).sensitive, true);
});

Deno.test('an outpost record that does not say hid:false is stored HIDDEN (fail closed)', () => {
  const rec = { k: 'npco', t: 1, id: 's', x1: 1, y1: 2, x2: 3, y2: 4 } as NpcOutpostRecord;
  assertEquals(buildNpcOutpostRow(rec, SERVER).hidden, true);
  assertEquals(buildNpcOutpostRow({ ...rec, hid: false } as NpcOutpostRecord, SERVER).hidden, false);
  assertEquals(buildNpcOutpostRow(rec, SERVER).state, 'unknown');
  assertEquals(buildNpcOutpostRow(rec, SERVER).hostile, false);
});

Deno.test('every npc group row carries every column, as PostgREST bulk inserts require', () => {
  const plan = buildPlan([
    npcRec({ id: 'a', t: 1 }),
    { k: 'npc', t: 2, id: 'b', x: 1, y: 2 } as NpcRecord, // a bare record
  ], SERVER);
  const rows = table(plan.upserts, 'npc_groups')!.rows;
  assertEquals(Object.keys(rows[0]).sort(), Object.keys(rows[1]).sort());
  assertEquals(Object.keys(rows[0]).sort(), [
    'active', 'encounter', 'faction_id', 'faction_name', 'group_id', 'seen_at', 'sensitive', 'server_id',
    'size', 'source', 'stance', 't', 'x', 'y', 'z',
  ]);
});

Deno.test('outpost rows carry every column of npc_outposts', () => {
  const plan = buildPlan([outRec({ id: 'site:1', t: 5 })], SERVER);
  const t = table(plan.upserts, 'npc_outposts');
  assertEquals(t?.onConflict, 'server_id,outpost_id');
  assertEquals(t?.optional, true);
  assertEquals(Object.keys(t!.rows[0]).sort(), [
    'faction_id', 'faction_name', 'hidden', 'hostile', 'outpost_id', 'seen_at', 'server_id', 'stance',
    'state', 't', 'x1', 'x2', 'y1', 'y2', 'z',
  ]);
});

Deno.test('repeated npc records for one group collapse to the newest', () => {
  const plan = buildPlan([
    npcRec({ id: 'g', t: 3000, x: 3 }),
    npcRec({ id: 'g', t: 1000, x: 1 }),
    npcRec({ id: 'g', t: 2000, x: 2 }),
  ], SERVER);
  const rows = table(plan.upserts, 'npc_groups')!.rows;
  assertEquals(rows.length, 1);
  assertEquals(rows[0].x, 3);
});

Deno.test('npcgone deletes the group row, guarded by the record time, and writes no row', () => {
  const plan = buildPlan([{ k: 'npcgone', t: 9000, id: 'squad:5' }], SERVER);
  assertEquals(table(plan.upserts, 'npc_groups'), undefined);
  const del = plan.deletes.find((d) => d.table === 'npc_groups');
  assert(del !== undefined, 'a delete');
  assertEquals(del!.optional, true);
  assert(del!.filter.startsWith(`server_id=eq.${SERVER}`), 'scoped to the server');
  assert(decodeURIComponent(del!.filter).includes('group_id=in.("squad:5")'), del!.filter);
  assert(del!.filter.includes(`t=lte.${encodeURIComponent(new Date(9000).toISOString())}`), del!.filter);
});

Deno.test('the latest word wins inside a batch: seen-then-gone is gone, gone-then-seen is seen', () => {
  const goneLast = buildPlan([npcRec({ id: 'g', t: 1000 }), { k: 'npcgone', t: 2000, id: 'g' }], SERVER);
  assertEquals(table(goneLast.upserts, 'npc_groups'), undefined);
  assertEquals(goneLast.deletes.filter((d) => d.table === 'npc_groups').length, 1);

  const seenLast = buildPlan([{ k: 'npcgone', t: 1000, id: 'g' }, npcRec({ id: 'g', t: 2000 })], SERVER);
  assertEquals(table(seenLast.upserts, 'npc_groups')?.rows.length, 1);
  assertEquals(seenLast.deletes.filter((d) => d.table === 'npc_groups').length, 0);
});

Deno.test('npcogone deletes the outpost row; ids with quotes and colons are quoted safely', () => {
  const plan = buildPlan([{ k: 'npcogone', t: 5, id: 'site:"7"' }], SERVER);
  const del = plan.deletes.find((d) => d.table === 'npc_outposts')!;
  assert(decodeURIComponent(del.filter).includes('outpost_id=in.("site:\\"7\\"")'), del.filter);
});

Deno.test('gone deletes are chunked so a URL never carries more than 100 ids', () => {
  const recs = Array.from({ length: 250 }, (_, i) => ({ k: 'npcgone', t: 10 + i, id: `g${i}` })) as AuroraRecord[];
  const dels = buildPlan(recs, SERVER).deletes.filter((d) => d.table === 'npc_groups');
  assertEquals(dels.length, 3);
});

Deno.test('a batch with no npc records plans no npc writes at all', () => {
  const plan = buildPlan([{ k: 'pos', t: 1, u: 'a', x: 1, y: 2 }] as AuroraRecord[], SERVER);
  assertEquals(plan.upserts.some((u) => u.table.startsWith('npc_')), false);
  assertEquals(plan.deletes.some((d) => d.table.startsWith('npc_')), false);
});

Deno.test('npc kinds are counted in the plan counts', () => {
  const plan = buildPlan([npcRec({ id: 'g', t: 1 }), { k: 'npcgone', t: 2, id: 'h' }], SERVER);
  assertEquals(plan.counts.npc, 1);
  assertEquals(plan.counts.npcgone, 1);
});

Deno.test('the ingest knows a missing table or function by what PostgREST answers', () => {
  assert(
    isMissingObjectError(new Error('upsert npc_groups: 404 {"code":"PGRST205","message":"Could not find the table \'aurora.npc_groups\' in the schema cache"}')),
    'PGRST205',
  );
  assert(isMissingObjectError(new Error('rpc prune_npcs: 404 {"code":"PGRST202","message":"Could not find the function aurora.prune_npcs"}')), 'PGRST202');
  assert(isMissingObjectError(new Error('delete x: 400 {"code":"42P01","message":"relation \\"aurora.npc_groups\\" does not exist"}')), '42P01');
  assert(!isMissingObjectError(new Error('upsert npc_groups: 400 {"code":"22P02","message":"invalid input syntax"}')), 'a bad value is not a missing table');
  assert(!isMissingObjectError(new Error('upsert npc_groups: 401 {"message":"Invalid API key"}')), 'auth is not a missing table');
  assert(!isMissingObjectError(new Error('upsert npc_groups: 500 boom')), '500');
});

Deno.test('runPlanStep skips an optional missing object, and nothing else', async () => {
  const missing = () => Promise.reject(new Error('upsert t: 404 {"code":"PGRST205"}'));
  let skipped = 0;
  assertEquals(await runPlanStep(true, missing, () => skipped++), false);
  assertEquals(skipped, 1);
  assertEquals(await runPlanStep(true, () => Promise.resolve(), () => skipped++), true);

  let threw = false;
  try {
    await runPlanStep(false, missing);
  } catch {
    threw = true;
  }
  assert(threw, 'a non-optional missing table still throws');
  threw = false;
  try {
    await runPlanStep(true, () => Promise.reject(new Error('upsert t: 500 boom')));
  } catch {
    threw = true;
  }
  assert(threw, 'an optional write that fails for any other reason still throws');
});

// ---------------------------------------------------------------------------
// death -> aurora.deaths (030) and boot.gv -> servers.game_version
// ---------------------------------------------------------------------------

const deathRec = (o: Record<string, unknown> & { u: string; t: number }): AuroraRecord =>
  ({ k: 'death', x: 10, y: 20, z: 0, src: 'isdead', hs: 5, ...o }) as unknown as AuroraRecord;

Deno.test('a death upserts aurora.deaths on (server_id, username, t), marked optional and NOT liveOnly', () => {
  const plan = buildPlan([deathRec({ u: 'alice', t: 1759000000000 })], SERVER);
  const d = table(plan.upserts, 'deaths');
  assert(d !== undefined, 'deaths upsert present');
  assertEquals(d!.onConflict, 'server_id,username,t');
  assertEquals(d!.optional, true, 'a missing table (030 not applied) must not stall the ingest');
  assert(d!.liveOnly !== true, 'a replay must write deaths (idempotent through the unique key)');
  assertEquals(d!.rows[0], {
    server_id: SERVER, username: 'alice', x: 10, y: 20, z: 0,
    t: '2025-09-27T19:06:40.000Z', src: 'isdead', hours_survived: 5,
  });
});

Deno.test('a death with no hs or an unknown src stores nulls and every row has every key', () => {
  const plan = buildPlan([
    deathRec({ u: 'a', t: 1000, hs: undefined, src: 'bogus' }),
    { k: 'death', t: 2000, u: 'b', x: 1, y: 2 } as AuroraRecord,
  ], SERVER);
  const rows = table(plan.upserts, 'deaths')!.rows;
  const keys = JSON.stringify(Object.keys(rows[0]).sort());
  assertEquals(JSON.stringify(Object.keys(rows[1]).sort()), keys);
  assertEquals(rows[0].src, null);
  assertEquals(rows[0].hours_survived, null);
  assertEquals(rows[1].z, 0);
});

Deno.test('the same death twice in one batch collapses, two deaths of one player at different times both stay', () => {
  const plan = buildPlan([
    deathRec({ u: 'a', t: 1000 }), deathRec({ u: 'a', t: 1000 }), deathRec({ u: 'a', t: 500000 }),
  ], SERVER);
  assertEquals(table(plan.upserts, 'deaths')!.rows.length, 2);
});

Deno.test('no death records, no deaths upsert; deaths are written after servers', () => {
  assert(table(buildPlan([{ k: 'hb', t: 1 }] as AuroraRecord[], SERVER).upserts, 'deaths') === undefined, 'none');
  const plan = buildPlan([deathRec({ u: 'a', t: 1 })], SERVER);
  assertEquals(plan.upserts[0].table, 'servers');
});

Deno.test('boot gv becomes servers.game_version; the newest wins; none leaves the column out', () => {
  const withGv = buildPlan([
    { k: 'boot', t: 1000, gv: '42.19.0' }, { k: 'boot', t: 2000, gv: ' 42.20.0 ' },
  ] as AuroraRecord[], SERVER);
  assertEquals(withGv.upserts[0].rows[0].game_version, '42.20.0');
  const without = buildPlan([{ k: 'boot', t: 1000 }] as AuroraRecord[], SERVER);
  assert(!('game_version' in without.upserts[0].rows[0]), 'game_version is not written when the boot has no gv');
  const blank = buildPlan([{ k: 'boot', t: 1000, gv: '  ' }] as AuroraRecord[], SERVER);
  assert(!('game_version' in blank.upserts[0].rows[0]), 'a blank gv is ignored');
});

Deno.test('the heartbeat keeps the new game stats in raw.game', () => {
  const row = buildHealthRow({
    k: 'hb', t: 1, src: 'tick',
    st: { game: { 'zombies-killed': 12, 'world-age-hours': 3.5, 'oa-ev-zombie-dead': 12, 'oa-ev-character-death': 0 } },
  } as HbRecord, SERVER);
  assertEquals((row.raw as { game: Record<string, number> }).game['zombies-killed'], 12);
  assertEquals((row.raw as { game: Record<string, number> }).game['world-age-hours'], 3.5);
});

Deno.test('a negative or non-numeric hours survived is stored as null', () => {
  const rows = table(buildPlan([
    deathRec({ u: 'a', t: 1, hs: -3 }),
    deathRec({ u: 'b', t: 2, hs: 'x' as unknown as number }),
    deathRec({ u: 'c', t: 3, hs: 0 }),
  ], SERVER).upserts, 'deaths')!.rows;
  assertEquals(rows.map((r) => r.hours_survived), [null, null, 0]);
});

// ---------------------------------------------------------------------------
// vname -> aurora.vehicle_names (031)
// ---------------------------------------------------------------------------

const vnameRec = (n: unknown, t: number): AuroraRecord => ({ k: 'vname', t, n }) as unknown as AuroraRecord;

Deno.test('vname upserts aurora.vehicle_names on script_name, optional, not liveOnly, global (no server_id)', () => {
  const plan = buildPlan([vnameRec([['Base.CarTaxi', 'Taxi'], ['Base.CarNormal', 'Chevalier Nyala']], 1759000000000)], SERVER);
  const v = table(plan.upserts, 'vehicle_names');
  assert(v !== undefined, 'vehicle_names upsert present');
  assertEquals(v!.onConflict, 'script_name');
  assert(v!.optional === true, 'optional: 031 may not be applied yet');
  assert(v!.liveOnly !== true, 'names replay safely');
  assertEquals(v!.rows, [
    { script_name: 'Base.CarTaxi', display_name: 'Taxi', updated_at: new Date(1759000000000).toISOString() },
    { script_name: 'Base.CarNormal', display_name: 'Chevalier Nyala', updated_at: new Date(1759000000000).toISOString() },
  ]);
  assert(!('server_id' in v!.rows[0]), 'a script name means the same car on every server');
});

Deno.test('vname chunks of one pass are merged; the newest record per script wins', () => {
  const plan = buildPlan([
    vnameRec([['Base.A', 'Old A'], ['Base.B', 'B']], 1000),
    vnameRec([['Base.A', 'New A']], 2000),
    vnameRec([['Base.B', 'Stale B']], 500),
  ], SERVER);
  const rows = table(plan.upserts, 'vehicle_names')!.rows;
  assertEquals(rows.length, 2);
  assertEquals(rows.find((r) => r.script_name === 'Base.A')!.display_name, 'New A');
  assertEquals(rows.find((r) => r.script_name === 'Base.B')!.display_name, 'B');
});

Deno.test('vname drops malformed pairs, untranslated keys and echoes, and keeps the good ones', () => {
  const plan = buildPlan([vnameRec([
    ['Base.Good', ' Good Car '],
    ['Base.Key', 'IGUI_VehicleNameKey'],
    ['Base.Echo', 'Base.Echo'],
    ['Base.Empty', ''],
    ['', 'No Script'],
    ['Base.Number', 5],
    ['Base.Short'],
    'not a pair',
    null,
  ], 10)], SERVER);
  const rows = table(plan.upserts, 'vehicle_names')!.rows;
  assertEquals(rows.map((r) => [r.script_name, r.display_name]), [['Base.Good', 'Good Car']]);
});

Deno.test('vname caps the lengths, and a record with no usable pair writes nothing', () => {
  const long = 'x'.repeat(500);
  const rows = table(buildPlan([vnameRec([['Base.L', long]], 1)], SERVER).upserts, 'vehicle_names')!.rows;
  assertEquals((rows[0].display_name as string).length, 120);
  assert(table(buildPlan([vnameRec([], 1)], SERVER).upserts, 'vehicle_names') === undefined, 'empty n, no upsert');
  assert(table(buildPlan([{ k: 'hb', t: 1 }] as AuroraRecord[], SERVER).upserts, 'vehicle_names') === undefined, 'no vname, no upsert');
});

Deno.test('vname is written after servers, and a missing table is skipped, not thrown', async () => {
  const plan = buildPlan([vnameRec([['Base.A', 'A']], 1)], SERVER);
  assertEquals(plan.upserts[0].table, 'servers');
  const step = table(plan.upserts, 'vehicle_names')!;
  let skipped = 0;
  const wrote = await runPlanStep(step.optional, () => Promise.reject(new Error('upsert vehicle_names: 404 {"code":"PGRST205"}')), () => { skipped++; });
  assertEquals(wrote, false);
  assertEquals(skipped, 1);
  let threw = false;
  try {
    await runPlanStep(step.optional, () => Promise.reject(new Error('upsert vehicle_names: 500 boom')));
  } catch {
    threw = true;
  }
  assert(threw, 'any other failure still throws');
});

// ---------------------------------------------------------------------------
// Worlds (032, T48): every row of every tagged table, or none
// ---------------------------------------------------------------------------

/** One batch that reaches every table buildPlan writes. */
function everyKindBatch(): AuroraRecord[] {
  const t = 1759406400000;
  const lines = [
    `{"k":"boot","t":${t},"v":"0.6.0","gv":"42.12.3"}`,
    `{"k":"hb","t":${t + 1},"src":"tick","players":2,"st":{"game":{"zombies-loaded":5}}}`,
    `{"k":"pos","t":${t + 2},"u":"alice","x":1,"y":2,"z":0,"hs":12.5,"al":""}`,
    `{"k":"pos","t":${t + 3},"u":"bob","x":3,"y":4}`,
    `{"k":"veh","t":${t + 4},"id":9,"q":4242,"s":"Base.Van","x":10,"y":20,"z":0,"o":"alice"}`,
    `{"k":"veh","t":${t + 4},"id":10,"s":"Base.Car","x":11,"y":21}`,
    `{"k":"sh","t":${t + 5},"id":"s1","x":1,"y":1,"w":5,"h":5,"o":"alice"}`,
    `{"k":"sh","t":${t + 5},"id":"s2","x":9,"y":9,"w":5,"h":5}`,
    `{"k":"zone","t":${t + 6},"kind":"pvp","ti":"Arena","x1":1,"y1":2,"x2":3,"y2":4}`,
    `{"k":"zone","t":${t + 6},"kind":"safe","ti":"Camp","x1":5,"y1":6}`,
    `{"k":"zgrid","t":${t + 7},"cx":1,"cy":2,"c":3}`,
    `{"k":"zgrid","t":${t + 7},"cx":2,"cy":2,"c":1}`,
    `{"k":"npc","t":${t + 8},"id":"squad:1","f":"r","n":2,"x":1,"y":2}`,
    `{"k":"npc","t":${t + 8},"id":"squad:2","x":1,"y":2,"sen":true}`,
    `{"k":"npco","t":${t + 9},"id":"site:1","x1":1,"y1":2,"x2":3,"y2":4,"hid":false}`,
    `{"k":"death","t":${t + 10},"u":"bob","x":3,"y":4,"src":"isdead","hs":2}`,
    `{"k":"death","t":${t + 11},"u":"carol","x":5,"y":6}`,
    `{"k":"vname","t":${t + 12},"n":[["Base.Van","Van"]]}`,
    `{"k":"catalog","t":${t + 13},"ft":"Base.Axe","dn":"Axe"}`,
  ];
  return lines.map((json) => {
    const r = parseLineDetailed(`[02-10-26 12:00:00.000] A1 ${json}.`);
    if (!r.ok) throw new Error(`fixture line rejected: ${json} ${JSON.stringify(r)}`);
    return r.record;
  });
}

/** Written here on purpose rather than imported: a table dropped from the code's set must fail this test. */
const TAGGED_IN_BATCH = [
  'health_samples', 'players', 'player_positions', 'player_position_history', 'safehouses',
  'zones', 'zombie_grid', 'deaths', 'npc_groups', 'npc_outposts',
];
const NEVER_TAGGED = ['servers', 'item_catalog', 'vehicle_names'];

/** The key-set rule, walked over every upsert body and every upsert_vehicles row list. */
function assertUniformKeys(plan: IngestPlan, label: string): void {
  for (const u of plan.upserts) {
    const first = JSON.stringify(Object.keys(u.rows[0]).sort());
    u.rows.forEach((r, i) => {
      assertEquals(JSON.stringify(Object.keys(r).sort()), first, `${label}: ${u.table} row ${i} key set`);
    });
  }
  for (const c of plan.rpcs) {
    const rows = (c.args.p_rows as Record<string, unknown>[] | undefined) ?? [];
    const first = rows.length > 0 ? JSON.stringify(Object.keys(rows[0]).sort()) : '';
    rows.forEach((r, i) => assertEquals(JSON.stringify(Object.keys(r).sort()), first, `${label}: ${c.fn} row ${i}`));
  }
}

Deno.test('worlds: with a world id every row of every tagged table carries it; upsert_vehicles gets no world argument', () => {
  const plan = buildPlan(everyKindBatch(), SERVER, { worldId: 'w2', seenAt: '2026-10-02T12:00:00.000Z' });
  const present = new Set(plan.upserts.map((u) => u.table));
  for (const name of [...TAGGED_IN_BATCH, ...NEVER_TAGGED]) assert(present.has(name), `fixture reaches ${name}`);
  for (const u of plan.upserts) {
    assert(u.rows.length >= 1, `${u.table} has rows`);
    for (const r of u.rows) {
      if (TAGGED_IN_BATCH.includes(u.table)) assertEquals(r.world_id, 'w2', `${u.table} world_id`);
      else assert(!('world_id' in r), `${u.table} must not carry world_id`);
    }
  }
  // players is two upserts (with and without stats): both tagged.
  assertEquals(plan.upserts.filter((u) => u.table === 'players').length, 2);
  // 032 kept upsert_vehicles(p_server, p_rows) and stamps the current world inside it;
  // an undeclared argument would be "could not find the function" and stall the cursor.
  const veh = plan.rpcs.find((c) => c.fn === 'upsert_vehicles');
  assertEquals(Object.keys(veh?.args ?? {}).sort(), ['p_rows', 'p_server']);
  assertEquals(veh?.args.p_server, SERVER);
  assertEquals((veh?.args.p_rows as unknown[]).length, 2);
  assertUniformKeys(plan, 'tagged');
});

Deno.test('worlds: the key-set rule holds per table with tables of several rows', () => {
  const plan = buildPlan(everyKindBatch(), SERVER, { worldId: 'w2', seenAt: '2026-10-02T12:00:00.000Z' });
  // The walk only proves something where a table has more than one row.
  for (const name of ['player_position_history', 'safehouses', 'zones', 'zombie_grid', 'deaths', 'npc_groups']) {
    assert((plan.upserts.find((u) => u.table === name)?.rows.length ?? 0) >= 2, `${name} has 2+ rows in the fixture`);
  }
  assertUniformKeys(plan, 'tagged');
});

Deno.test('worlds: a null or absent world id sends no world key at all (not world_id: null)', () => {
  for (const opts of [{}, { worldId: null }, { worldId: undefined }]) {
    const plan = buildPlan(everyKindBatch(), SERVER, { ...opts, seenAt: '2026-10-02T12:00:00.000Z' });
    for (const u of plan.upserts) {
      for (const r of u.rows) assert(!('world_id' in r), `${u.table} carries world_id with ${JSON.stringify(opts)}`);
    }
    const veh = plan.rpcs.find((c) => c.fn === 'upsert_vehicles');
    assert(veh !== undefined && !('p_world' in veh.args), 'no p_world key');
    assertUniformKeys(plan, `untagged ${JSON.stringify(opts)}`);
  }
});

Deno.test('worlds: tagging changes nothing else in the plan', () => {
  const a = buildPlan(everyKindBatch(), SERVER, { seenAt: '2026-10-02T12:00:00.000Z' });
  const b = buildPlan(everyKindBatch(), SERVER, { worldId: 'w7', seenAt: '2026-10-02T12:00:00.000Z' });
  const strip = (p: IngestPlan) => JSON.stringify({
    upserts: p.upserts.map((u) => ({ ...u, rows: u.rows.map(({ world_id: _w, ...rest }) => rest) })),
    rpcs: p.rpcs.map((c) => ({ ...c, args: (({ p_world: _p, ...rest }) => rest)(c.args) })),
    patches: p.patches, deletes: p.deletes, counts: p.counts,
  });
  assertEquals(strip(b), strip(a));
});

Deno.test('worlds: tagRows tags every row or none', () => {
  const rows = [{ a: 1 }, { a: 2, b: 3 }];
  assertEquals(tagRows(rows, 'w1'), [{ a: 1, world_id: 'w1' }, { a: 2, b: 3, world_id: 'w1' }]);
  assertEquals(tagRows(rows, null), rows);
  assertEquals(tagRows(rows, undefined), rows);
  assertEquals(tagRows([], 'w1'), []);
});

// Verbatim from STATUS "T53 PASS" (exporter 0.7.0 harness lines).
const T53_POS_LINE =
  'A1 {"al":"None","hs":77.5,"id":1,"k":"pos","n":"alice","t":1759000000000,"u":"alice","x":10650.5,"y":9800.25,"z":0,"zk":42}';
const T53_KILL_LINE = 'A1 {"k":"kill","t":1759000000000,"u":"alice","x":10650.5,"y":9800.25,"z":1}';
const T53_FACS_LINE =
  'A1 {"f":[{"g":"","m":["kim","lou"],"n":"Bears","o":"kim"},{"g":"WLF","m":["abe","mia","zed"],"n":"Wolves","o":"zed"}],"k":"facs","t":1759000000000}';

// ---------------------------------------------------------------------------
// Season records (034, T54): kill_events, observe_lives, replace_factions
// ---------------------------------------------------------------------------

function parsedLines(lines: string[]): AuroraRecord[] {
  return lines.map((l) => {
    const r = parseLineDetailed(`[02-10-26 12:00:00.000] ${l}.`);
    if (!r.ok) throw new Error(`does not parse: ${l}`);
    return r.record;
  });
}

function rpcCall(plan: IngestPlan, fn: string) {
  return plan.rpcs.find((r) => r.fn === fn);
}

Deno.test('T54 kill_events: rows from kill records, optional, duplicates ignored, every row the same keys', () => {
  const recs = parsedLines([
    T53_KILL_LINE,
    'A1 {"k":"kill","t":1759000001000,"u":"bob","x":5,"y":6}',
    T53_KILL_LINE, // the same event twice in one batch
  ]);
  const plan = buildPlan(recs, SERVER, { worldId: 'w2' });
  const u = table(plan.upserts, 'kill_events');
  assert(u !== undefined, 'kill_events upsert');
  assertEquals(u!.onConflict, 'server_id,username,t,x,y');
  assertEquals(u!.optional, true, 'optional');
  assertEquals(u!.ignoreDuplicates, true, 'duplicates ignored, never merged');
  assert(!u!.liveOnly, 'replayed by the backfill');
  assertEquals(u!.rows.length, 2, 'deduped');
  assertEquals(u!.rows[0], {
    server_id: SERVER, username: 'alice', x: 10650.5, y: 9800.25, z: 1, t: '2025-09-27T19:06:40.000Z', world_id: 'w2',
  });
  // bob's record has no z: the key is still there (PostgREST rejects mixed key sets).
  assertEquals(Object.keys(u!.rows[1]), Object.keys(u!.rows[0]), 'same key set');
  assertEquals(u!.rows[1].z, 0);
  for (const r of u!.rows) assertEquals(r.world_id, 'w2', 'every kill row carries the world');
});

Deno.test('T54 observe_lives: the newest sample per player with hs or zk, after the players upsert, with the world', () => {
  const recs = parsedLines([
    'A1 {"k":"pos","t":1000,"u":"alice","x":1,"y":1,"hs":1,"zk":0}',
    'A1 {"k":"pos","t":3000,"u":"alice","x":1,"y":1,"hs":2,"zk":3}',
    'A1 {"k":"pos","t":2000,"u":"alice","x":1,"y":1,"hs":1.5,"zk":1}',
    'A1 {"k":"pos","t":2500,"u":"bob","x":1,"y":1,"zk":7}',
    'A1 {"k":"pos","t":2600,"u":"carl","x":1,"y":1}', // neither hs nor zk
    'A1 {"k":"pos","t":2700,"u":"dee","x":1,"y":1,"zk":-4}', // zk dropped by the parser
  ]);
  const plan = buildPlan(recs, SERVER, { worldId: 'w2' });
  const call = rpcCall(plan, 'observe_lives');
  assert(call !== undefined, 'observe_lives called');
  assertEquals(call!.optional, true, 'optional');
  assert(!call!.liveOnly, 'replayed by the backfill');
  assertEquals(call!.args, {
    p_server: SERVER,
    p_world: 'w2',
    p_rows: [
      { username: 'bob', t: '1970-01-01T00:00:02.500Z', zk: 7 },
      { username: 'alice', t: '1970-01-01T00:00:03.000Z', hs: 2, zk: 3 },
    ],
  });
  assertEquals(call!.rows, 2);
  // Every rpc runs after every upsert: the players rows exist before the lives call.
  assert(table(plan.upserts, 'players') !== undefined, 'players upserted in the same plan');
  assertEquals(plan.upserts.some((u) => u.table === 'observe_lives'), false, 'not an upsert');
});

Deno.test('T54 observe_lives: no world sends p_world null (the function uses the current world)', () => {
  const plan = buildPlan(parsedLines([T53_POS_LINE]), SERVER, {});
  assertEquals(rpcCall(plan, 'observe_lives')!.args.p_world, null);
  assertEquals((rpcCall(plan, 'observe_lives')!.args.p_rows as Row[])[0], {
    username: 'alice', t: '2025-09-27T19:06:40.000Z', hs: 77.5, zk: 42,
  });
});

Deno.test('T54 observe_lives replay mode: first, last, the first kill and both sides of every drop', () => {
  const lines = [
    [0, 1, 0], [1, 2, 0], [2, 3, 2], [3, 4, 5], [4, 5, 9], [5, 0.2, 0], [6, 1, 0], [7, 2, 1], [8, 3, 1],
  ].map(([i, hs, zk]) => `A1 {"k":"pos","t":${1000 + i * 1000},"u":"alice","x":1,"y":1,"hs":${hs},"zk":${zk}}`);
  const pos = parsedLines(lines).filter((r) => r.k === 'pos') as PosRecord[];
  const kept = buildLifeSampleRows(pos, 'replay').map((r) => (Date.parse(r.t as string) - 1000) / 1000);
  // 0 first; 2 the first kill; 4 and 5 the drop (9 -> 0 kills, 5 -> 0.2 hours); 7 the
  // next first kill; 8 last.
  assertEquals(kept, [0, 2, 4, 5, 7, 8]);
  assertEquals(buildLifeSampleRows(pos, 'newest').length, 1);
});

Deno.test('T54 replace_factions: the newest facs record, liveOnly, seen_at is the ingest clock', () => {
  const recs = parsedLines([
    'A1 {"k":"facs","t":1,"f":[{"n":"Old","g":"","o":"x","m":["x"]}]}',
    T53_FACS_LINE,
  ]);
  const plan = buildPlan(recs, SERVER, { worldId: 'w2', seenAt: '2026-10-02T12:00:00.000Z' });
  const calls = plan.rpcs.filter((r) => r.fn === 'replace_factions');
  assertEquals(calls.length, 1, 'one call, the newest list');
  assertEquals(calls[0].liveOnly, true, 'liveOnly');
  assertEquals(calls[0].optional, true, 'optional');
  assertEquals(calls[0].args, {
    p_server: SERVER,
    p_world: 'w2',
    p_rows: [
      { name: 'Bears', tag: null, owner: 'kim', members: ['kim', 'lou'] },
      { name: 'Wolves', tag: 'WLF', owner: 'zed', members: ['abe', 'mia', 'zed'] },
    ],
    p_seen_at: '2026-10-02T12:00:00.000Z',
  });
});

Deno.test('T54 replace_factions: an empty list is a call with no rows (every faction disbanded)', () => {
  const plan = buildPlan(parsedLines(['A1 {"k":"facs","t":1,"f":[]}']), SERVER, { seenAt: '2026-10-02T12:00:00.000Z' });
  const call = rpcCall(plan, 'replace_factions');
  assert(call !== undefined, 'still called');
  assertEquals(call!.args.p_rows, []);
  assertEquals(buildFactionRows({ k: 'facs', t: 1, f: [{ n: 'A', m: [] }, { n: ' ', m: [] }, { n: 'A', g: 'T', m: ['q'] }] }), [
    { name: 'A', tag: 'T', owner: null, members: ['q'] },
  ]);
});

Deno.test('T54 a batch without kill, zk/hs or facs records plans none of the three', () => {
  const plan = buildPlan(parsedLines(['A1 {"k":"pos","t":1,"u":"a","x":1,"y":1}']), SERVER, {});
  assertEquals(table(plan.upserts, 'kill_events'), undefined);
  assertEquals(plan.rpcs.map((r) => r.fn), []);
});
