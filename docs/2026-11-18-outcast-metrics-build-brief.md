# Outcast Metrics -- build brief (2026-11-18)

Owner ask: "let's add them to our Outcast Metrics Page and build it and put it live." Build the
`/metrics` page on dystopianoutcasts.online with its database part, test it, and deploy it.

You are the one builder. Work in this order. After each group: run its tests, then commit by path.
A reviewer checks the work before the deploy step.

## Read first (only these, with the line ranges)

- The plan, `docs/2026-11-18-outcast-metrics-plan.md`:
  - lines 28-141: the data, why the rollup is urgent, Season 1 coverage, and migration 052;
  - lines 142-268: the page, the sections, the three races, and the first-time steps;
  - lines 269-283: deploy.
- The reference implementations of the three races and the still kill charts. These are working
  mockups. Port their behavior to React; keep the timings, labels and rules exactly.
  - `R:\DystopianOutcasts\_DEV\_CANVASES\2026-11-18-outcast-metrics\project\KillRace.dc.html`:
    - hourly steps and the clock (Eastern, with the Nov 1 clock change at step 698);
    - Slow / Normal / Fast at 160 / 70 / 25 ms per hour, Pause / Start over, and the Hour slider;
    - a lingering, fading "+N" tag, held about 2.5 s at any speed;
    - lead-change and big-hour headlines;
    - kills per day and kills by hour of day, each with its highlight.
  - `...\LivedRace.dc.html`:
    - lives built from deaths;
    - the crumble: shake, pieces falling, dust, and a "DIED after N" tag, about 3.6 s;
    - the best-life marker;
    - a 3.2 s hold when a life of 10 or more days ends, with a red "A BIG ONE FALLS." banner and the
      board's red edge pulse;
    - reduced motion: no crumble, no hold.
  - `...\RaceSeason.dc.html`: the time-played race, same controls. **Its numbers are fake**; the
    real ones come from `play_sessions` and the rollup (below).
- Patterns to copy:
  - `supabase/migrations/051_battlemetrics_rank.sql` and `supabase/tests/battlemetrics_rank.sql` for
    the migration and test style;
  - `packages/web/src/lib/battlemetrics.ts`, `hooks/useBattleMetrics.ts`,
    `components/landing/BattleMetricsCard.tsx` and `ActivitySection.tsx` for the parser, hook, card
    and SVG chart style;
  - `styles/components/home-sections.css` for the styles.
  - The site's colors and fonts: `styles/variables.css`. Both light and dark themes must work.

## Group 1 -- database: `supabase/migrations/052_aurora_metrics.sql` + `supabase/tests/metrics.sql`

1. Everything in the plan's "Step 1" (lines 75-141): `metrics_hourly`, `metrics_player_hourly`,
   `metrics_rollup`, the cron job with enable/disable, the backfill, and `metrics_summary`.
   - The range is `7` / `30` / `season`.
   - The season start comes from `aurora.worlds` (the current world's `started_at`).
2. Add `aurora.play_sessions(server_id, username, started_at, ended_at, source, PRIMARY KEY
   (server_id, username, started_at))`. It holds names and times only, never Steam IDs or IPs.
   - The rollup takes per-player minutes from `play_sessions` for any hour that has no position
     data, so the season before Nov 11 is counted from the server logs.
3. Add `aurora.metrics_races(p_server)`, public and granted to anon. It returns one jsonb with:
   - `kills`: the top 10 players by season kills from `kill_events`, each as sparse
     `[hour, n, ...]`, with the hour counted from the season start; plus the all-player hourly totals;
   - `lives`: the top 10 by longest life. Each has its deaths from `aurora.deaths` as `[time, hours
     at death]`, the current `hours_survived` and `is_dead` from `aurora.players`, and a first-seen
     time;
   - `time`: the top 10 by season minutes from `metrics_player_hourly`, as sparse hourly minutes;
   - `season_start`, `now`, and display names (`coalesce(display_name, username)`).
   - Use the same visibility as `aurora.leaderboard`: public usernames and display names, nothing
     else.
4. Tests in the 051 style:
   - minutes counting;
   - the play_sessions fallback;
   - rollup idempotence;
   - the summary keys and range handling;
   - the races' shape and the top 10;
   - anon may call only the two functions.
   Then break one count on purpose to prove a test catches it (mutation check).
5. Apply the migration and the tests from OUTSIDE the repo folder. The CLI's default shim is too old,
   so use this exe:
   `cd ~ && /c/Users/ediaz/scoop/apps/supabase/3.1.0/supabase.exe db query --remote=gwubcipchkwthsorhcky --yes -f /r/Dystopian_Wiki/supabase/migrations/052_aurora_metrics.sql`
   - Reads use `--yes` too: the `--read-only` role cannot call SECURITY DEFINER functions.
   - If you get a 401 "Invalid access token", stop and report it. The owner logs in again.
6. Add the 052 row to `supabase/README.md`.

## Group 2 -- season play time from the server logs

- `scripts/metrics/pull-user-logs.sh` pulls each Season 1 `user.txt` into
  `R:\DystopianOutcasts\_LOCAL\server-logs\Main\` with ServerBuddy.
  - It may still be running when you start, and it can be re-run safely.
  - Some gets fail on a passing connection error; re-running fetches only what is missing.
- `scripts/metrics/count-playtime.py` already parses them into sessions.
- Add `scripts/metrics/import-play-sessions.py`, run with `python -I`.
  - It writes a SQL file of `INSERT ... ON CONFLICT DO NOTHING` rows (username, started_at,
    ended_at, source `server_log`) into `R:\DystopianOutcasts\_LOCAL\server-logs\` (never the repo).
  - It applies the file with the CLI line above, then calls `aurora.metrics_rollup` over the season.
- Report the top 10 real season play times. The owner asked whether One has played more than 2.5
  hours; answer it.

## Group 3 -- the page: route `/metrics`, title "Outcast Metrics"

- The sections are lines 152-255 of the plan, in that order:
  - tiles;
  - the range picker (7 days / 30 days / Season 1, default Season 1);
  - players online;
  - hours played;
  - different and first-time players;
  - busiest hours;
  - **the three races** (time played, zombie kills with its two still charts, longest alive);
  - deaths and kills;
  - the BattleMetrics card.
- Only the races play. Every other chart stays still.
- Add the route in `App.tsx`, a "Metrics" link in the site nav, a "See all metrics" link under the
  home page activity charts, and an entry in `scripts/build-sitemap.ts`.
- Pure parsers and race math go in `src/lib/metrics*.ts`, with `*.test.ts` beside them
  (`npx tsx --test <file>`):
  - lives from deaths;
  - the Eastern hour and day, including Nov 1;
  - the leader and last lead change;
  - the burst hold;
  - big deaths.
- Every chart has a written summary line, an aria-label that states the data, and an empty state
  that says why it is empty and when it will fill.
- Work at 375 px and 1366 px wide, in light and dark. Every control is a real button or input,
  44 px tall.

## Group 4 -- deploy (only after the reviewer passes it)

The plan's lines 269-283:
1. Build in `packages/web` (`npm run build`).
2. Copy `dist/index.html` and `dist/assets/index-*.{js,css}` to the repo root, and `git rm` the old
   chunks.
3. Commit by path, then push with the account switch:
   `gh auth switch -h github.com -u dystopianoutcasts && git push -q origin main; rc=$?; gh auth switch -h github.com -u diazgutierrezedgar-novaforge; exit $rc`
4. Check the live `https://dystopianoutcasts.online/` `index.html` names the new chunk, the chunk
   holds `supabase.co`, and it does NOT hold "Missing Supabase environment variables".
5. Open `/metrics` live and screenshot it at 375 px and 1366 px. Use Playwright from
   `R:/novaforge-studios/CounterMagic-champion/mobile/node_modules/playwright`, with a real Chrome
   user agent.

## Rules (owner's, all hard)

- **Never read any `.env` file** in any way. The build reads it on its own.
- **Commits:**
  - Stage each file by name; commit with `git commit -m "..." -- <paths>`.
  - No `git add .`, `-A`, folders or wildcards. No pathless commits, no `--amend`.
  - Before each commit, check `git diff --cached --name-only`.
  - No AI attribution lines.
- **Other people's work:** leave `content/articles/...`, `packages/web/src/components/wiki/fieldNotes.test.ts`
  and any other file you did not change alone. They are other sessions' work. That test's one
  failure is not yours.
- **Writing:** American English, no emoji. Readable full-word names in code.
- **Privacy:** raw server logs stay in `_LOCAL`, never in the repo or the database. Only names and
  times go in.
- **Report back after each group:** commits, test output, and anything you could not do. Stop at
  the end of Group 3 for the review; do not deploy before it.
