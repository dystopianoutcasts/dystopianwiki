import { readFileSync } from "fs";
import initSqlJs from "sql.js";

const dbPath = "R:\\tmp\\aurora\\players.db";

const data = readFileSync(dbPath);
const fileSizeBytes = data.length;

console.log(`[T06] Loading players.db (${fileSizeBytes} bytes)...`);

const SQL = await initSqlJs();
const startMs = performance.now();
const db = new SQL.Database(data);

// Determine which table to read from
let table = "networkPlayers";
const tableCheckStmt = db.prepare(`SELECT COUNT(*) as cnt FROM networkPlayers`);
tableCheckStmt.step();
const networkCount = tableCheckStmt.getAsObject().cnt as number;
tableCheckStmt.free();

if (!networkCount || networkCount === 0) {
  table = "localPlayers";
}

console.log(`[T06] Reading from table: ${table} (${networkCount} network players)`);

// networkPlayers doesn't have wx/wy; calculate from x/y (x/300 = cell)
const selectCols =
  table === "networkPlayers"
    ? `name, x, y, z, isDead, CAST(x/300.0 AS INTEGER) as wx, CAST(y/300.0 AS INTEGER) as wy`
    : `name, x, y, z, isDead, wx, wy`;

const stmt = db.prepare(`SELECT ${selectCols} FROM ${table}`);

const players: Array<{
  name: string;
  x: number;
  y: number;
  z: number;
  isDead: boolean;
  wx: number;
  wy: number;
}> = [];

while (stmt.step()) {
  const row = stmt.getAsObject();
  players.push({
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
db.close();

const loadTimeMs = performance.now() - startMs;

console.log(`[T06] Loaded ${players.length} rows in ${loadTimeMs.toFixed(2)}ms`);
console.log(`[T06] Library: sql.js (pure WASM SQLite)`);
console.log(
  `[T06] File size: ${fileSizeBytes} bytes, Row count: ${players.length}, Load time: ${loadTimeMs.toFixed(2)}ms`
);

// Print first 10 rows for verification
console.log("\n[T06] First 10 rows:");
players.slice(0, 10).forEach((p, i) => {
  console.log(
    `  ${i + 1}. ${p.name} @ (${p.x}, ${p.y}, ${p.z}) [wx=${p.wx}, wy=${p.wy}, dead=${p.isDead}]`
  );
});

// Verify coordinates make sense
const allValidCoords = players.every(
  (p) => p.x >= 0 && p.y >= 0 && p.z >= 0 && p.wx >= 0 && p.wy >= 0
);
console.log(
  `\n[T06] All coordinates valid (non-negative): ${allValidCoords ? "PASS" : "FAIL"}`
);

// Report for STATUS.md
console.log("\n[T06] MEASUREMENT SUMMARY:");
console.log(`Library: sql.js`);
console.log(`Row count: ${players.length}`);
console.log(`File size: ${fileSizeBytes} bytes`);
console.log(`Load time: ${loadTimeMs.toFixed(2)}ms`);
