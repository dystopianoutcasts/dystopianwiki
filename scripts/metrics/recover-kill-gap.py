"""Recover zombie kills the live ingest missed, from the Main server's archived Aurora logs.

Kill events reach aurora.kill_events by the live ingest tailing the exporter's Aurora.txt. From
2026-11-01 00:10 to 2026-11-05 06:34 UTC it recorded none, though players were on for 61.6 hours. The
exporter kept writing them: each archived log folder (server-data/Logs/logs_<archived>/) holds that
session's <started>_Aurora.txt, with one `"k":"kill"` line per kill (username, time, x, y, z).

This script, read-only on the server:
  1. picks the archived folders dated within a day of the window, from the listings saved by
     pull-user-logs.sh in R:/DystopianOutcasts/_LOCAL/server-logs/Main/<folder>/listing.json (the
     names do not say exactly when a log ran, so each kill line is judged by its own time);
  2. fetches each of those Aurora files through ServerBuddy's sb (only if not already here);
  3. keeps the kill lines strictly inside the window, and writes INSERT ... ON CONFLICT DO NOTHING
     rows into R:/DystopianOutcasts/_LOCAL/server-logs/ (never the repo). The row is the one the
     live ingest writes (buildKillRow in packages/shared/aurora/ingest-core.ts): server, username
     (first 100 characters), x, y, z (0 when absent), t at the millisecond. world_id is left to the
     table's trigger, which stamps the current world; Season 1 has one world (w1).
  4. prints a cross-check: per player, kill lines against the rise of the `zk` counter in `pos` lines
     over the same window. They should agree; the exporter caps kill lines at 20 per second.

    python -I recover-kill-gap.py                  fetch, write the SQL, print the cross-check
    python -I recover-kill-gap.py --apply          also insert, roll the window's days up again, and
                                                   refresh the races cache

Options: --from / --to (UTC, exclusive; default the 2026-11-01 gap), --server outcasts-main.
Run from Git Bash. The Supabase CLI is the 3.1.0 exe by path (the default shim is too old).
"""
import json
import subprocess
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

SERVER_LOGS = Path("R:/DystopianOutcasts/_LOCAL/server-logs")
MAIN_LOGS = SERVER_LOGS / "Main"
SERVER_BUDDY = "C:/Users/ediaz/AppData/Local/Programs/ServerBuddy/sb.exe"
CLI = "C:/Users/ediaz/scoop/apps/supabase/3.1.0/supabase.exe"
PROJECT = "gwubcipchkwthsorhcky"
BATCH = 500
EPOCH = datetime(1970, 1, 1, tzinfo=timezone.utc)
# The last recorded kill before the gap and the first after it (aurora.kill_events, 2026-11-19).
DEFAULT_FROM = "2026-11-01T00:10:25.475+00:00"
DEFAULT_TO = "2026-11-05T06:34:53.037+00:00"


def folder_day(name):
    """logs_2026-11-02_12-00 or logs_2026-10-03 -> that date; None when the name carries none."""
    try:
        return datetime.strptime(name[len("logs_") : len("logs_") + 10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def aurora_files(window_from, window_to):
    """(folder, Aurora file name) for every archived log whose folder is dated within a day of the window.

    Folder and file names do not say when a log ran (2026-10-31_20-00_Aurora.txt, archived in
    logs_2026-11-01_01-07, runs from 01:06 to 04:00 UTC on Nov 1), so the window is widened by a day
    on each side and every kill line is kept or dropped by its own time instead.
    """
    first_day = window_from.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=1)
    last_day = window_to.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
    picked = []
    for folder in sorted(MAIN_LOGS.glob("logs_*")):
        day = folder_day(folder.name)
        if day is None or not (first_day <= day <= last_day):
            continue
        listing = folder / "listing.json"
        try:
            entries = json.loads(listing.read_text(encoding="utf-8")).get("entries", [])
        except (json.JSONDecodeError, OSError):
            print(f"  skipped {folder.name}: its listing.json is missing or could not be read")
            continue
        picked.extend((folder, e["name"]) for e in entries if e.get("name", "").endswith("_Aurora.txt"))
    return picked


def fetch(folder, name):
    target = folder / name
    if target.is_file() and target.stat().st_size > 0:
        return True
    # sb saves only into the current folder (no drive letter or full path), so run it from there.
    result = subprocess.run(
        [SERVER_BUDDY, "files", "get", "Main", f"server-data/Logs/{folder.name}/{name}", name],
        cwd=str(folder), capture_output=True, text=True,
    )
    if result.returncode != 0 or not target.is_file():
        print(f"  FAILED to fetch {folder.name}/{name}: {result.stdout[-200:]} {result.stderr[-200:]}")
        return False
    return True


def records(path, kinds):
    """The exporter's JSON records of the given kinds, from `[stamp] A1 {...}.` lines."""
    with open(path, encoding="utf-8", errors="replace") as handle:
        for line in handle:
            if not any(f'"k":"{kind}"' in line for kind in kinds):
                continue
            start, end = line.find("{"), line.rfind("}")
            if start < 0 or end < start:
                continue
            try:
                yield json.loads(line[start : end + 1])
            except json.JSONDecodeError:
                continue


def collect(files, from_ms, to_ms):
    kills = {}
    counter_rise = Counter()
    last_counter = {}
    for folder, name in files:
        for record in records(folder / name, ("kill", "pos")):
            moment = record.get("t")
            username = record.get("u")
            if not isinstance(moment, int) or not isinstance(username, str) or username == "":
                continue
            if record["k"] == "pos":
                kills_this_life = record.get("zk")
                if isinstance(kills_this_life, int):
                    before = last_counter.get(username)
                    if before is not None and from_ms < moment < to_ms and kills_this_life > before:
                        counter_rise[username] += kills_this_life - before
                    last_counter[username] = kills_this_life
                continue
            x, y, z = record.get("x"), record.get("y"), record.get("z", 0)
            if not (from_ms < moment < to_ms) or not all(isinstance(v, (int, float)) for v in (x, y)):
                continue
            if not isinstance(z, (int, float)):
                z = 0
            kills.setdefault((username, moment, x, y), z)
    return kills, counter_rise


def clean_name(name):
    """A username as the database keeps it: first 100 characters, no control characters, quotes doubled."""
    return "".join(ch for ch in name[:100] if ch.isprintable()).replace("'", "''")


def write_sql(kills, server, out_path):
    rows = sorted(kills.items(), key=lambda item: (item[0][1], item[0][0]))
    lines = [
        "-- Generated by scripts/metrics/recover-kill-gap.py: kill events only (names, times, positions).",
        "-- Safe to run twice (the kill key ignores duplicates).",
    ]
    for i in range(0, len(rows), BATCH):
        values = ",\n".join(
            f"  ('{server}', '{clean_name(u)}', {float(x)!r}, {float(y)!r}, {float(z)!r}, "
            f"TIMESTAMPTZ '{(EPOCH + timedelta(milliseconds=t)).isoformat(timespec='milliseconds')}')"
            for (u, t, x, y), z in rows[i : i + BATCH]
        )
        lines.append(
            "INSERT INTO aurora.kill_events (server_id, username, x, y, z, t) VALUES\n"
            + values
            + "\nON CONFLICT ON CONSTRAINT kill_events_server_username_t_x_y_key DO NOTHING;"
        )
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return len(rows)


def run_cli(args):
    result = subprocess.run([CLI, "db", "query", f"--remote={PROJECT}", "--yes", *args], cwd=str(Path.home()), capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit(f"supabase CLI failed ({result.returncode}): {result.stdout[-400:]} {result.stderr[-400:]}")
    return result.stdout


def main():
    args = sys.argv[1:]

    def option(flag, default):
        return args[args.index(flag) + 1] if flag in args else default

    window_from = datetime.fromisoformat(option("--from", DEFAULT_FROM))
    window_to = datetime.fromisoformat(option("--to", DEFAULT_TO))
    server = option("--server", "outcasts-main")
    from_ms = int((window_from - EPOCH).total_seconds() * 1000)
    to_ms = int((window_to - EPOCH).total_seconds() * 1000)

    files = aurora_files(window_from, window_to)
    print(f"{len(files)} Aurora logs in folders dated around {window_from:%Y-%m-%d %H:%M} to {window_to:%Y-%m-%d %H:%M} UTC")
    fetched = [(folder, name) for folder, name in files if fetch(folder, name)]
    if len(fetched) != len(files):
        sys.exit(f"stopped: {len(files) - len(fetched)} log(s) could not be fetched; run again to retry")

    kills, counter_rise = collect(fetched, from_ms, to_ms)
    out_path = SERVER_LOGS / f"kill-gap-{window_from:%Y-%m-%d}.sql"
    count = write_sql(kills, server, out_path)
    print(f"wrote {out_path} ({count} kill rows)")

    per_player = Counter(u for (u, _t, _x, _y) in kills)
    print("Cross-check, per player: kill lines / rise of the zk counter in the same window")
    for username in sorted(set(per_player) | set(counter_rise), key=lambda u: -per_player[u]):
        print(f"  {username[:24]:<24}{per_player[username]:>7}{counter_rise[username]:>7}")
    print(f"  {'total':<24}{sum(per_player.values()):>7}{sum(counter_rise.values()):>7}")

    if "--apply" in args:
        run_cli(["-f", str(out_path)])
        day_from = window_from.replace(hour=0, minute=0, second=0, microsecond=0)
        day_to = window_to.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
        run_cli([f"SELECT aurora.metrics_rollup(TIMESTAMPTZ '{day_from.isoformat()}', TIMESTAMPTZ '{day_to.isoformat()}');"])
        run_cli(["SELECT aurora.metrics_races_refresh();"])
        print("applied, rolled the window's days up again, and refreshed the races cache")


if __name__ == "__main__":
    main()
