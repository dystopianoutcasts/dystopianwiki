// Pure parser and row builder for the DystopianVehicleClaim ledger, read over the
// same SFTP session as players.db (supabase/functions/aurora-ingest). No I/O here.
//
//   server-data/Lua/DVC/Claims/vehicles.txt
//
// The mod (DVC_Claims.lua) rewrites the WHOLE file on every claim, release or
// permission change: one line per claim, pipe separated, sorted, each line ended
// by "\n":
//
//   C|owner|sqlId|script|name|x|y|epoch|enter|container|service|faction|cond|fuel|
//   batt|engine|allowEnter|allowContainer|allowService|claimedAt|...
//
// Only the first eight fields and claimedAt (the 20th) are used. `epoch` is the
// time DVC last saw the car loaded, claimedAt the time of the claim, both seconds
// since 1970 (getTimestamp). Older ledgers have no claimedAt; DVC itself then
// falls back to epoch, and so does this.
//
// What can go wrong, and the rule for each:
//
// - A READ CAUGHT MID-WRITE. The file is truncated and rewritten, so a read can
//   see it empty or cut anywhere. A text that does not end in a newline is cut
//   (DVC always ends its last line with one), and `complete` says so; a cut read
//   changes nothing. A read cut exactly at a line boundary, or an empty file (what
//   a truncate looks like), looks complete and is not detectable here. So the
//   ingest counts CONSECUTIVE complete reads that miss a claim
//   (aurora.release_missing_claims, miss_count) and deletes at CLAIMS_MISS_LIMIT.
//   An empty complete file is a read with no claims present: one miss for every
//   claim, three in a row release them all (so the last claim on a server can be
//   released), and a non-empty read in between starts the count over. Time does
//   not count: after an outage the first read back is one read, not three
//   minutes' worth.
// - A MALFORMED LINE. Skipped and counted: wrong tag, an owner DVC would refuse,
//   a sql id that is not a positive whole number, or a position that is not a
//   number (which is also what a line looks like when a stray pipe has shifted
//   its fields). DVC replaces pipes and control characters in the free-text name
//   with a space and refuses them in an owner, so a well-formed line never has an
//   extra pipe.
//
// Tests: claims.test.ts.

import { type Row, tagRows } from './ingest-core.ts';

export interface LedgerClaim {
  /** The claiming account (DVC's nameOk: 1-48 characters, no control characters, pipes or commas). */
  owner: string;
  /** The car's persistent save id (vehicle:getSqlId()). */
  sqlId: number;
  /** The script's full name, "Base.CarNormal". */
  script: string;
  /** DVC's short label for the car. */
  name: string;
  x: number;
  y: number;
  /** When DVC last saw the car loaded, epoch seconds; null when the ledger says 0. */
  lastSeen: number | null;
  /** When the claim was made, epoch seconds; null when unknown. */
  claimedAt: number | null;
}

export interface LedgerParse {
  claims: LedgerClaim[];
  /** Non-blank lines that were not usable claims. */
  skipped: number;
  /**
   * False when the text is non-empty and does not end in a newline: the read was
   * cut. The claims before the cut are still returned and still good; the cut
   * line itself is dropped.
   */
  complete: boolean;
}

/** DVC.nameOk, as the ledger writer enforces it for an owner. */
function ownerOk(name: string): boolean {
  return name !== '' && name.length <= 48 && !/[\u0000-\u001f\u007f|,]/.test(name);
}

function wholeNumber(field: string | undefined): number | null {
  if (field === undefined || !/^-?\d+(\.\d+)?$/.test(field.trim())) return null;
  const n = Number(field);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/** A sql id: digits only, so "12.7" or "-5" or "1e3" is not one. */
function sqlIdOf(field: string | undefined): number | null {
  if (field === undefined || !/^\d+$/.test(field)) return null;
  const n = Number(field);
  return Number.isSafeInteger(n) ? n : null;
}

/** Epoch seconds, or null for a missing, zero or negative stamp. */
function stamp(field: string | undefined): number | null {
  const n = wholeNumber(field);
  return n !== null && n > 0 ? n : null;
}

export function parseClaimsLedger(text: string): LedgerParse {
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const complete = body === '' || body.endsWith('\n');
  const bySql = new Map<number, LedgerClaim>();
  let skipped = 0;

  const lines = body.split('\n');
  // A cut read ends mid-line: that last piece may still parse as a claim with a
  // shortened number in it, so it is dropped rather than trusted.
  const cut = complete ? undefined : lines.pop();
  if (cut !== undefined && cut.trim() !== '') skipped++;

  for (const raw of lines) {
    const line = raw.endsWith('\r') ? raw.slice(0, -1) : raw;
    if (line.trim() === '') continue;
    const f = line.split('|');
    const sqlId = sqlIdOf(f[2]);
    const x = wholeNumber(f[5]);
    const y = wholeNumber(f[6]);
    if (
      f[0] !== 'C' || f.length < 8 || !ownerOk(f[1]) || sqlId === null || sqlId <= 0 || x === null || y === null
    ) {
      skipped++;
      continue;
    }
    const lastSeen = stamp(f[7]);
    // A later line for the same car wins, as DVC's own load does (bySqlId).
    bySql.set(sqlId, {
      owner: f[1],
      sqlId,
      script: f[3] ?? '',
      name: f[4] ?? '',
      x,
      y,
      lastSeen,
      claimedAt: stamp(f[19]) ?? lastSeen,
    });
  }
  return { claims: [...bySql.values()], skipped, complete };
}

/** Epoch seconds -> ISO timestamp, null stays null. */
function isoOrNull(seconds: number | null): string | null {
  return seconds === null ? null : new Date(seconds * 1000).toISOString();
}

/**
 * Rows for aurora.vehicle_claims. `syncedAt` is the run's own timestamp: the
 * stamp that says "found in the ledger at this run" (and the `t` the public view
 * shows). miss_count 0: a claim that is in the file has missed nothing.
 */
export function buildClaimRows(
  claims: LedgerClaim[],
  serverId: string,
  syncedAt: string,
  worldId: string | null = null,
): Row[] {
  // world_id (032) on every row when the run has a current world, on none otherwise.
  return tagRows(claims.map((c): Row => ({
    server_id: serverId,
    sql_id: c.sqlId,
    owner: c.owner,
    script: c.script === '' ? null : c.script,
    name: c.name === '' ? null : c.name,
    x: c.x,
    y: c.y,
    claimed_at: isoOrNull(c.claimedAt),
    last_seen: isoOrNull(c.lastSeen),
    synced_at: syncedAt,
    miss_count: 0,
  })), worldId);
}

/** A claim is released when this many consecutive trusted reads did not contain it. */
export const CLAIMS_MISS_LIMIT = 3;

/**
 * May this read count as evidence about which claims exist? Any complete read,
 * an empty file included: it is one miss for every claim, never a release by
 * itself. A cut read (no trailing newline) is not trusted and changes nothing.
 */
export function claimsReadTrusted(parsed: LedgerParse): boolean {
  return parsed.complete;
}

/** What the claims step reports, for the prune decision and the run summary. */
export interface ClaimsOutcome {
  trusted: boolean;
  released: number;
}

/**
 * Is this read error "the ledger file does not exist"? ssh2 reports SFTP status 2
 * as the message "No such file"; sftp.ts wraps it as "SFTP stat <path>: No such
 * file", so the message is what survives. A missing file means no ledger exists
 * on this host (DVC not installed, or AURORA_CLAIMS_FILE points nowhere): there
 * is no claims information, which is not the same as an unreadable one.
 */
export function isLedgerMissing(err: unknown): boolean {
  return /no such file|enoent/i.test(String(err));
}

/**
 * Should the stale-vehicle prune run this run?
 *
 * - A trusted read that released nothing: yes.
 * - A ledger that does not exist (`ledgerMissing`): yes. Nothing is released, and
 *   the prune never deletes a car claimed in the table or on its row, so a host
 *   with no ledger still gets its restart duplicates cleaned up.
 * - Any other failure (null outcome), an untrusted (cut) read, or a read that
 *   released anything: no. Prune deletes rows for good, and it must never act on
 *   a ledger state that was just in doubt or just changed.
 */
export function shouldPrune(claims: ClaimsOutcome | null, ledgerMissing = false): boolean {
  if (ledgerMissing) return true;
  return claims !== null && claims.trusted && claims.released === 0;
}
