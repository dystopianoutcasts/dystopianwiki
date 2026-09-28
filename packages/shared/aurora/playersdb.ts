import initSqlJs from "https://sql.js.org/dist/sql-wasm.js";

let db: any;
let SQL: any;

async function initDB() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
}

export interface LocalPlayer {
  name: string;
  x: number;
  y: number;
  z: number;
  isDead: boolean;
  wx: number;
  wy: number;
}

export async function readLocalPlayers(
  bytes: Uint8Array
): Promise<LocalPlayer[]> {
  await initDB();
  db = new SQL.Database(bytes);

  // Try networkPlayers first (multiplayer server), fallback to localPlayers (single-player)
  let table = "networkPlayers";
  let testStmt = db.prepare(`SELECT COUNT(*) as cnt FROM networkPlayers`);
  testStmt.step();
  const networkCount = testStmt.getAsObject().cnt;
  testStmt.free();

  if (!networkCount || networkCount === 0) {
    table = "localPlayers";
  }

  // networkPlayers doesn't have wx/wy; calculate from x/y (x/300 = cell)
  const selectCols =
    table === "networkPlayers"
      ? `name, x, y, z, isDead, CAST(x/300.0 AS INTEGER) as wx, CAST(y/300.0 AS INTEGER) as wy`
      : `name, x, y, z, isDead, wx, wy`;

  const stmt = db.prepare(`SELECT ${selectCols} FROM ${table}`);
  const result: LocalPlayer[] = [];

  while (stmt.step()) {
    const row = stmt.getAsObject();
    result.push({
      name: row.name as string,
      x: row.x as number,
      y: row.y as number,
      z: row.z as number,
      isDead: row.isDead ? true : false,
      wx: row.wx as number,
      wy: row.wy as number,
    });
  }

  stmt.free();
  return result;
}
