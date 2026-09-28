# Aurora log fixtures

## `2026-09-28_21-10_Aurora.txt` - the first REAL log, reconstructed

The v0.0 exporter's first live log (STATUS "T03 PASS", 2026-09-28): `boot`,
`probe`, one `hb`, on an empty server with `PauseEmpty=true`. The JSON field
values are the ones recorded verbatim in that STATUS block (every probed API and
event true, `schema:1`, `v:"0.0.0"`, `players:0`, probe `t:1790629890628`, hb
`t:1790629892835`). Two things are NOT verbatim, because the session that wrote
this fixture had no SFTP access: the boot record's `t` (placed 2.2 s before the
hb, as STATUS measured) and PZ's own line prefix (rendered from `t` in UTC).
Replace this file with the downloaded original when one is to hand; nothing in
the tests depends on the two reconstructed values.

## `2026-09-28_22-00_Aurora.txt` - SYNTHETIC, revision 2 heartbeat shape

Generated to exercise the T08 rev 2 mapping before T09 ships: one `statkeys`
record, six `src:"tick"` heartbeats 10 s apart with the three `st` tables (the
key names are the engine's, including the `avg-update-period` trap and a
`Pool<...>` key in each table that the exporter is meant to drop and the ingest
must drop regardless), one `src:"gametime"` heartbeat that must NOT become a
health sample, one `pos`, and a final tick heartbeat reporting 0 players that
must flip the roster offline. The values are invented; only the shape is the
contract.

## `2026-09-28_03-06_Aurora.txt` - SYNTHETIC, not a capture

T08 asks for 200 real lines copied from the T03 spike's log. **T03 has not run**,
so no exporter exists and no real Aurora log exists anywhere to copy from. This
file was generated instead, and it is only as correct as the record contract
documented at the top of `../parser.ts` - which this session defined rather than
observed.

Replace it with a real capture as soon as T03 produces one. If the real lines
disagree with the contract, the parser is what is wrong, not the log.

What it deliberately contains:

- every record kind in v0.1: `boot hb pos veh sh zone zgrid catalog link`
- the two-bracket timestamp prefix the T02 spike recorded on a real server log,
  which is not the one-bracket prefix the T08 task text describes
- non-ASCII usernames (`José`, `Анна`) and titles (`Café`), because those are the
  inputs that break byte-level chunking and PostgREST filter quoting
- PZ's own log lines, which share the directory and must be counted as "other"
  rather than as parse errors
- one `economy` record, a kind this parser version does not know, which must be
  counted and skipped rather than being fatal
- repeated `pos` records per player, so the dedupe path is exercised

The file name matches the real `<yyyy-MM-dd_HH-mm>_Aurora.txt` pattern rather
than the `aurora-sample.txt` the task names, because `scripts/aurora-backfill.ts`
selects files by that suffix and a fixture the CLI cannot see is not a fixture.

## Contract note (2026-09-28, Fable)

The parser follows the exporter's field names as T09 "Record shapes" specifies them:
`sh.id` is numeric (stored as text), `sh.cr` is created, `zone.kind`, `zgrid.c` is the
count, `catalog.w` is the weight, and `catalogv` is a known kind that produces no rows.
Both synthetic fixtures were rewritten to those names; `2026-09-28_22-00_Aurora.txt`
also gained one line of every world kind so the backfill dry run covers the whole
contract. The earlier `kd`/`n`/`wt`/`c` names came from the parser's own guess and are
rejected on purpose (parser.test.ts asserts it).

## 2026-09-28_23-00_Aurora.txt (REAL, exporter v0.1 on the host)
Twenty-seven lines curated from the first live v0.1 round (two players, 23:01-23:22 UTC):
boot, probe, statkeys, five tick heartbeats and one gametime one, six pos across both
players, four veh, six zgrid, both link lines. Verbatim, no edits. Dry run: 27 of 27
parsed, 0 badShape. This is the reference for the exporter contract; prefer it over the synthetic files.
