// Pure parser for OutcastAurora exporter log lines. No I/O, no Supabase, no Deno
// APIs - the ingest function, the backfill CLI and the tests all share this.
//
// ---------------------------------------------------------------------------
// Line format
// ---------------------------------------------------------------------------
//   [dd-MM-yy HH:mm:ss.SSS] [ game-time] A1 {"k":"pos","t":1759...} .
//
// The leading bracket groups come from PZ's own logger, not from the exporter.
// T08's task text describes ONE group; the T02 spike read a real server log and
// recorded TWO ("[dd-mm-yy hh:mm:ss.mmm] [ game-time]"). Rather than bet on
// either, the prefix matcher accepts one or more bracket groups and ignores all
// of them: the authoritative timestamp is `t` inside the JSON, which the
// exporter writes as server epoch milliseconds. The trailing period is PZ's and
// is stripped.
//
// `A1` is the wire-format version marker. A line without it is not ours and is
// skipped silently - the Aurora log shares a directory with PZ's own logs and a
// backfill bundle may contain anything.
//
// ---------------------------------------------------------------------------
// Record contract - READ THIS BEFORE CHANGING THE EXPORTER (T09)
// ---------------------------------------------------------------------------
// `boot`, `probe` and the v0.0 `hb` are OBSERVED (first live log, STATUS "T03
// PASS", 2026-09-28). `hb.st`, `hb.src` and `statkeys` are the revision 2
// shapes T08 rev 2 and T09 agreed on and T09 is emitting; the rest is still the
// contract this parser defines. Keys are short because the log rotates at
// 10 MiB and `pos` lines dominate it.
//
// Every record carries `k` (kind) and `t` (server epoch ms). No record carries a
// server id: the ingest caller supplies that, so a relabelled log cannot write
// into another server's rows. The launch stamp is NOT in any record either: it
// is the log file's own name (<yyyy-MM-dd_HH-mm>_Aurora.txt), see
// launchStampFromFileName below.
//
//   boot     v exporter version, gv game version (0.5.0), schema, players,
//            apis {name: bool}, events {name: bool}
//   probe    fileWriter bool (v0.0 diagnostic; no table)
//   statkeys perf [names], game [names], net [names] (once per launch; no table)
//   hb       players online count, src "tick" | "gametime",
//            st { perf {name: number}, game {...}, net {...} } - the three
//            server statistics tables; only src "tick" becomes a health sample
//   pos      u username, n display name, id online id, x, y, z, v vehicle id or null,
//            hs hours survived, al access level, zk the character's zombie kill
//            counter (exporter 0.7.0; a non-negative integer, omitted when unreadable;
//            any other value is dropped from the record, never a shape failure)
//   veh      id vehicle id, s script name, ty vehicle type, x, y, z,
//            d driver username or null (exporter 0.2; `sc` is the name this
//            contract used before and is still accepted),
//            q persistent save id (exporter 0.3, absent when unknown),
//            o claim owner, "" in the record that reports a release
//   sh       id, x, y, w, h, o owner, ti title, p [usernames], lv last visited ms,
//            c created ms
//   zone     kd kind, ti title, x1, y1, x2, y2
//   zgrid    cx cell x, cy cell y, n count
//   catalog  ft full type, dn display name, cat category, w weight, cv version
//   catalogv cv version (header line before a catalog set)
//   link     c code, u username
//   npc      id group key ("squad:12", "group:...", "actor:<uid>"), f faction id,
//            fn faction name, st stance, n members, x, y, z (centroid), src "actor" |
//            "squad", act "active" | "dormant", enc most common encounter, sen true
//            when the group must never be public (exporter 0.4.0)
//   npcgone  id of a group that disappeared
//   npco     id outpost id, f, fn, st, hp hostile to players, x1, y1, x2, y2, z,
//            state, hid map-hidden
//   npcogone id of an outpost that disappeared or expired
//   death    u username, x, y, z (where the character died), src which source saw
//            it ("isdead" | "chardeath" | "dodeathlog" | "cosmicmap"), hs hours the
//            character survived when known (exporter 0.5.0; one record per player
//            per 120 s at most)
//   vname    n [[full script name, display name], ...], several records per pass
//            (exporter 0.5.1). The script name is what `veh.s` carries ("Base.CarTaxi").
//   world    w exporter world id (8-64 chars [A-Za-z0-9-], a save's ModData UUID),
//            wn true on the boot that created the id, wa world age hours, ws ms the
//            id was created (exporter 0.6.0; once per boot, then every 6 h). It
//            maps to no table: the importer hands it to aurora.register_world.
//   kill     u killer username, x, y, z of the zombie (exporter 0.7.0; capped at 20
//            per second at the source, so it undercounts: totals come from pos.zk)
//   facs     f [{n name, g tag ("" for none), o owner username, m [usernames]}], the
//            FULL faction list (exporter 0.7.0; every 10 min and on change; `m`
//            includes the owner once; "f":[] means every faction is disbanded)
//
// `boot.gv` (exporter 0.5.0) is the game version; it becomes servers.game_version.
// `hb.st.game` also carries zombies-killed, world-age-hours, oa-ev-zombie-dead and
// oa-ev-character-death from 0.5.0; they need no parser support, they land in
// health_samples.raw.game and the SQL reads them there.
//
// A kind this version does not know is SKIPPED, never a failure: parseLineDetailed
// answers { ok: false, reason: 'unknown-kind' }, splitLines counts it in
// stats.unknownKind and carries on, and nothing downstream treats that count as an
// error. So an exporter that ships a new kind before the ingest that reads it
// costs nothing but a line in the totals (this held for npc* on 2026-10-02: the
// 0.4.0 exporter may ship before 029 and the new ingest).

export const KINDS = [
  'boot',
  'hb',
  'pos',
  'veh',
  'sh',
  'zone',
  'zgrid',
  'catalog',
  'catalogv',
  'link',
  'npc',
  'npcgone',
  'npco',
  'npcogone',
  'death',
  'vname',
  'world',
  'kill',
  'facs',
  // Diagnostic kinds: known so they are not reported as unknown, but they map
  // to no table - buildPlan produces no rows for them.
  'probe',
  'statkeys',
  'guard',
] as const;

/**
 * The exporter opens one log per server launch and PZ names it after the
 * launch time, so the file name IS the launch stamp. Returns null for a name
 * that does not follow the <yyyy-MM-dd_HH-mm>_Aurora.txt pattern.
 */
export function launchStampFromFileName(fileName: string): string | null {
  const m = /^(\d{4}-\d{2}-\d{2}_\d{2}-\d{2})_Aurora\.txt$/.exec(fileName.split('/').pop() ?? '');
  return m ? m[1] : null;
}

export type Kind = (typeof KINDS)[number];

export interface BaseRecord {
  k: Kind;
  t: number;
}

export interface BootRecord extends BaseRecord {
  k: 'boot';
  // OBSERVED shape (OutcastMods 9aad789, live log 2026-09-28_21-10). The launch
  // stamp is the file name. `gv` (exporter 0.5.0) is getCore():getVersion(), absent
  // when the call failed; it becomes servers.game_version.
  v?: string;
  gv?: string;
  schema?: number;
  apis?: Record<string, boolean>;
  events?: Record<string, boolean>;
  players?: number;
}

export interface ProbeRecord extends BaseRecord {
  k: 'probe';
  fileWriter?: boolean;
  err?: string | null;
}

/** One record per launch listing the statistics keys the host exposes. Diagnostic only. */
export interface StatkeysRecord extends BaseRecord {
  k: 'statkeys';
  perf?: string[];
  game?: string[];
  net?: string[];
}

/**
 * One line per emitter-guard event in the exporter (v0.2+): a failure with its
 * consecutive count, or the catalog decision. Diagnostic only; the host's
 * Outcast.log proved unobservable, so these live in the Aurora log itself.
 */
export interface GuardRecord extends BaseRecord {
  k: 'guard';
  kind: string;
  n?: number;
  err?: string;
}

/** The three server statistics tables, keyed exactly as the engine names them. */
export interface StatTables {
  perf?: Record<string, number>;
  game?: Record<string, number>;
  net?: Record<string, number>;
}

export interface HbRecord extends BaseRecord {
  k: 'hb';
  /** Online count. v0.0 spells it `players`; the synthetic fixture used `np`. */
  players?: number;
  np?: number;
  /**
   * Revision 2: which clock fired this heartbeat. "tick" is OnTick + wall clock
   * and is the health feed; "gametime" pauses on an empty server (measured) and
   * must not become a health sample. A v0.0 heartbeat has no src at all.
   */
  src?: string;
  /** Revision 2: the statistics tables, with `Pool<...>` keys dropped by the exporter. */
  st?: StatTables;
  // The first hb of a launch also carries a settled re-probe of apis/events.
  apis?: Record<string, boolean>;
  events?: Record<string, boolean>;
}

export interface PosRecord extends BaseRecord {
  k: 'pos';
  u: string;
  x: number;
  y: number;
  z?: number;
  v?: number | null;
  /** Display name, online id: emitted, not stored (players.db owns the name). */
  n?: string;
  id?: number;
  /** Hours the current character has survived. */
  hs?: number;
  /** Access level ("None", "admin", ...). Stored, never public (027). */
  al?: string;
  /** The character's zombie kill counter (exporter 0.7.0): a non-negative integer or absent. */
  zk?: number;
}

export interface VehRecord extends BaseRecord {
  k: 'veh';
  id: number;
  /** Script name, as the exporter writes it (OA_Vehicles.lua). */
  s?: string;
  /** Script name under its old contract key, from logs written before exporter 0.2. */
  sc?: string;
  /** Vehicle type; emitted, not stored. */
  ty?: string;
  x: number;
  y: number;
  z?: number;
  d?: string | null;
  /**
   * The car's persistent save id (v:getSqlId()), stable across restarts, unlike
   * `id`. Exporter 0.3 and later; records from older logs have none.
   */
  q?: number;
  /**
   * DystopianVehicleClaim owner (modData.dvcOwner). Present while the car is
   * claimed; the empty string marks the record that reports a release.
   */
  o?: string;
}

export interface ShRecord extends BaseRecord {
  k: 'sh';
  /** SafeHouse.getId() is numeric in B42; older text said string. Both accepted. */
  id: string | number;
  x: number;
  y: number;
  w: number;
  h: number;
  o?: string;
  ti?: string;
  p?: string[];
  lv?: number;
  cr?: number;
}

export interface ZoneRecord extends BaseRecord {
  k: 'zone';
  kind: string;
  ti: string;
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
}

export interface ZgridRecord extends BaseRecord {
  k: 'zgrid';
  cx: number;
  cy: number;
  c: number;
}

export interface CatalogRecord extends BaseRecord {
  k: 'catalog';
  ft: string;
  dn?: string;
  cat?: string;
  w?: number;
  cv?: string;
}

export interface CatalogvRecord extends BaseRecord {
  k: 'catalogv';
  cv: string;
}

export interface LinkRecord extends BaseRecord {
  k: 'link';
  c: string;
  u: string;
}

/**
 * One NPC group (Project A-Life), exporter 0.4.0. `sen` marks a group that must
 * never reach the public map (raid, assassination, hunting a named player); the
 * ingest treats a record WITHOUT it as sensitive.
 */
export interface NpcRecord extends BaseRecord {
  k: 'npc';
  id: string;
  f?: string;
  fn?: string;
  st?: string;
  n?: number;
  x: number;
  y: number;
  z?: number;
  src?: string;
  act?: string;
  enc?: string;
  sen?: boolean;
}

export interface NpcGoneRecord extends BaseRecord {
  k: 'npcgone';
  id: string;
}

/** One A-Life outpost as an area. `hid` is the mod's mapHidden; a record without it is read as hidden. */
export interface NpcOutpostRecord extends BaseRecord {
  k: 'npco';
  id: string;
  f?: string;
  fn?: string;
  st?: string;
  hp?: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  z?: number;
  state?: string;
  hid?: boolean;
}

export interface NpcOutpostGoneRecord extends BaseRecord {
  k: 'npcogone';
  id: string;
}

/** One player death (exporter 0.5.0). `src` stays admin-only downstream; `hs` is hours survived. */
export interface DeathRecord extends BaseRecord {
  k: 'death';
  u: string;
  x: number;
  y: number;
  z?: number;
  src?: string;
  hs?: number;
}

/** Vehicle display names (exporter 0.5.1): [fullScriptName, displayName] pairs. */
export interface VnameRecord extends BaseRecord {
  k: 'vname';
  n: [string, string][];
}

/** The save's world id (exporter 0.6.0). `wn` true only on the boot that created the id. */
export interface WorldRecord extends BaseRecord {
  k: 'world';
  w: string;
  wn?: boolean;
  wa?: number;
  ws?: number;
}

/** One attributed zombie kill (exporter 0.7.0): the killer and where the zombie died. */
export interface KillRecord extends BaseRecord {
  k: 'kill';
  u: string;
  x: number;
  y: number;
  z?: number;
}

/** One faction of a `facs` record: name, tag ("" for none), owner, members (owner included). */
export interface FactionEntry {
  n: string;
  g?: string;
  o?: string;
  m: string[];
}

/** The full faction list (exporter 0.7.0). An empty `f` means every faction is disbanded. */
export interface FacsRecord extends BaseRecord {
  k: 'facs';
  f: FactionEntry[];
}

/** The exporter world id contract: 8-64 characters, letters, digits and dashes. */
export const WORLD_ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

export type AuroraRecord =
  | BootRecord
  | ProbeRecord
  | StatkeysRecord
  | GuardRecord
  | HbRecord
  | PosRecord
  | VehRecord
  | ShRecord
  | ZoneRecord
  | ZgridRecord
  | CatalogRecord
  | CatalogvRecord
  | LinkRecord
  | NpcRecord
  | NpcGoneRecord
  | NpcOutpostRecord
  | NpcOutpostGoneRecord
  | DeathRecord
  | VnameRecord
  | WorldRecord
  | KillRecord
  | FacsRecord;

export type ParseFailure =
  | 'not-aurora' // no A1 marker: someone else's log line
  | 'bad-json' // A1 present but the payload does not parse
  | 'unknown-kind' // parses, but `k` is not a kind this version knows
  | 'bad-shape'; // known kind, required field missing or wrong type

export type ParseResult =
  | { ok: true; record: AuroraRecord }
  | { ok: false; reason: ParseFailure; kind?: string };

// One or more `[...]` groups, then A1, then the JSON object, then an optional
// trailing period. The JSON capture is greedy so a `}` inside a string value
// does not truncate it.
const LINE = /^\s*(?:\[[^\]]*\]\s*)+A1\s+(\{.*\})\s*\.?\s*$/;

function isNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isStr(v: unknown): v is string {
  return typeof v === 'string';
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStatTables(v: unknown): v is StatTables {
  if (!isPlainObject(v)) return false;
  for (const name of ['perf', 'game', 'net']) {
    const table = v[name];
    if (table !== undefined && !isPlainObject(table)) return false;
  }
  return true;
}

function isFactionEntry(v: unknown): v is FactionEntry {
  return (
    isPlainObject(v) &&
    isStr(v.n) &&
    (v.g === undefined || isStr(v.g)) &&
    (v.o === undefined || isStr(v.o)) &&
    Array.isArray(v.m) &&
    v.m.every(isStr)
  );
}

/** A kill counter: a non-negative whole number. */
export function isKillCounter(v: unknown): v is number {
  return typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
}

/** Validate the kind-specific required fields. Optional fields are not policed. */
function checkShape(o: Record<string, unknown>): boolean {
  switch (o.k) {
    case 'boot':
    case 'probe':
    case 'statkeys':
      return true;
    case 'guard':
      return isStr(o.kind);
    case 'hb':
      // `st`, when present, must be an object of objects; a heartbeat whose
      // tables are malformed is rejected whole rather than half-mapped.
      return o.st === undefined || isStatTables(o.st);
    case 'pos':
      return isStr(o.u) && isNum(o.x) && isNum(o.y);
    case 'veh':
      return isNum(o.id) && isNum(o.x) && isNum(o.y);
    case 'sh':
      return (isStr(o.id) || isNum(o.id)) && isNum(o.x) && isNum(o.y) && isNum(o.w) && isNum(o.h);
    case 'zone':
      return isStr(o.kind) && isStr(o.ti) && isNum(o.x1) && isNum(o.y1);
    case 'zgrid':
      return isNum(o.cx) && isNum(o.cy) && isNum(o.c);
    case 'catalog':
      return isStr(o.ft);
    case 'catalogv':
      return isStr(o.cv);
    case 'link':
      return isStr(o.c) && isStr(o.u);
    case 'npc':
      return isStr(o.id) && o.id !== '' && isNum(o.x) && isNum(o.y);
    case 'death':
      return isStr(o.u) && o.u !== '' && isNum(o.x) && isNum(o.y);
    case 'vname':
      // The array must be there; a malformed PAIR inside it is dropped by the
      // row builder, not a reason to reject the whole record.
      return Array.isArray(o.n);
    case 'world':
      // A bad id is a shape failure (counted), never a world registration.
      return (
        isStr(o.w) &&
        WORLD_ID_PATTERN.test(o.w) &&
        (o.wn === undefined || typeof o.wn === 'boolean') &&
        (o.wa === undefined || isNum(o.wa)) &&
        (o.ws === undefined || isNum(o.ws))
      );
    case 'kill':
      return isStr(o.u) && o.u !== '' && isNum(o.x) && isNum(o.y);
    case 'facs':
      // Strict: the record replaces the whole list downstream, so one malformed
      // faction rejects the record (the stored list stays) rather than deleting it.
      return Array.isArray(o.f) && o.f.every(isFactionEntry);
    case 'npcgone':
    case 'npcogone':
      return isStr(o.id) && o.id !== '';
    case 'npco':
      return isStr(o.id) && o.id !== '' && isNum(o.x1) && isNum(o.y1) && isNum(o.x2) && isNum(o.y2);
    default:
      return false;
  }
}

/** Full result including why a line was rejected. Used for ingest counters. */
export function parseLineDetailed(line: string): ParseResult {
  const m = LINE.exec(line);
  if (!m) return { ok: false, reason: 'not-aurora' };

  let parsed: unknown;
  try {
    parsed = JSON.parse(m[1]);
  } catch {
    return { ok: false, reason: 'bad-json' };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ok: false, reason: 'bad-json' };
  }

  const o = parsed as Record<string, unknown>;
  if (!isStr(o.k) || !(KINDS as readonly string[]).includes(o.k)) {
    return { ok: false, reason: 'unknown-kind', kind: isStr(o.k) ? o.k : undefined };
  }
  if (!isNum(o.t)) return { ok: false, reason: 'bad-shape', kind: o.k };
  if (!checkShape(o)) return { ok: false, reason: 'bad-shape', kind: o.k };
  // An unusable kill counter is dropped, never a reason to lose the position.
  if (o.k === 'pos' && o.zk !== undefined && !isKillCounter(o.zk)) delete o.zk;

  return { ok: true, record: o as unknown as AuroraRecord };
}

/** Convenience form named by the T08 task: a record, or null if unusable. */
export function parseLine(line: string): AuroraRecord | null {
  const r = parseLineDetailed(line);
  return r.ok ? r.record : null;
}

export interface SplitStats {
  lines: number;
  parsed: number;
  notAurora: number;
  badJson: number;
  badShape: number;
  unknownKind: Record<string, number>;
}

export function emptyStats(): SplitStats {
  return { lines: 0, parsed: 0, notAurora: 0, badJson: 0, badShape: 0, unknownKind: {} };
}

export interface SplitResult {
  records: AuroraRecord[];
  carry: string;
  stats: SplitStats;
}

/**
 * Split a text chunk into records, carrying an unterminated trailing line over to
 * the next call. `carry` from the previous call is prepended.
 *
 * A chunk that does not end in a newline ends mid-line, so that fragment becomes
 * the new carry and is NOT parsed. Callers that have reached end-of-file and want
 * the final unterminated line must pass it back in a last call ending in "\n".
 */
export function splitLines(chunk: string, carry = '', stats = emptyStats()): SplitResult {
  const text = carry + chunk;
  const parts = text.split('\n');
  const nextCarry = parts.pop() ?? '';
  const records: AuroraRecord[] = [];

  for (const raw of parts) {
    const line = raw.endsWith('\r') ? raw.slice(0, -1) : raw;
    if (line.trim() === '') continue;
    stats.lines++;
    const r = parseLineDetailed(line);
    if (r.ok) {
      stats.parsed++;
      records.push(r.record);
      continue;
    }
    switch (r.reason) {
      case 'not-aurora':
        stats.notAurora++;
        break;
      case 'bad-json':
        stats.badJson++;
        break;
      case 'bad-shape':
        stats.badShape++;
        break;
      case 'unknown-kind': {
        const key = r.kind ?? '(missing)';
        stats.unknownKind[key] = (stats.unknownKind[key] ?? 0) + 1;
        break;
      }
    }
  }

  return { records, carry: nextCarry, stats };
}

const LF = 0x0a;

export interface ChunkResult {
  records: AuroraRecord[];
  carry: Uint8Array;
  stats: SplitStats;
}

/**
 * Byte-safe variant for the SFTP tail.
 *
 * A range read can split a multi-byte UTF-8 character across chunk boundaries,
 * and decoding each chunk independently would turn that character into a
 * replacement character permanently. So the carry here is BYTES, not text: only
 * the portion up to the last newline is decoded, and everything after it is
 * handed back untouched for the next call. This matters because PZ usernames are
 * free text and are routinely non-ASCII.
 */
export function splitChunkBytes(
  chunk: Uint8Array,
  carry: Uint8Array = new Uint8Array(0),
  stats = emptyStats(),
): ChunkResult {
  const buf = new Uint8Array(carry.length + chunk.length);
  buf.set(carry, 0);
  buf.set(chunk, carry.length);

  let lastNl = -1;
  for (let i = buf.length - 1; i >= 0; i--) {
    if (buf[i] === LF) {
      lastNl = i;
      break;
    }
  }
  if (lastNl === -1) {
    return { records: [], carry: buf, stats };
  }

  const text = new TextDecoder().decode(buf.subarray(0, lastNl + 1));
  const out = splitLines(text, '', stats);
  // `text` ends in a newline, so splitLines leaves an empty string carry.
  return { records: out.records, carry: buf.slice(lastNl + 1), stats: out.stats };
}
