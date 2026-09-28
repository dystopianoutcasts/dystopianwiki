// Run with: deno test packages/shared/aurora/parser.test.ts
import {
  emptyStats,
  launchStampFromFileName,
  parseLine,
  parseLineDetailed,
  splitChunkBytes,
  splitLines,
} from './parser.ts';

function assertEquals<T>(actual: T, expected: T, msg = ''): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} expected ${e} got ${a}`);
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

const P1 = '[28-09-26 03:06:11.412]';
const P2 = '[28-09-26 03:06:11.412] [ 09:14]';

Deno.test('parses a one-bracket prefix with a trailing period', () => {
  const rec = parseLine(`${P1} A1 {"k":"pos","t":1759000000000,"u":"Raxdeg","x":10,"y":20}.`);
  assertEquals(rec?.k, 'pos');
  assertEquals((rec as { u: string }).u, 'Raxdeg');
});

Deno.test('parses the two-bracket prefix the T02 spike actually observed', () => {
  const rec = parseLine(`${P2} A1 {"k":"pos","t":1759000000000,"u":"Raxdeg","x":10,"y":20}.`);
  assertEquals(rec?.k, 'pos');
});

Deno.test('parses without the trailing period', () => {
  const rec = parseLine(`${P1} A1 {"k":"hb","t":1759000000000,"np":3}`);
  assertEquals(rec?.k, 'hb');
});

Deno.test('a brace inside a string value does not truncate the JSON', () => {
  const rec = parseLine(`${P1} A1 {"k":"catalog","t":1,"ft":"Base.Odd}Item","dn":"a}b"}.`);
  assertEquals((rec as { ft: string }).ft, 'Base.Odd}Item');
});

Deno.test('a line without the A1 marker is not ours', () => {
  const r = parseLineDetailed(`${P2} player Raxdeg connected`);
  assertEquals(r.ok, false);
  assertEquals((r as { reason: string }).reason, 'not-aurora');
});

Deno.test('malformed JSON is reported as bad-json, not thrown', () => {
  const r = parseLineDetailed(`${P1} A1 {"k":"pos","t":1,`);
  assertEquals(r.ok, false);
  // No closing brace, so the line regex never matches: still a clean rejection.
  assert(!r.ok, 'must not parse');
});

Deno.test('a truncated-but-braced payload is bad-json', () => {
  const r = parseLineDetailed(`${P1} A1 {"k":"pos" "t":1}`);
  assertEquals(r.ok, false);
  assertEquals((r as { reason: string }).reason, 'bad-json');
});

Deno.test('an unknown kind is reported with its name so it can be counted', () => {
  const r = parseLineDetailed(`${P1} A1 {"k":"economy","t":1,"foo":2}.`);
  assertEquals(r.ok, false);
  assertEquals((r as { reason: string; kind: string }).reason, 'unknown-kind');
  assertEquals((r as { kind: string }).kind, 'economy');
});

Deno.test('a known kind missing a required field is bad-shape', () => {
  const r = parseLineDetailed(`${P1} A1 {"k":"pos","t":1,"u":"Raxdeg","x":10}.`);
  assertEquals(r.ok, false);
  assertEquals((r as { reason: string }).reason, 'bad-shape');
});

Deno.test('a non-numeric t is rejected even when the rest is valid', () => {
  const r = parseLineDetailed(`${P1} A1 {"k":"pos","t":"now","u":"a","x":1,"y":2}.`);
  assertEquals(r.ok, false);
  assertEquals((r as { reason: string }).reason, 'bad-shape');
});

Deno.test('splitLines carries an unterminated trailing line to the next call', () => {
  const stats = emptyStats();
  const a = splitLines(`${P1} A1 {"k":"hb","t":1}.\n${P1} A1 {"k":"hb","t":2`, '', stats);
  assertEquals(a.records.length, 1);
  assert(a.carry.includes('"t":2'), 'partial line must be carried');

  const b = splitLines('}.\n', a.carry, stats);
  assertEquals(b.records.length, 1);
  assertEquals(b.records[0].t, 2);
  assertEquals(b.carry, '');
  assertEquals(stats.parsed, 2);
});

Deno.test('CRLF line endings are handled', () => {
  const out = splitLines(`${P1} A1 {"k":"hb","t":1}.\r\n`);
  assertEquals(out.records.length, 1);
});

Deno.test('blank lines are skipped and not counted', () => {
  const stats = emptyStats();
  splitLines(`\n\n${P1} A1 {"k":"hb","t":1}.\n\n`, '', stats);
  assertEquals(stats.lines, 1);
  assertEquals(stats.parsed, 1);
});

Deno.test('stats tally each rejection reason separately', () => {
  const stats = emptyStats();
  splitLines(
    [
      `${P1} A1 {"k":"hb","t":1}.`,
      `${P2} some other log line`,
      `${P1} A1 {"k":"economy","t":1}.`,
      `${P1} A1 {"k":"economy","t":2}.`,
      `${P1} A1 {"k":"pos","t":1,"u":"a"}.`,
      '',
    ].join('\n'),
    '',
    stats,
  );
  assertEquals(stats.parsed, 1);
  assertEquals(stats.notAurora, 1);
  assertEquals(stats.badShape, 1);
  assertEquals(stats.unknownKind, { economy: 2 });
});

Deno.test('splitChunkBytes does not corrupt a multi-byte name split across chunks', () => {
  const line = `${P1} A1 {"k":"pos","t":1,"u":"José","x":1,"y":2}.\n`;
  const bytes = new TextEncoder().encode(line);

  // Cut inside the two-byte encoding of the accented character.
  const cut = bytes.indexOf(0xc3) + 1;
  assert(cut > 0, 'fixture must contain a two-byte character');

  const first = splitChunkBytes(bytes.subarray(0, cut));
  assertEquals(first.records.length, 0);

  const second = splitChunkBytes(bytes.subarray(cut), first.carry);
  assertEquals(second.records.length, 1);
  assertEquals((second.records[0] as { u: string }).u, 'José');
});

Deno.test('splitChunkBytes returns everything as carry when no newline is present', () => {
  const out = splitChunkBytes(new TextEncoder().encode('partial line with no newline'));
  assertEquals(out.records.length, 0);
  assertEquals(out.carry.length, 28);
});

// --- the shapes the shipped v0.0 exporter really emits ---------------------
// Copied from OutcastAurora's own test harness output (OutcastMods 9aad789),
// not from the task text. These are the only OBSERVED records that exist; the
// rest of the contract above is still defined rather than measured.

const V0 = '[28-09-26 03:06:11.412]';

Deno.test('v0.0 boot parses with its real field names', () => {
  const line = `${V0} A1 {"apis":{"getOnlinePlayers":true,"getGameLocal":false},` +
    `"events":{"EveryOneMinute":true},"k":"boot","players":2,"schema":1,` +
    `"t":1759000000000,"v":"0.0.0"}.`;
  const rec = parseLine(line) as { k: string; v: string; apis: Record<string, boolean> };
  assertEquals(rec?.k, 'boot');
  assertEquals(rec.v, '0.0.0');
  assertEquals(rec.apis.getOnlinePlayers, true);
  assertEquals(rec.apis.getGameLocal, false, 'an absent api must survive as false, not vanish');
});

Deno.test('v0.0 probe is a known kind, not an unknown one', () => {
  const r = parseLineDetailed(`${V0} A1 {"fileWriter":true,"k":"probe","t":1759000000000}.`);
  assertEquals(r.ok, true);
});

Deno.test('v0.0 hb parses, including the settled re-probe on the first one', () => {
  const line = `${V0} A1 {"apis":{"getCell().getVehicles":true},"events":{"OnTick":true},` +
    `"k":"hb","players":2,"t":1759000000000}.`;
  const rec = parseLine(line) as { k: string; players: number; apis: Record<string, boolean> };
  assertEquals(rec?.k, 'hb');
  assertEquals(rec.players, 2);
  assertEquals(rec.apis['getCell().getVehicles'], true);
});

// --- revision 2 shapes (T08 rev 2 / T09 contract) --------------------------

Deno.test('a revision 2 hb parses with src and the three statistics tables', () => {
  const line = `${V0} A1 {"k":"hb","players":1,"src":"tick","st":{"game":{"players":1,"zombies-total":40},` +
    `"net":{"sent-bps":10},"perf":{"fps":104,"min-update-period":98}},"t":1759000000000}.`;
  const rec = parseLine(line) as { src: string; st: { perf: Record<string, number>; game: Record<string, number> } };
  assertEquals(rec.src, 'tick');
  assertEquals(rec.st.perf.fps, 104);
  assertEquals(rec.st.game['zombies-total'], 40);
});

Deno.test('an hb whose st is not an object of objects is bad-shape, not half-mapped', () => {
  for (const st of ['5', '[1]', '{"perf":7}']) {
    const r = parseLineDetailed(`${V0} A1 {"k":"hb","t":1,"src":"tick","st":${st}}.`);
    assertEquals(r.ok, false, `st=${st} must be rejected`);
    assertEquals((r as { reason: string }).reason, 'bad-shape');
  }
});

Deno.test('statkeys is a known diagnostic kind', () => {
  const r = parseLineDetailed(`${V0} A1 {"game":["players"],"k":"statkeys","net":[],"perf":["fps"],"t":1}.`);
  assertEquals(r.ok, true);
  assertEquals((r as { record: { k: string } }).record.k, 'statkeys');
});

Deno.test('the launch stamp is read from the log file name', () => {
  assertEquals(launchStampFromFileName('2026-09-28_21-10_Aurora.txt'), '2026-09-28_21-10');
  assertEquals(launchStampFromFileName('server-data/Logs/2026-09-28_21-10_Aurora.txt'), '2026-09-28_21-10');
  assertEquals(launchStampFromFileName('2026-09-28_21-10_DebugLog-server.txt'), null);
  assertEquals(launchStampFromFileName('aurora-sample.txt'), null);
});
