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

Deno.test('guard is a known diagnostic kind that needs its emitter kind (T17)', () => {
  const ok = parseLineDetailed(`${V0} A1 {"err":"java.lang.IndexOutOfBoundsException","k":"guard","kind":"zgrid","n":1,"t":1}.`);
  assertEquals(ok.ok, true);
  assertEquals((ok as { record: { k: string; kind: string } }).record.kind, 'zgrid');
  const bad = parseLineDetailed(`${V0} A1 {"k":"guard","n":1,"t":1}.`);
  assertEquals(bad.ok, false);
});

Deno.test('the launch stamp is read from the log file name', () => {
  assertEquals(launchStampFromFileName('2026-09-28_21-10_Aurora.txt'), '2026-09-28_21-10');
  assertEquals(launchStampFromFileName('server-data/Logs/2026-09-28_21-10_Aurora.txt'), '2026-09-28_21-10');
  assertEquals(launchStampFromFileName('2026-09-28_21-10_DebugLog-server.txt'), null);
  assertEquals(launchStampFromFileName('aurora-sample.txt'), null);
});

// ---- record contract, as the v0.1 exporter actually writes it (T09 "Record shapes") ----
// These are the exporter's field names, not the parser's earlier guesses: the parser
// follows the producer. Each line below is in the engine's exact `[stamp] A1 {json}.` form.

Deno.test('sh: numeric id from SafeHouse.getId(), created in `cr`', () => {
  const rec = parseLine(`${P1} A1 {"k":"sh","t":1,"id":7,"x":10,"y":20,"w":5,"h":6,"o":"alice","ti":"Home","p":["alice","bob"],"lv":100,"cr":50}.`);
  assert(rec !== null && rec.k === 'sh', 'sh parses with a numeric id');
  if (rec && rec.k === 'sh') assertEquals([rec.id, rec.cr], [7, 50]);
  assert(parseLine(`${P1} A1 {"k":"sh","t":1,"id":"7","x":10,"y":20,"w":5,"h":6}.`) !== null, 'a string id is still accepted');
});

Deno.test('zone: kind is `kind`', () => {
  const rec = parseLine(`${P1} A1 {"k":"zone","t":1,"kind":"nonpvp","ti":"Spawn","x1":1,"y1":2,"x2":3,"y2":4}.`);
  assert(rec !== null && rec.k === 'zone' && rec.kind === 'nonpvp', 'zone parses with kind');
  assertEquals(parseLineDetailed(`${P1} A1 {"k":"zone","t":1,"kd":"nonpvp","ti":"Spawn","x1":1,"y1":2}.`).ok, false, 'the old kd name is rejected');
});

Deno.test('zgrid: count is `c`', () => {
  const rec = parseLine(`${P1} A1 {"k":"zgrid","t":1,"cx":42,"cy":40,"c":17}.`);
  assert(rec !== null && rec.k === 'zgrid' && rec.c === 17, 'zgrid parses with c');
  assertEquals(parseLineDetailed(`${P1} A1 {"k":"zgrid","t":1,"cx":42,"cy":40,"n":17}.`).ok, false, 'the old n name is rejected');
});

Deno.test('catalog: weight is `w`; catalogv is a known kind carrying only cv', () => {
  const rec = parseLine(`${P1} A1 {"k":"catalog","t":1,"ft":"Base.Axe","dn":"Axe","cat":"Weapon","w":3,"cv":"abc"}.`);
  assert(rec !== null && rec.k === 'catalog' && rec.w === 3, 'catalog parses with w');
  const v = parseLineDetailed(`${P1} A1 {"k":"catalogv","t":1,"cv":"abc"}.`);
  assert(v.ok, 'catalogv is known');
  assertEquals(parseLineDetailed(`${P1} A1 {"k":"catalogv","t":1}.`).ok, false, 'catalogv without cv is a bad shape, not unknown');
});

Deno.test('veh records keep the persistent id q and the claim owner o, and old ones still parse', () => {
  const next = parseLine(`${P1} A1 {"k":"veh","t":1759000000000,"id":9,"q":4242,"x":1,"y":2,"o":"alice"}.`);
  assertEquals((next as { q?: number }).q, 4242);
  assertEquals((next as { o?: string }).o, 'alice');
  const released = parseLine(`${P1} A1 {"k":"veh","t":1759000000000,"id":9,"q":4242,"x":1,"y":2,"o":""}.`);
  assertEquals((released as { o?: string }).o, '');
  const old = parseLine(`${P1} A1 {"k":"veh","t":1759000000000,"id":9,"x":1,"y":2}.`);
  assertEquals(old?.k, 'veh');
  assertEquals((old as { q?: number }).q, undefined);
});

// ---------------------------------------------------------------------------
// npc, npcgone, npco, npcogone (exporter 0.4.0, migration 029)
// ---------------------------------------------------------------------------

Deno.test('npc, npcgone, npco and npcogone are known kinds with their required fields', () => {
  const npc = parseLine(
    `${P1} A1 {"k":"npc","t":1759000000000,"id":"squad:12","f":"raiders","fn":"Road Raiders","st":"hostile","n":3,"x":100,"y":200,"z":0,"src":"actor","act":"active","enc":"patrol","sen":false}.`,
  );
  assertEquals(npc?.k, 'npc');
  assertEquals((npc as { sen: boolean }).sen, false);
  assertEquals(parseLine(`${P1} A1 {"k":"npcgone","t":1,"id":"squad:12"}.`)?.k, 'npcgone');
  assertEquals(
    parseLine(`${P1} A1 {"k":"npco","t":1,"id":"site:1","x1":1,"y1":2,"x2":3,"y2":4,"hid":false}.`)?.k,
    'npco',
  );
  assertEquals(parseLine(`${P1} A1 {"k":"npcogone","t":1,"id":"site:1"}.`)?.k, 'npcogone');
});

Deno.test('the npc kinds reject a record without its required fields as a bad shape, not unknown', () => {
  const cases = [
    '{"k":"npc","t":1,"x":1,"y":2}', // no id
    '{"k":"npc","t":1,"id":"a","x":"1","y":2}', // x not a number
    '{"k":"npc","t":1,"id":"","x":1,"y":2}', // empty id
    '{"k":"npcgone","t":1}',
    '{"k":"npco","t":1,"id":"s","x1":1,"y1":2,"x2":3}', // no y2
    '{"k":"npcogone","t":1,"id":5}',
  ];
  for (const body of cases) {
    const r = parseLineDetailed(`${P1} A1 ${body}.`);
    assertEquals(r.ok, false, body);
    assertEquals((r as { reason: string }).reason, 'bad-shape', body);
  }
});

Deno.test('a kind this parser does not know is skipped and counted, never a failure (exporter ahead of ingest)', () => {
  // The live parser before 029 knew none of the npc kinds. This is the same path:
  // an unknown kind in a chunk with good records around it.
  const stats = emptyStats();
  const text = [
    `${P1} A1 {"k":"pos","t":1,"u":"a","x":1,"y":2}.`,
    `${P1} A1 {"k":"someFutureKind","t":2,"id":"x"}.`,
    `${P1} A1 {"k":"pos","t":3,"u":"b","x":3,"y":4}.`,
  ].join('\n') + '\n';
  const out = splitLines(text, '', stats);
  assertEquals(out.records.map((r) => r.k), ['pos', 'pos']);
  assertEquals(stats.unknownKind, { someFutureKind: 1 });
  assertEquals(stats.badJson + stats.badShape, 0, 'an unknown kind is not a parse error');
});

// ---------------------------------------------------------------------------
// death (exporter 0.5.0, migration 030) and boot.gv
// ---------------------------------------------------------------------------

Deno.test('death is a known kind and needs a string u and numeric x and y', () => {
  const ok = parseLineDetailed(`${P1} A1 {"k":"death","t":5,"u":"alice","x":10.5,"y":20,"z":0,"src":"isdead","hs":3.2}.`);
  assert(ok.ok, 'a full death parses');
  assertEquals(parseLine(`${P1} A1 {"k":"death","t":5,"u":"alice","x":1,"y":2}.`)?.k, 'death');
  for (const bad of [
    '{"k":"death","t":5,"x":1,"y":2}',
    '{"k":"death","t":5,"u":"","x":1,"y":2}',
    '{"k":"death","t":5,"u":7,"x":1,"y":2}',
    '{"k":"death","t":5,"u":"a","x":"1","y":2}',
    '{"k":"death","t":5,"u":"a","x":1}',
    '{"k":"death","u":"a","x":1,"y":2}',
  ]) {
    const r = parseLineDetailed(`${P1} A1 ${bad}.`);
    assert(!r.ok && r.reason === 'bad-shape', `rejected as bad-shape: ${bad}`);
  }
});

Deno.test('a boot record with gv still parses and keeps gv', () => {
  const r = parseLine(`${P1} A1 {"k":"boot","t":1,"v":"0.5.0","gv":"42.20.0"}.`);
  assertEquals((r as { gv?: string }).gv, '42.20.0');
});

// ---------------------------------------------------------------------------
// vname (exporter 0.5.1, migration 031)
// ---------------------------------------------------------------------------

Deno.test('vname is a known kind and needs an array n', () => {
  const ok = parseLine(`${P1} A1 {"k":"vname","n":[["Base.CarTaxi","Taxi"],["Base.CarNormal","Chevalier Nyala"]],"t":1759000000000}.`);
  assertEquals(ok?.k, 'vname');
  assertEquals((ok as { n: string[][] }).n.length, 2);
  for (const bad of [
    '{"k":"vname","t":5}',
    '{"k":"vname","t":5,"n":"Base.CarTaxi"}',
    '{"k":"vname","t":5,"n":{"Base.CarTaxi":"Taxi"}}',
    '{"k":"vname","n":[["Base.CarTaxi","Taxi"]]}',
  ]) {
    const r = parseLineDetailed(`${P1} A1 ${bad}.`);
    assert(!r.ok && r.reason === 'bad-shape', `rejected as bad-shape: ${bad}`);
  }
});

Deno.test('a vname line is counted as parsed, never as unknown, and several chunks all arrive', () => {
  const stats = emptyStats();
  const text = [
    `${P1} A1 {"k":"vname","n":[["Base.A","A"]],"t":1}.`,
    `${P1} A1 {"k":"vname","n":[["Base.B","B"]],"t":1}.`,
  ].join('\n') + '\n';
  const out = splitLines(text, '', stats);
  assertEquals(out.records.map((r) => r.k), ['vname', 'vname']);
  assertEquals(stats.unknownKind, {});
});

// ---------------------------------------------------------------------------
// vscr (exporter 0.7.3, T73; migration 038)
// ---------------------------------------------------------------------------

Deno.test('vscr: a good record parses, keeps every name in order, and is counted as parsed', () => {
  const r = parseLineDetailed(`${P1} A1 {"k":"vscr","t":1759500000000,"n":["Base.76chevyK20","Base.CarNormal","Base.MRAPMC"]}.`);
  if (!r.ok || r.record.k !== 'vscr') throw new Error(`not vscr: ${JSON.stringify(r)}`);
  assertEquals(r.record.t, 1759500000000);
  assertEquals(r.record.n, ['Base.76chevyK20', 'Base.CarNormal', 'Base.MRAPMC']);
  const stats = emptyStats();
  const out = splitLines(`${P1} A1 {"k":"vscr","t":1,"n":["Base.A"]}.\n${P1} A1 {"k":"vscr","t":1,"n":["Base.B"]}.\n`, '', stats);
  assertEquals(out.records.map((x) => x.k), ['vscr', 'vscr']);
  assertEquals(stats.unknownKind, {});
  assertEquals(stats.badShape, 0);
});

Deno.test('vscr: bad entries are dropped and the rest kept', () => {
  const long = 'x'.repeat(121);
  const ok120 = 'y'.repeat(120);
  const r = parseLineDetailed(
    `${P1} A1 {"k":"vscr","t":5,"n":["Base.Good","",5,null,["Base.Nested"],{"s":"Base.Obj"},"${long}","${ok120}",true,"Base.Also"]}.`,
  );
  if (!r.ok || r.record.k !== 'vscr') throw new Error(`not vscr: ${JSON.stringify(r)}`);
  assertEquals(r.record.n, ['Base.Good', ok120, 'Base.Also']);
  const empty = parseLineDetailed(`${P1} A1 {"k":"vscr","t":5,"n":[]}.`);
  assert(empty.ok && empty.record.k === 'vscr' && empty.record.n.length === 0, 'n [] parses to an empty list');
});

Deno.test('vscr: n missing or not an array drops the record (bad-shape)', () => {
  for (const bad of [
    '{"k":"vscr","t":5}',
    '{"k":"vscr","t":5,"n":"Base.CarTaxi"}',
    '{"k":"vscr","t":5,"n":{"0":"Base.CarTaxi"}}',
    '{"k":"vscr","t":5,"n":null}',
    '{"k":"vscr","n":["Base.CarTaxi"]}',
  ]) {
    const r = parseLineDetailed(`${P1} A1 ${bad}.`);
    assert(!r.ok && r.reason === 'bad-shape', `rejected as bad-shape: ${bad}`);
  }
});

// ---------------------------------------------------------------------------
// world (exporter 0.6.0, T46/T48)
// ---------------------------------------------------------------------------

// Verbatim from STATUS "T46 PASS": the harness's first `world` line.
const T46_WORLD_LINE =
  'A1 {"k":"world","t":1759000000000,"w":"3f2b8c1e-9a4d-4e6f-b7a2-0c5d1e8f9a3b","wa":123.5,"wn":true,"ws":1759000000000}';

Deno.test('world: the exporter harness line from T46 parses with every field', () => {
  const r = parseLineDetailed(`${P2} ${T46_WORLD_LINE}.`);
  assert(r.ok, `rejected: ${JSON.stringify(r)}`);
  const rec = (r as unknown as { record: Record<string, unknown> }).record;
  assertEquals(rec, {
    k: 'world', t: 1759000000000, w: '3f2b8c1e-9a4d-4e6f-b7a2-0c5d1e8f9a3b', wa: 123.5, wn: true, ws: 1759000000000,
  });
});

Deno.test('world: wn, wa and ws are optional', () => {
  const rec = parseLine(`${P1} A1 {"k":"world","t":1759000000000,"w":"t0000000"}.`);
  assertEquals(rec?.k, 'world');
  assertEquals((rec as { w: string }).w, 't0000000');
  assertEquals(parseLine(`${P1} A1 {"k":"world","t":1,"w":"abcdefgh","wn":false}.`)?.k, 'world');
});

Deno.test('world: a bad id or a wrongly typed optional field is a counted shape failure', () => {
  const bad = [
    '{"k":"world","t":1,"w":"short"}', // 5 chars, under 8
    `{"k":"world","t":1,"w":"${'a'.repeat(65)}"}`, // over 64
    '{"k":"world","t":1,"w":"abc_defgh"}', // underscore
    '{"k":"world","t":1,"w":"abc defgh"}', // space
    '{"k":"world","t":1,"w":12345678}', // not a string
    '{"k":"world","t":1}', // missing
    '{"k":"world","t":1,"w":"abcdefgh","wn":"yes"}',
    '{"k":"world","t":1,"w":"abcdefgh","wa":"12"}',
    '{"k":"world","t":1,"w":"abcdefgh","ws":null}',
  ];
  for (const json of bad) {
    const r = parseLineDetailed(`${P1} A1 ${json}.`);
    assertEquals(r, { ok: false, reason: 'bad-shape', kind: 'world' }, json);
  }
  // 64 is still fine.
  assertEquals(parseLine(`${P1} A1 {"k":"world","t":1,"w":"${'a'.repeat(64)}"}.`)?.k, 'world');
  const stats = emptyStats();
  splitLines(`${P1} A1 {"k":"world","t":1,"w":"bad id!"}.\n`, '', stats);
  assertEquals([stats.badShape, stats.parsed], [1, 0], 'counted, not fatal');
});

// Verbatim from STATUS "T53 PASS" (exporter 0.7.0 harness lines).
const T53_POS_LINE =
  'A1 {"al":"None","hs":77.5,"id":1,"k":"pos","n":"alice","t":1759000000000,"u":"alice","x":10650.5,"y":9800.25,"z":0,"zk":42}';
const T53_KILL_LINE = 'A1 {"k":"kill","t":1759000000000,"u":"alice","x":10650.5,"y":9800.25,"z":1}';
const T53_FACS_LINE =
  'A1 {"f":[{"g":"","m":["kim","lou"],"n":"Bears","o":"kim"},{"g":"WLF","m":["abe","mia","zed"],"n":"Wolves","o":"zed"}],"k":"facs","t":1759000000000}';

// ---------------------------------------------------------------------------
// Season records (exporter 0.7.0, T53/T54): pos.zk, kill, facs
// ---------------------------------------------------------------------------

Deno.test('T54 pos: the T53 harness line parses with zk', () => {
  const r = parseLineDetailed(`${P1} ${T53_POS_LINE}.`);
  assert(r.ok, 'parsed');
  if (!r.ok) return;
  assertEquals(r.record.k, 'pos');
  assertEquals((r.record as unknown as { zk: number; hs: number }).zk, 42);
  assertEquals((r.record as unknown as { zk: number; hs: number }).hs, 77.5);
});

Deno.test('T54 pos: an unusable zk is dropped from the record, never a shape failure', () => {
  for (const zk of ['-1', '1.5', '"3"', 'null', 'true', '1e400']) {
    const r = parseLineDetailed(`${P1} A1 {"k":"pos","t":1,"u":"alice","x":1,"y":2,"zk":${zk}}.`);
    assert(r.ok, `zk ${zk}: the position survives`);
    if (r.ok) assert(!('zk' in r.record), `zk ${zk} must be dropped`);
  }
  const zero = parseLine(`${P1} A1 {"k":"pos","t":1,"u":"alice","x":1,"y":2,"zk":0}.`);
  assertEquals((zero as unknown as { zk: number }).zk, 0, 'zero is a valid counter');
});

Deno.test('T54 kill: the T53 harness line parses with every field', () => {
  const r = parseLineDetailed(`${P1} ${T53_KILL_LINE}.`);
  assert(r.ok, 'parsed');
  if (r.ok) assertEquals(r.record, { k: 'kill', t: 1759000000000, u: 'alice', x: 10650.5, y: 9800.25, z: 1 } as unknown as typeof r.record);
});

Deno.test('T54 kill: z is optional; u, x and y are required', () => {
  assertEquals(parseLine(`${P1} A1 {"k":"kill","t":1,"u":"alice","x":1,"y":2}.`)?.k, 'kill');
  for (const body of [
    '{"k":"kill","t":1,"u":"","x":1,"y":2}',
    '{"k":"kill","t":1,"x":1,"y":2}',
    '{"k":"kill","t":1,"u":"alice","y":2}',
    '{"k":"kill","t":1,"u":"alice","x":"1","y":2}',
    '{"k":"kill","t":1,"u":7,"x":1,"y":2}',
  ]) {
    const r = parseLineDetailed(`${P1} A1 ${body}.`);
    assert(!r.ok && r.reason === 'bad-shape', `${body} is bad-shape`);
  }
});

Deno.test('T54 facs: the T53 harness line parses; an empty list is valid', () => {
  const r = parseLineDetailed(`${P1} ${T53_FACS_LINE}.`);
  assert(r.ok, 'parsed');
  if (!r.ok) return;
  const f = (r.record as unknown as { f: { n: string; g: string; o: string; m: string[] }[] }).f;
  assertEquals(f.map((x) => [x.n, x.g, x.o, x.m.length]), [['Bears', '', 'kim', 2], ['Wolves', 'WLF', 'zed', 3]]);
  const empty = parseLineDetailed(`${P1} A1 {"k":"facs","t":1,"f":[]}.`);
  assert(empty.ok, 'f [] parses (every faction disbanded)');
});

Deno.test('T54 facs: one malformed faction rejects the whole record', () => {
  for (const body of [
    '{"k":"facs","t":1}',
    '{"k":"facs","t":1,"f":{}}',
    '{"k":"facs","t":1,"f":["Bears"]}',
    '{"k":"facs","t":1,"f":[{"g":"","m":[],"o":"kim"}]}',
    '{"k":"facs","t":1,"f":[{"n":"Bears","g":1,"m":[]}]}',
    '{"k":"facs","t":1,"f":[{"n":"Bears","o":2,"m":[]}]}',
    '{"k":"facs","t":1,"f":[{"n":"Bears"}]}',
    '{"k":"facs","t":1,"f":[{"n":"Bears","m":["kim",3]}]}',
    '{"k":"facs","t":1,"f":[{"n":"Ok","m":[]},{"n":"Bad","m":"kim"}]}',
  ]) {
    const r = parseLineDetailed(`${P1} A1 ${body}.`);
    assert(!r.ok && r.reason === 'bad-shape', `${body} is bad-shape`);
  }
  // g and o are optional.
  assertEquals(parseLine(`${P1} A1 {"k":"facs","t":1,"f":[{"n":"Bears","m":[]}]}.`)?.k, 'facs');
});

// The in-game leaderboard table (exporter 0.7.2, T64/T65): lb
const T64_LB_LINE =
  'A1 {"e":[{"bd":1,"bk":300,"lh":176.33,"lk":181,"u":"Pootard"},{"bd":0,"bk":0,"lh":2.5,"lk":3,"u":"kim"}],"k":"lb","src":"DQOL","t":1759000000000}';

Deno.test('T65 lb: a good record parses with every entry, src kept', () => {
  const r = parseLineDetailed(`${P1} ${T64_LB_LINE}.`);
  assert(r.ok, 'parsed');
  if (!r.ok || r.record.k !== 'lb') throw new Error('not lb');
  assertEquals(r.record.src, 'DQOL');
  assertEquals(r.record.e.map((x) => [x.u, x.bk, x.bd, x.lk, x.lh]), [['Pootard', 300, 1, 181, 176.33], ['kim', 0, 0, 3, 2.5]]);
  const empty = parseLineDetailed(`${P1} A1 {"k":"lb","t":1,"e":[]}.`);
  assert(empty.ok && empty.record.k === 'lb' && empty.record.e.length === 0, 'e [] parses (the table is empty), src optional');
});

Deno.test('T65 lb: a bad entry is dropped, never a shape failure', () => {
  const body =
    '{"k":"lb","t":1,"src":7,"e":[' +
    '{"u":"ok","bk":1,"bd":2,"lk":3,"lh":4},' +
    '{"u":"","bk":1,"bd":2,"lk":3,"lh":4},' +
    '{"u":"  ","bk":1,"bd":2,"lk":3,"lh":4},' +
    '{"u":5,"bk":1,"bd":2,"lk":3,"lh":4},' +
    '{"bk":1,"bd":2,"lk":3,"lh":4},' +
    '{"u":"neg","bk":-1,"bd":2,"lk":3,"lh":4},' +
    '{"u":"str","bk":"1","bd":2,"lk":3,"lh":4},' +
    '{"u":"miss","bk":1,"bd":2,"lk":3},' +
    '{"u":"nul","bk":1,"bd":null,"lk":3,"lh":4},' +
    '"kim",null,[1],' +
    '{"u":"ok2","bk":0,"bd":0,"lk":0,"lh":0.25}]}';
  const r = parseLineDetailed(`${P1} A1 ${body}.`);
  assert(r.ok, 'a record with bad entries still parses');
  if (!r.ok || r.record.k !== 'lb') throw new Error('not lb');
  assertEquals(r.record.e.map((x) => x.u), ['ok', 'ok2']);
  assert(r.record.src === undefined, 'a non-string src is dropped');
});

Deno.test('T65 lb: {} reads as the empty table; a missing or other e is bad-shape', () => {
  const r = parseLineDetailed(`${P1} A1 {"k":"lb","t":1,"e":{}}.`);
  assert(r.ok && r.record.k === 'lb' && Array.isArray(r.record.e) && r.record.e.length === 0, 'e {} is []');
  for (const body of [
    '{"k":"lb","t":1}',
    '{"k":"lb","t":1,"e":{"u":"kim"}}',
    '{"k":"lb","t":1,"e":"x"}',
    '{"k":"lb","t":1,"e":null}',
    '{"k":"lb","e":[]}',
  ]) {
    const b = parseLineDetailed(`${P1} A1 ${body}.`);
    assert(!b.ok && b.reason === 'bad-shape', `${body} is bad-shape`);
  }
});

// The pass-end marker (exporter 0.7.4, T79): wpass
Deno.test('T79 wpass: an ok marker parses with its counts; a 0-count and an ok false marker parse too', () => {
  const r = parseLineDetailed(`${P1} A1 {"k":"wpass","t":1759000000000,"sh":2,"zn":1,"ok":true}.`);
  assert(r.ok, 'parsed');
  if (!r.ok || r.record.k !== 'wpass') throw new Error('not wpass');
  assertEquals([r.record.t, r.record.ok, r.record.sh, r.record.zn], [1759000000000, true, 2, 1]);
  const empty = parseLineDetailed(`${P1} A1 {"k":"wpass","t":1,"sh":0,"zn":0,"ok":true}.`);
  assert(empty.ok && empty.record.k === 'wpass' && empty.record.ok === true, 'an empty world is still a marker');
  const bad = parseLineDetailed(`${P1} A1 {"k":"wpass","t":1,"ok":false}.`);
  assert(bad.ok && bad.record.k === 'wpass' && bad.record.ok === false, 'ok false parses (and is kept as false)');
});

Deno.test('T79 wpass: ok missing or not a boolean, or t missing, is bad-shape', () => {
  for (const body of [
    '{"k":"wpass","t":1,"sh":1,"zn":0}',
    '{"k":"wpass","t":1,"ok":"true"}',
    '{"k":"wpass","t":1,"ok":1}',
    '{"k":"wpass","t":1,"ok":null}',
    '{"k":"wpass","ok":true}',
    '{"k":"wpass","t":"1","ok":true}',
  ]) {
    const b = parseLineDetailed(`${P1} A1 ${body}.`);
    assert(!b.ok && b.reason === 'bad-shape', `${body} is bad-shape`);
  }
});

Deno.test('T79 wpass: counts are optional; a count that is not a number is dropped, the marker kept', () => {
  const bare = parseLineDetailed(`${P1} A1 {"k":"wpass","t":5,"ok":true}.`);
  assert(bare.ok && bare.record.k === 'wpass', 'no counts is fine');
  const r = parseLineDetailed(`${P1} A1 {"k":"wpass","t":5,"sh":"2","zn":null,"ok":true}.`);
  assert(r.ok, 'parsed');
  if (!r.ok || r.record.k !== 'wpass') throw new Error('not wpass');
  assert(!('sh' in r.record) && !('zn' in r.record), 'bad counts dropped');
  assertEquals(r.record.ok, true);
  // splitLines counts it as parsed, not unknown.
  const s = splitLines(`${P1} A1 {"k":"wpass","t":5,"sh":0,"zn":0,"ok":true}.\n`);
  assertEquals([s.records.length, s.stats.parsed, Object.keys(s.stats.unknownKind).length], [1, 1, 0]);
});
