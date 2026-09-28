/**
 * T05 - Supabase Realtime under load: the WRITE half.
 *
 * Upserts N synthetic players into aurora.player_positions every INTERVAL ms for
 * DURATION, so the browser harness (R:\tmp\aurora-rt\index.html) can measure
 * Realtime latency and drops at the planned 10 writes/s.
 *
 * Keys. This project has legacy API keys disabled (STATUS.md, T07), so the
 * writer needs the project's SECRET key (sb_secret_...), which PostgREST maps to
 * service_role and which bypasses RLS. It is read from the environment only and
 * is never printed. The browser page must NOT use it: it takes the publishable
 * key plus a sign-in (below).
 *
 * Admin session. Realtime applies the same RLS as REST, and anon has no policy
 * on player_positions, so a publishable-key subscriber receives nothing unless
 * it is signed in as an aurora admin. The brief allows "a signed-in admin
 * session or a temporary permissive policy". A temporary user is the smaller
 * footprint: no DDL on the live schema, and it is deleted at teardown. This
 * script creates that user (email/password, is_aurora_admin = true), prints the
 * credentials ONCE for the page, and removes the user, its profile row and every
 * seeded row when the run ends, on Ctrl+C, or with --teardown-only.
 *
 * Gap detection. player_positions.seq is GENERATED ALWAYS AS IDENTITY: a client
 * cannot set it, and an upsert that updates a row leaves it unchanged, so it
 * cannot carry a tick counter. Instead every row in a tick shares one exact `t`,
 * ticks are INTERVAL apart, and the page derives missed ticks from the spacing
 * of consecutive `t` values per username.
 *
 * Usage (from the monorepo root; dotenv loads the root env file, as sync-articles does):
 *   SUPABASE_URL=... SUPABASE_SECRET_KEY=sb_secret_... npx tsx scripts/aurora-realtime-seed.ts
 *   options: --minutes N (default 10)  --players N (default 50)  --interval-ms N (default 5000)
 *            --keep (skip teardown)     --teardown-only
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Arguments and environment
// ---------------------------------------------------------------------------

function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function argFlag(name: string): boolean {
  return process.argv.includes(name);
}
function argNumber(name: string, fallback: number): number {
  const raw = argValue(name);
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    console.error(`${name} must be a positive number, got ${JSON.stringify(raw)}`);
    process.exit(2);
  }
  return n;
}

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.AURORA_SERVICE_KEY;

if (!url || !key) {
  console.error(
    "SUPABASE_URL and SUPABASE_SECRET_KEY are required (shell env or the monorepo-root env file).\n" +
      "The secret key is the sb_secret_... value from Settings -> API Keys; legacy keys are disabled on this project."
  );
  process.exit(1);
}
if (!key.startsWith("sb_secret_")) {
  const kind = key.startsWith("sb_publishable_")
    ? "a publishable key, which cannot write"
    : key.startsWith("eyJ")
      ? "a legacy JWT, which this project rejects with 401"
      : "not a recognised key format";
  console.error(`SUPABASE_SECRET_KEY is ${kind}. It must start with sb_secret_.`);
  process.exit(1);
}

const PLAYERS = argNumber("--players", 50);
const INTERVAL_MS = argNumber("--interval-ms", 5000);
const DURATION_MS = argNumber("--minutes", 10) * 60 * 1000;
const KEEP = argFlag("--keep");
const TEARDOWN_ONLY = argFlag("--teardown-only");

// Everything this script writes is scoped to this server id, so teardown is one
// cascade and the real server's rows are never touched.
const SERVER_ID = "t05-realtime-spike";
const ADMIN_EMAIL = "aurora-t05-admin@dystopianoutcasts.invalid";
const ADMIN_USERNAME = "aurora_t05_admin"; // user_profiles.username: 3-20 chars, letter first

// ---------------------------------------------------------------------------
// Clients: one on the aurora schema for the seed rows, one on public for the
// profile flag. Both use the secret key, so no session is ever persisted.
// ---------------------------------------------------------------------------

const authOpts = { auth: { persistSession: false, autoRefreshToken: false } };
const aurora = createClient(url, key, { ...authOpts, db: { schema: "aurora" } });
const pub = createClient(url, key, { ...authOpts, db: { schema: "public" } });

function stamp(): string {
  return new Date().toISOString();
}
function log(msg: string): void {
  console.log(`[${stamp()}] ${msg}`);
}
function fail(step: string, error: { message: string } | null): never {
  console.error(`[${stamp()}] ${step} failed: ${error?.message ?? "unknown error"}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Temp admin user
// ---------------------------------------------------------------------------

async function findAdminUserId(): Promise<string | undefined> {
  // listUsers is paged; the wiki is small, but walk the pages anyway.
  for (let page = 1; page < 50; page++) {
    const { data, error } = await pub.auth.admin.listUsers({ page, perPage: 200 });
    if (error) fail("auth.admin.listUsers", error);
    const hit = data.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
    if (hit) return hit.id;
    if (data.users.length < 200) return undefined;
  }
  return undefined;
}

async function deleteAdminUser(userId: string): Promise<void> {
  // user_profiles.id references auth.users with NO cascade, so the profile row
  // has to go first or the auth delete fails on the foreign key.
  const { error: pErr } = await pub.from("user_profiles").delete().eq("id", userId);
  if (pErr) fail("delete user_profiles row", pErr);
  const { error: uErr } = await pub.auth.admin.deleteUser(userId);
  if (uErr) fail("auth.admin.deleteUser", uErr);
}

async function createAdminUser(): Promise<{ id: string; password: string }> {
  const existing = await findAdminUserId();
  if (existing) {
    log("temp admin user left over from an earlier run; removing it first");
    await deleteAdminUser(existing);
  }
  const password = randomBytes(18).toString("base64url"); // 24 chars, printed once below
  const { data, error } = await pub.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password,
    email_confirm: true,
    // handle_new_user() inserts raw_user_meta_data->>'username' into a NOT NULL,
    // constrained column; without this the auth insert itself fails.
    user_metadata: { username: ADMIN_USERNAME, display_name: "T05 spike admin" },
  });
  if (error || !data.user) fail("auth.admin.createUser", error);
  const id = data.user.id;

  const { data: flagged, error: fErr } = await pub
    .from("user_profiles")
    .update({ is_aurora_admin: true })
    .eq("id", id)
    .select("id");
  if (fErr) fail("set is_aurora_admin", fErr);
  if (!flagged || flagged.length !== 1) {
    console.error("is_aurora_admin was not set: the profile row for the temp user was not found");
    await deleteAdminUser(id);
    process.exit(1);
  }
  return { id, password };
}

// ---------------------------------------------------------------------------
// Seed rows
// ---------------------------------------------------------------------------

function usernames(): string[] {
  return Array.from({ length: PLAYERS }, (_, i) => `t05_player_${String(i).padStart(2, "0")}`);
}

async function setupRows(): Promise<void> {
  const { error: sErr } = await aurora
    .from("servers")
    .upsert({ id: SERVER_ID, name: "T05 realtime spike (synthetic)", last_seen: stamp() });
  if (sErr) fail("upsert servers", sErr);

  const players = usernames().map((username) => ({
    server_id: SERVER_ID,
    username,
    display_name: username,
    online: true,
    last_seen: stamp(),
  }));
  const { error: pErr } = await aurora.from("players").upsert(players);
  if (pErr) fail("upsert players", pErr);
}

async function teardownRows(): Promise<void> {
  // servers -> players -> player_positions all cascade, so one delete is enough;
  // the counts afterwards are the proof, not the cascade.
  const { error } = await aurora.from("servers").delete().eq("id", SERVER_ID);
  if (error) fail("delete server row", error);
  for (const table of ["player_positions", "players", "servers"]) {
    const col = table === "servers" ? "id" : "server_id";
    const { count, error: cErr } = await aurora
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq(col, SERVER_ID);
    if (cErr) fail(`count ${table}`, cErr);
    if (count !== 0) {
      console.error(`teardown left ${count} rows in aurora.${table} for ${SERVER_ID}`);
      process.exitCode = 1;
    }
  }
}

let tick = 0;
let sent = 0;
let failedTicks = 0;
let slowestUpsertMs = 0;

async function upsertTick(): Promise<void> {
  const t = new Date().toISOString(); // one exact stamp per tick; the page keys gaps on it
  const rows = usernames().map((username, i) => ({
    server_id: SERVER_ID,
    username,
    x: 1000 + i * 10 + Math.random() * 5,
    y: 2000 + i * 10 + Math.random() * 5,
    z: 0,
    vehicle_id: null,
    t,
  }));
  const started = Date.now();
  const { error } = await aurora.from("player_positions").upsert(rows);
  const took = Date.now() - started;
  slowestUpsertMs = Math.max(slowestUpsertMs, took);
  tick += 1;
  if (error) {
    failedTicks += 1;
    log(`tick ${tick} FAILED after ${took} ms: ${error.message}`);
  } else {
    sent += rows.length;
    log(`tick ${tick}: upserted ${rows.length} rows in ${took} ms (t=${t})`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let adminId: string | undefined;
let tornDown = false;

async function teardown(reason: string): Promise<void> {
  if (tornDown) return;
  tornDown = true;
  log(`teardown (${reason})`);
  if (KEEP) {
    log("--keep given: rows and the temp admin user are LEFT IN PLACE; run --teardown-only later");
    return;
  }
  await teardownRows();
  const id = adminId ?? (await findAdminUserId());
  if (id) await deleteAdminUser(id);
  log("teardown complete: seeded rows deleted, temp admin user deleted");
}

async function main(): Promise<void> {
  if (TEARDOWN_ONLY) {
    await teardown("--teardown-only");
    return;
  }

  log(`T05 seed: ${PLAYERS} players every ${INTERVAL_MS} ms for ${DURATION_MS / 60000} min, server_id=${SERVER_ID}`);
  await setupRows();
  const admin = await createAdminUser();
  adminId = admin.id;

  console.log("");
  console.log("Sign in on the harness page with the PUBLISHABLE key and this temporary admin user:");
  console.log(`  email:    ${ADMIN_EMAIL}`);
  console.log(`  password: ${admin.password}`);
  console.log("The user is deleted when this script exits.");
  console.log("");

  const started = Date.now();
  await upsertTick();
  await new Promise<void>((resolve) => {
    const timer = setInterval(async () => {
      if (Date.now() - started >= DURATION_MS) {
        clearInterval(timer);
        resolve();
        return;
      }
      await upsertTick();
    }, INTERVAL_MS);
    const stop = () => {
      clearInterval(timer);
      resolve();
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  });

  const elapsedS = Math.round((Date.now() - started) / 1000);
  console.log("");
  log(`seed done: ${tick} ticks, ${sent} rows sent, ${failedTicks} failed ticks, slowest upsert ${slowestUpsertMs} ms, ${elapsedS} s elapsed`);
  log(`expected rows on the page: ${tick} ticks x ${PLAYERS} players = ${tick * PLAYERS}`);
  await teardown("run finished");
}

main().catch(async (err) => {
  console.error(`[${stamp()}] unexpected error: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
  await teardown("error");
});
