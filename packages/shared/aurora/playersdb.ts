// Reads the server's players.db (SQLite) into plain rows. Pure: the caller hands
// in an initialised sql.js module, so the same function runs under Deno (the
// ingest function loads `npm:sql.js`), under tsx (the T06 test loads `sql.js`)
// and in a browser. No I/O and no runtime-specific imports live here.
//
// Schema, measured on this server's file (T06, T08 rev 2):
//   networkPlayers  id, world, username, playerIndex, name, steamid, x, y, z,
//                   worldversion, data, isDead        (multiplayer)
//   localPlayers    id, name, wx, wy, x, y, z, worldversion, data, isDead  (single player)
//
// `username` is the ACCOUNT name and is the key of aurora.players. `name` is
// the character's name ("Bob Bingy"). T06 read `name` alone, which would have
// keyed rows on the character, not the account - the two differ for every
// player on this server. Single-player saves have no account, so there the
// character name doubles as the username.
//
// The B41-era wx/wy (x/300) are not computed: B42 cells are 256 squares and the
// map stores squares, not cells (STATUS "T04").

export interface SavedPlayerRow {
  username: string;
  name: string;
  x: number;
  y: number;
  z: number;
  isDead: boolean;
}

/** The slice of sql.js this module uses. */
export interface SqlJsStatic {
  Database: new (data?: Uint8Array) => SqlJsDatabase;
}
export interface SqlJsDatabase {
  prepare(sql: string): SqlJsStatement;
  close(): void;
}
export interface SqlJsStatement {
  step(): boolean;
  getAsObject(): Record<string, unknown>;
  free(): boolean;
}

export type PlayersTable = 'networkPlayers' | 'localPlayers';

export interface PlayersDbResult {
  table: PlayersTable;
  players: SavedPlayerRow[];
}

function countRows(db: SqlJsDatabase, table: string): number {
  const stmt = db.prepare(`SELECT COUNT(*) AS cnt FROM ${table}`);
  try {
    stmt.step();
    return Number(stmt.getAsObject().cnt ?? 0);
  } finally {
    stmt.free();
  }
}

/**
 * Parse a players.db image. Prefers the multiplayer table and falls back to the
 * single-player one only when the former is empty.
 */
export function parsePlayersDb(SQL: SqlJsStatic, bytes: Uint8Array): PlayersDbResult {
  const db = new SQL.Database(bytes);
  try {
    const table: PlayersTable = countRows(db, 'networkPlayers') > 0 ? 'networkPlayers' : 'localPlayers';
    const usernameExpr = table === 'networkPlayers' ? 'username' : 'name AS username';
    const stmt = db.prepare(`SELECT ${usernameExpr}, name, x, y, z, isDead FROM ${table}`);
    const players: SavedPlayerRow[] = [];
    try {
      while (stmt.step()) {
        const row = stmt.getAsObject();
        players.push({
          username: String(row.username ?? ''),
          name: String(row.name ?? ''),
          x: Number(row.x),
          y: Number(row.y),
          z: Number(row.z ?? 0),
          isDead: Boolean(row.isDead),
        });
      }
    } finally {
      stmt.free();
    }
    return { table, players };
  } finally {
    db.close();
  }
}
