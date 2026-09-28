import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
  process.exit(1);
}

const supabase = createClient(url, key, {
  db: { schema: "aurora" },
});

const PLAYERS = 50;
const INTERVAL_MS = 5000;
const DURATION_MS = 10 * 60 * 1000;

let seq = 0;
const startTime = Date.now();

async function upsert() {
  const now = Date.now();
  const rows = Array.from({ length: PLAYERS }, (_, i) => ({
    server_id: "DystopianOutcasts",
    username: `player_${i}`,
    x: 1000 + i * 10 + Math.random() * 5,
    y: 2000 + i * 10 + Math.random() * 5,
    z: 0,
    vehicle_id: null,
    driver_username: null,
    seq: seq++,
    t: now,
  }));

  const { error } = await supabase.from("player_positions").upsert(rows);
  if (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);
  } else {
    console.log(
      `[${new Date().toISOString()}] Upserted ${PLAYERS} rows (seq ${seq - PLAYERS}-${seq - 1})`
    );
  }
}

(async () => {
  console.log(
    `[T05] Starting Realtime seed: ${PLAYERS} players every ${INTERVAL_MS}ms for ${DURATION_MS}ms`
  );

  const interval = setInterval(async () => {
    if (Date.now() - startTime >= DURATION_MS) {
      clearInterval(interval);
      console.log(`[T05] Seed complete. Upserted ${seq} total rows.`);
      process.exit(0);
    }
    await upsert();
  }, INTERVAL_MS);

  await upsert();
})();
