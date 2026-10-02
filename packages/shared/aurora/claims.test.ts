// Run with: deno test packages/shared/aurora/claims.test.ts
import {
  buildClaimRows,
  CLAIMS_MISS_LIMIT,
  claimsReadTrusted,
  isLedgerMissing,
  parseClaimsLedger,
  shouldPrune,
} from './claims.ts';

function assertEquals<T>(actual: T, expected: T, msg = ''): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} expected ${e} got ${a}`);
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

interface LineOpts {
  owner?: string;
  sql?: string;
  script?: string;
  name?: string;
  x?: string;
  y?: string;
  epoch?: string;
  claimedAt?: string;
}

// The shape DVC_Claims.lua save() writes: 32 fields, the late optional ones empty.
function line(o: LineOpts = {}): string {
  const f = [
    'C', o.owner ?? 'alice', o.sql ?? '4242', o.script ?? 'Base.CarNormal', o.name ?? 'CarNormal',
    o.x ?? '10500', o.y ?? '9800', o.epoch ?? '1759406400',
    '1', '1', '0', '0', '', '', '', '', '', '', '', o.claimedAt ?? '1759000000',
    '', '', '', '', '', '', '', '', '', '', '', '',
  ];
  return f.join('|');
}

Deno.test('a full ledger line is read into typed fields', () => {
  const p = parseClaimsLedger(line() + '\n');
  assertEquals(p.complete, true);
  assertEquals(p.skipped, 0);
  assertEquals(p.claims, [{
    owner: 'alice',
    sqlId: 4242,
    script: 'Base.CarNormal',
    name: 'CarNormal',
    x: 10500,
    y: 9800,
    lastSeen: 1759406400,
    claimedAt: 1759000000,
  }]);
  assertEquals(typeof p.claims[0].sqlId, 'number');
});

Deno.test('an empty file is a complete read of zero claims', () => {
  assertEquals(parseClaimsLedger(''), { claims: [], skipped: 0, complete: true });
  assertEquals(parseClaimsLedger('\n\n').claims.length, 0);
});

Deno.test('malformed lines are skipped and counted, good lines around them survive', () => {
  const text = [
    line({ owner: 'a', sql: '1' }),
    'garbage',
    'X|bob|2|Base.Van|Van|1|2|3',
    line({ owner: 'c', sql: 'abc' }),
    line({ owner: 'd', sql: '0' }),
    line({ owner: 'e', sql: '-5' }),
    line({ owner: '', sql: '6' }),
    line({ owner: 'f', sql: '7', x: 'north' }),
    'C|short|8|Base.Van',
    line({ owner: 'g', sql: '9' }),
  ].join('\n') + '\n';
  const p = parseClaimsLedger(text);
  assertEquals(p.claims.map((c) => c.owner), ['a', 'g']);
  assertEquals(p.skipped, 8);
  assertEquals(p.complete, true);
});

Deno.test('an owner DVC would refuse is skipped', () => {
  const p = parseClaimsLedger([
    line({ owner: 'x'.repeat(49), sql: '1' }),
    line({ owner: 'a,b', sql: '2' }),
    line({ owner: 'ok name', sql: '3' }),
  ].join('\n') + '\n');
  assertEquals(p.claims.map((c) => c.sqlId), [3]);
});

Deno.test('a stray pipe shifts the fields and the line is skipped, not misread', () => {
  // DVC replaces pipes in the name, so this cannot be written; if one ever got in,
  // x would read as text and the line must not survive as a claim at a wrong place.
  const shifted = 'C|alice|4242|Base.CarNormal|Car|Normal|10500|9800|1759406400|1|1|0|0';
  assertEquals(parseClaimsLedger(shifted + '\n').claims.length, 0);
});

Deno.test('a name DVC sanitized (pipes became spaces) keeps every later field in place', () => {
  const p = parseClaimsLedger(line({ name: 'Old  Truck, a "good" one' }) + '\n');
  assertEquals(p.claims[0].name, 'Old  Truck, a "good" one');
  assertEquals(p.claims[0].x, 10500);
  assertEquals(p.claims[0].lastSeen, 1759406400);
});

Deno.test('an owner with spaces or non-ASCII letters is kept as written', () => {
  const p = parseClaimsLedger(line({ owner: 'Zoë Mañ' }) + '\n');
  assertEquals(p.claims[0].owner, 'Zoë Mañ');
});

Deno.test('a read cut mid-line is incomplete and the cut line is dropped', () => {
  const whole = line({ owner: 'a', sql: '1' }) + '\n' + line({ owner: 'b', sql: '2' });
  // Cut inside the second line, after enough fields that it would still parse.
  const p = parseClaimsLedger(whole.slice(0, whole.length - 40));
  assertEquals(p.complete, false);
  assertEquals(p.claims.map((c) => c.owner), ['a']);
  assertEquals(p.skipped, 1);
});

Deno.test('a read cut exactly at a newline is complete and merely short', () => {
  const p = parseClaimsLedger(line({ owner: 'a', sql: '1' }) + '\n');
  assertEquals(p.complete, true);
  assertEquals(p.claims.length, 1);
});

Deno.test('older ledgers without claimedAt fall back to the last-seen stamp', () => {
  const old = 'C|bob|77|Base.Van|Van|1|2|1759406400|1|1|0|0';
  const p = parseClaimsLedger(old + '\n');
  assertEquals(p.claims[0].claimedAt, 1759406400);
  assertEquals(p.claims[0].lastSeen, 1759406400);
});

Deno.test('a zero stamp is null, not 1970', () => {
  const p = parseClaimsLedger(line({ epoch: '0', claimedAt: '0' }) + '\n');
  assertEquals(p.claims[0].lastSeen, null);
  assertEquals(p.claims[0].claimedAt, null);
});

Deno.test('CRLF and a byte order mark are tolerated', () => {
  const p = parseClaimsLedger('﻿' + line({ sql: '1' }) + '\r\n' + line({ sql: '2' }) + '\r\n');
  assertEquals(p.claims.map((c) => c.sqlId), [1, 2]);
  assertEquals(p.complete, true);
});

Deno.test('the same sql id twice keeps the later line', () => {
  const p = parseClaimsLedger(line({ owner: 'old', sql: '5' }) + '\n' + line({ owner: 'new', sql: '5' }) + '\n');
  assertEquals(p.claims.map((c) => c.owner), ['new']);
});

Deno.test('rows carry the server, the typed columns, ISO times and the run stamp', () => {
  const p = parseClaimsLedger(line() + '\n' + line({ sql: '9', name: '', epoch: '0' }) + '\n');
  const rows = buildClaimRows(p.claims, 'srv', '2026-10-02T12:00:00.000Z');
  assertEquals(rows[0], {
    server_id: 'srv',
    sql_id: 4242,
    owner: 'alice',
    script: 'Base.CarNormal',
    name: 'CarNormal',
    x: 10500,
    y: 9800,
    claimed_at: '2025-09-27T19:06:40.000Z',
    last_seen: '2025-10-02T12:00:00.000Z',
    synced_at: '2026-10-02T12:00:00.000Z',
    miss_count: 0,
  });
  assertEquals(rows[1].name, null);
  assertEquals(rows[1].last_seen, null);
  assertEquals(Object.keys(rows[0]), Object.keys(rows[1]), 'PostgREST needs identical keys per row');
});

Deno.test('rows start with miss_count 0, so a claim in the file has missed nothing', () => {
  const rows = buildClaimRows(parseClaimsLedger(line() + '\n').claims, 'srv', '2026-10-02T12:00:00.000Z');
  assertEquals(rows[0].miss_count, 0);
});

Deno.test('three trusted misses release; the limit is a count of reads, not minutes', () => {
  assertEquals(CLAIMS_MISS_LIMIT, 3);
});

Deno.test('an empty complete file is a trusted read with no claims present', () => {
  const empty = parseClaimsLedger('');
  assertEquals(empty.complete, true);
  assertEquals(empty.claims.length, 0);
  assertEquals(claimsReadTrusted(empty), true, 'one miss per claim, counted by the database; never a release alone');
  assertEquals(claimsReadTrusted(parseClaimsLedger('\n')), true);
});

Deno.test('a complete non-empty read is trusted, a cut one is not', () => {
  assertEquals(claimsReadTrusted(parseClaimsLedger(line() + '\n')), true);
  const cut = parseClaimsLedger(line({ sql: '1' }) + '\n' + line({ sql: '2' }).slice(0, 30));
  assertEquals(claimsReadTrusted(cut), false);
});

Deno.test('prune is skipped when the claims step failed, was untrusted, or released anything', () => {
  assertEquals(shouldPrune(null), false);
  assertEquals(shouldPrune({ trusted: false, released: 0 }), false);
  assertEquals(shouldPrune({ trusted: true, released: 2 }), false);
  assertEquals(shouldPrune({ trusted: true, released: 0 }), true);
});

Deno.test('a missing ledger file allows the prune and releases nothing', () => {
  const err = new Error('SFTP stat server-data/Lua/DVC/Claims/vehicles.txt: No such file');
  assertEquals(isLedgerMissing(err), true);
  // The claims step threw, so there is no outcome and nothing was released.
  assertEquals(shouldPrune(null, isLedgerMissing(err)), true);
});

Deno.test('any other read error blocks the prune', () => {
  for (const msg of ['SFTP stat x: Permission denied', 'SFTP read x: connection lost', 'x is 9999999 bytes, over the limit']) {
    const err = new Error(msg);
    assertEquals(isLedgerMissing(err), false, msg);
    assertEquals(shouldPrune(null, isLedgerMissing(err)), false, msg);
  }
});

Deno.test('a missing file never lets an untrusted or releasing outcome through by itself', () => {
  assertEquals(shouldPrune({ trusted: false, released: 0 }), false);
  assertEquals(shouldPrune({ trusted: true, released: 1 }), false);
});

Deno.test('a sql id is digits only: a decimal, a sign or an exponent is skipped', () => {
  const p = parseClaimsLedger([
    line({ owner: 'a', sql: '12.7' }),
    line({ owner: 'b', sql: '+5' }),
    line({ owner: 'c', sql: '1e3' }),
    line({ owner: 'd', sql: ' 7' }),
    line({ owner: 'e', sql: '12' }),
  ].join('\n') + '\n');
  assertEquals(p.claims.map((c) => c.sqlId), [12]);
  assertEquals(p.skipped, 4);
});
