# Aurora log fixtures

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
