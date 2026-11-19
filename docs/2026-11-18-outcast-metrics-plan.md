# Outcast Metrics page -- plan and handoff

Owner ask, 2026-11-18: "Let's make an Outcast Metrics Page." It grew out of the BattleMetrics
work. The owner wants graphs like the BattleMetrics server page (rank, time played, unique and
first-time players, most time played), on our own site and in our own style.

Status: PLANNED. Nothing is built yet. Start with step 1 below. Every day of delay loses a day
of hourly history (see "Why step 1 is urgent").

## What already exists (do not rebuild)

- BattleMetrics rank, done 2026-11-18. Code in the wiki repo:
  - migration `supabase/migrations/051_battlemetrics_rank.sql`, with `aurora.battlemetrics_summary(p_server)`;
  - card `packages/web/src/components/landing/BattleMetricsCard.tsx`;
  - parser `packages/web/src/lib/battlemetrics.ts`;
  - hook `packages/web/src/hooks/useBattleMetrics.ts`.
  - It holds no data yet. It needs a BattleMetrics API token in Vault, and BattleMetrics' API needs
    a paid subscription; the owner's subscription attempt failed and support was emailed 2026-11-18.
  - The token is saved with `bash /r/Dystopian_Wiki/scripts/set-battlemetrics-token.sh`. Its
    `--check` mode shows the state.
- Home page activity charts: `packages/web/src/components/landing/ActivitySection.tsx`, which reads
  `aurora.home_summary_tz` (migrations 027, 046). Charts are hand-drawn SVG; there is no chart library.
  Styles are in `packages/web/src/styles/components/home-sections.css`. Reuse its tile and chart
  classes and patterns.
- Leaderboard (`aurora.leaderboard`, migrations 036 and 037) shows usernames and display names
  publicly. "Most time played" follows that same rule, so it adds no new exposure.

## The data we have, and how long it lives

| Source | What | Cadence | Kept |
|---|---|---|---|
| `aurora.health_samples` | `players` online, `raw.game.zombies-killed`, server stats | every 10 s | **8 days** (044 housekeeping; `players` survives the 3-day slimming) |
| `aurora.player_position_history` | one row per online player, at least every 60 s (exporter heartbeat, see 039 header) | about 1/min/player | **7 days** (044) |
| `aurora.players.first_seen` + `aurora.player_history.first_seen` | first time each username was seen (current and past worlds) | -- | forever |
| `aurora.deaths` (`t`) | each death | event | forever |
| `aurora.kill_events` (`t`) | each zombie kill | event | until 30 days after its world ends (032) |
| `aurora.lives` | each life: start, end, kills, hours | event | forever |
| `aurora.battlemetrics_rank_history` | rank per point | hourly once a token works | 30 days (051) |

On 2026-11-18: health_samples started 2026-11-10 09:23 (74k rows); position history started
2026-10-03, but only the last 7 days are whole; there were 62 players, the first seen
2026-10-03.

### Why step 1 is urgent

Nothing can draw a 30-day or 90-day graph of players or time played, because the raw rows are
deleted after 7-8 days. A rollup that runs every hour, kept forever, fixes that. History
starts from whatever raw data is still there on the day step 1 is applied. First-time players,
deaths and lives can be backfilled all the way to 2026-10-03 at any time.

## Step 1 -- migration 052: hourly rollup (database)

New file `supabase/migrations/052_aurora_metrics.sql`. Follow 051's style: SECURITY DEFINER,
`search_path ''`, RLS on with no client grants, a header comment saying what and why, and safe
to run twice.

Tables, kept forever. Both are tiny: about 16 players x 24 hours x 365 days is at most 140k rows
a year.
- `aurora.metrics_hourly(server_id, hour timestamptz, avg_players real, peak_players int,
  player_minutes int, unique_players int, new_players int, deaths int, kills int,
  PRIMARY KEY (server_id, hour))`
- `aurora.metrics_player_hourly(server_id, hour, username, minutes int, PRIMARY KEY (server_id,
  hour, username))`. Unique players per day and per month cannot be summed from hourly unique
  counts, so per-player minutes are needed. They also feed "most time played".

`aurora.metrics_rollup(p_from timestamptz, p_to timestamptz) RETURNS int` recomputes whole hours
in that range and upserts them, so it is idempotent:
- `player_minutes`, per-player `minutes`: count distinct `(username, date_trunc('minute', t))` in
  `player_position_history` for the hour. A row arrives at least every 60 s while a player is
  online, so each minute that has a row is a minute played.
- `avg_players` and `peak_players` come from `health_samples.players`. Where an hour has no
  health samples (before 2026-11-10), fall back to the position data: player_minutes / 60 for the
  average, and the most distinct users in one minute for the peak.
- `unique_players` is the distinct usernames in the hour.
- `new_players` is usernames whose earliest `first_seen` (players together with player_history)
  falls in the hour.
- `deaths` comes from `aurora.deaths.t`.
- `kills` comes from `kill_events.t`. Compare it with the `raw.game.zombies-killed` deltas in
  health_samples, pick whichever is complete, and say which in the header.

Schedule and backfill:
- pg_cron job `metrics-rollup` at `10 * * * *` recomputes the last 3 hours, to catch late ingest.
  Add `enable_metrics_cron()` and `disable_metrics_cron()` like 051.
- Backfill at the end of the migration: roll up from the earliest raw row to now.
- In the same migration, add a one-off backfill of `new_players` and `deaths` from 2026-10-03.

Public read `aurora.metrics_summary(p_server text, p_days int) RETURNS jsonb`, granted to anon:
- `p_days` is clamped to 1..3650 and the server must be known.
- Every key is always present:
  - `hourly`: [{t, avg, peak}], only when `p_days` is 7 or less, else empty;
  - `daily`: [{day, hours_played, unique_players, new_players, peak, deaths, kills}];
  - `heatmap`: 7 x 24 average players by weekday and hour in UTC (the client shifts it to local
    time);
  - `top_time`: [{rank, username, display_name, minutes}], top 10;
  - `totals`: {hours_played, unique_players, new_players, peak};
  - `tracking_since`: the first hour in the rollup, so the page can say where the data starts.
- Days are UTC on the server. The client labels them in local time. If the owner wants
  Eastern-time days, use `home_summary_tz`'s approach and pass a timezone.

Tests: `supabase/tests/metrics.sql`, the same pattern as `tests/battlemetrics_rank.sql`
(BEGIN, fixtures, ASSERT and `RAISE NOTICE 'PASS ...'`, ROLLBACK). Cover:
- the minutes counting, including a player with two rows in one minute;
- the fallback when an hour has no health samples;
- new players across both worlds;
- running the rollup twice gives the same numbers;
- `metrics_summary` keys, range clamping and the top 10;
- anon may call the summary but not the tables.

Then mutation-check: break a count on purpose and confirm the tests fail.

Apply from outside the repo folder:
`cd ~ && /c/Users/ediaz/scoop/apps/supabase/3.1.0/supabase.exe db query --remote=gwubcipchkwthsorhcky --yes -f /r/Dystopian_Wiki/supabase/migrations/052_aurora_metrics.sql`.
The scoop default CLI is 2.95.4, which has no `--remote`; use the 3.1.0 exe by path. Reads that
call SECURITY DEFINER functions need `--yes`, because the `--read-only` role is refused. Add the 052
row to `supabase/README.md`.

## Step 2 -- the page (web)

Route `/metrics`, page title "Outcast Metrics". Add it to `packages/web/src/App.tsx`, the site
nav, a "See all metrics" link under the home page activity charts, and `scripts/build-sitemap.ts`.

Code:
- `src/lib/metrics.ts`: a defensive parser, pure and tested like `lib/battlemetrics.ts`.
- `src/hooks/useMetrics.ts`: react-query, keyed by days.
- `src/pages/MetricsPage.tsx`.
- `src/components/metrics/*`.
- Small shared SVG chart parts: line, bars and heatmap. Pull the home page's drawing code out into
  them only if that is a clean extraction; otherwise build beside it.

Sections, top to bottom:
1. Headline tiles: online now, peak this week, hours played this week, new players this week,
   and BattleMetrics rank (it already reads "TBD" without a token).
2. Range picker, one control for the whole page: **7 days / 30 days / 90 days / All**. It shows
   which range is active and says "Tracking since <date>" when a range reaches before the data.
3. Players online: the average, with a lighter peak line (hourly for 7 days, daily beyond).
4. Hours played per day (bars).
5. Unique and first-time players per day: two lines with a legend that says words, not just colors.
6. Busiest hours: a heatmap of weekday by hour in the viewer's local time, with the time zone named.
7. Race to the top, Season 1. This is the ONLY playable chart (owner, 2026-11-18). It runs from the
   season's start (`aurora.worlds` seq 1, `started_at` 2026-10-03 00:00 UTC, "server live 2026-10-02
   20:00 ET") to today, whatever range is picked above.
   - What it shows: each player's time played, added up day by day. Bars grow and swap places when
     one player passes another, and a line calls out lead changes ("Nov 15: Boom passes Crusty for
     first place").
   - How it plays: it plays by itself once, at about 0.4 s a day. It has Pause/Play, Start over, and a
     Day slider. With reduced motion it opens on today and stays still.
   - The design is the canvas board "Round 3: Race to the top, Season 1":
     https://claude.ai/artifact/GBTSkKfs4j93Xzas7egFTS. A repo copy is in
     `R:\DystopianOutcasts\_DEV\_CANVASES\2026-11-18-outcast-metrics\project\RaceSeason.dc.html`.
   - Every other chart on the page stays still: no draw-in and no replay. Hover readouts are fine.
   - Data:
     - From the day step 1 is applied (back to about 2026-11-11, from the 7 days of position history
       still there), it comes from `metrics_player_hourly`.
     - Days before that exist only at BattleMetrics. Pull them once with
       `GET /players/{id}/time-played-history/{serverId}` (daily, at most 90 days back) for each player
       on `GET /servers/{id}/relationships/leaderboards/time`.
     - **Deadline:** the 90-day window starts losing the first season days on about
       **2027-01-01**. The pull needs the BattleMetrics token, so do it as soon as the token works.
     - Store those days as daily rows with a source column (`battlemetrics`), never mixed silently
       with our own counts.
     - With no token by then, the race starts on the first tracked day and says so ("Tracked from Nov
       11; earlier play is not counted").
8. Deaths and zombie kills per day.
9. BattleMetrics: reuse `BattleMetricsCard` (7-day rank). Uptime and longer rank ranges come
   later, when the token works.

Every chart has:
- a one-line written summary above it ("312 hours played in the last 30 days");
- an aria-label that states the data;
- an empty state that says why it is empty and when it will fill ("Tracking started Nov 18;
  this fills in as days go by").

Phone width: charts stack, labels never overlap, and nothing scrolls sideways. Check at 375 px and
1366 px, in light and dark.

### First-time steps (the owner's test list, rule 1.2)

1. From the home page, click "See all metrics" under the activity charts. The Outcast Metrics page
   opens.
2. Read how many players are online now and this week's peak, from the tiles at the top, without
   scrolling.
3. Click "30 days". Every chart changes to 30 days, and "30 days" is shown as selected.
4. Find which hours are busiest in your own time zone, from the heatmap, with its time zone shown.
5. Find who played the most this month, from the "Most time played" list.
6. On a phone, read every chart with no sideways scrolling and no overlapping labels.
7. Before any data exists, every chart says why it is empty and when it will fill.

## Step 3 -- deploy and record

Build, deploy and verify as with the BattleMetrics card:
- `npm run build` in `packages/web`;
- copy `dist/index.html` and `dist/assets/index-*.{js,css}` to the repo root;
- `git rm` the old chunks;
- commit by path;
- push with the account-switch chain;
- check the live `index.html` names the new chunk, the chunk contains `supabase.co`, and it lacks
  "Missing Supabase environment variables".

Screenshot the live page at 375 px and 1366 px (Playwright from
`R:/novaforge-studios/CounterMagic-champion/mobile/node_modules/playwright`, with a real Chrome user
agent).

## Later (once the BattleMetrics token works)

- Rank with 7-day, 1-month and 3-month buttons: lengthen 051's history from 30 to 90 days, and fetch
  `rank-history` over 90 days once.
- Uptime, 7 and 30 days, from BattleMetrics `/servers/{id}/relationships/downtime` and
  `/relationships/outages`.
- PZ-wide standing: our rank against all PZ servers from `/servers?filter[game]=zomboid`. These are
  the only graphs no one else could show.

## Agents (owner budget rules)

One Sonnet builder does steps 1 to 3 in order, testing and committing each step. One Sonnet
reviewer reviews at the end, with a cold-start walk-through of the first-time steps. At most one
fix round, sent back to the same builder. No workflow and no fan-out.

Rules for the builder:
- Stage by name, and commit with path arguments (`git commit -m ... -- <paths>`).
- No `--amend`, no pathless commits.
- Never touch other sessions' uncommitted files. On 2026-11-18 those were
  `content/articles/...` and `packages/web/src/components/wiki/fieldNotes.test.ts`, whose one
  failing test is unrelated.
