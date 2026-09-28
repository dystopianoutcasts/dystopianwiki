// Run with: deno test --allow-read --allow-env --node-modules-dir=auto packages/shared/aurora/playersdb.parse.test.ts
//
// Builds players.db images in memory with the same sql.js the ingest function
// loads (npm:sql.js), so the parser is proven against the real column names
// without needing the owner's downloaded file. The last test uses that file
// when it is present and skips otherwise.
import initSqlJs from 'npm:sql.js@1.14.2';
import { parsePlayersDb, type SqlJsStatic } from './playersdb.ts';

function assertEquals<T>(actual: T, expected: T, msg = ''): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} expected ${e} got ${a}`);
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

// deno-lint-ignore no-explicit-any
type Any = any;

const SQL: Any = await initSqlJs();

const NETWORK_DDL = `CREATE TABLE networkPlayers (
  id INTEGER PRIMARY KEY, world TEXT, username TEXT, playerIndex INTEGER, name STRING,
  steamid STRING, x FLOAT, y FLOAT, z FLOAT, worldversion INTEGER, data BLOB, isDead BOOLEAN)`;
const LOCAL_DDL = `CREATE TABLE localPlayers (
  id INTEGER PRIMARY KEY, name TEXT, wx INTEGER, wy INTEGER, x FLOAT, y FLOAT, z FLOAT,
  worldversion INTEGER, data BLOB, isDead BOOLEAN)`;

function image(fill: (db: Any) => void): Uint8Array {
  const db = new SQL.Database();
  db.run(NETWORK_DDL);
  db.run(LOCAL_DDL);
  fill(db);
  const bytes = db.export();
  db.close();
  return bytes;
}

Deno.test('multiplayer rows are keyed on username, with the character name kept separately', () => {
  const bytes = image((db) => {
    db.run(`INSERT INTO networkPlayers (world, username, playerIndex, name, steamid, x, y, z, isDead)
            VALUES ('servertest', 'Fanare', 0, 'Bob Bingy', '1', 11854.4, 6602.9, 0, 0)`);
    db.run(`INSERT INTO networkPlayers (world, username, playerIndex, name, steamid, x, y, z, isDead)
            VALUES ('servertest', 'kitten', 0, 'kitten pitten', '2', 9987.6, 9789.4, 0, 1)`);
  });
  const out = parsePlayersDb(SQL as SqlJsStatic, bytes);
  assertEquals(out.table, 'networkPlayers');
  assertEquals(out.players.length, 2);
  assertEquals(out.players[0], { username: 'Fanare', name: 'Bob Bingy', x: 11854.4, y: 6602.9, z: 0, isDead: false });
  assertEquals(out.players[1].username, 'kitten');
  assertEquals(out.players[1].isDead, true);
});

Deno.test('an empty multiplayer table falls back to localPlayers, where the name is the username', () => {
  const bytes = image((db) => {
    db.run(`INSERT INTO localPlayers (name, wx, wy, x, y, z, isDead) VALUES ('Solo', 30, 20, 9000, 6000, 0, 0)`);
  });
  const out = parsePlayersDb(SQL as SqlJsStatic, bytes);
  assertEquals(out.table, 'localPlayers');
  assertEquals(out.players, [{ username: 'Solo', name: 'Solo', x: 9000, y: 6000, z: 0, isDead: false }]);
});

Deno.test('an empty database yields no players rather than throwing', () => {
  const out = parsePlayersDb(SQL as SqlJsStatic, image(() => {}));
  assertEquals(out.players, []);
});

const REAL = Deno.env.get('AURORA_PLAYERS_DB') ?? 'R:/tmp/aurora/players.db';
let realBytes: Uint8Array | null = null;
try {
  realBytes = await Deno.readFile(REAL);
} catch {
  realBytes = null;
}

Deno.test({
  name: `the owner's downloaded players.db parses with distinct account and character names (${REAL})`,
  ignore: realBytes === null,
  fn() {
    const out = parsePlayersDb(SQL as SqlJsStatic, realBytes!);
    assertEquals(out.table, 'networkPlayers');
    assert(out.players.length > 0, 'expected rows');
    for (const p of out.players) {
      assert(p.username.length > 0, 'every row has an account name');
      assert(Number.isFinite(p.x) && Number.isFinite(p.y), 'coordinates are numbers');
    }
    assert(out.players.some((p) => p.username !== p.name), 'account and character names differ on this server');
  },
});
