"""Count real play time per player from the Main server's user.txt logs.

Reads R:/DystopianOutcasts/_LOCAL/server-logs/Main/<archive>/<stamp>_user.txt (pulled by
pull-user-logs.sh). A session runs from a "fully connected" line to that player's
"disconnected player" line. A session still open when its log ends (a server stop or crash)
ends at the folder's last file write, from listing.json; one still open in the live log ends now.
Log stamps are UTC ([dd-mm-yy HH:MM:SS.mmm]). Prints names and totals only, never Steam IDs or IPs.

    python -I count-playtime.py [--since 2026-10-03] [--player NAME] [--json OUT]
"""
import json
import re
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path("R:/DystopianOutcasts/_LOCAL/server-logs/Main")
LINE = re.compile(r'^\[(\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)\.(\d{3})\] \S+ "(?P<name>[^"]+)" (?P<what>fully connected|disconnected player)')


def stamp(m):
    d, mo, y, h, mi, s, ms = (int(m.group(i)) for i in range(1, 8))
    return datetime(2000 + y, mo, d, h, mi, s, ms * 1000, tzinfo=timezone.utc)


def folder_end(folder):
    listing = folder / "listing.json"
    if not listing.exists():
        return None
    entries = json.loads(listing.read_text(encoding="utf-8")).get("entries", [])
    times = [datetime.fromisoformat(e["modified"]) for e in entries if e.get("modified")]
    return max(times).astimezone(timezone.utc) if times else None


def sessions():
    out = []
    now = datetime.now(timezone.utc)
    folders = sorted(p for p in ROOT.iterdir() if p.is_dir())
    for folder in folders:
        logs = sorted(folder.glob("*_user.txt"))
        if not logs:
            continue
        end_of_log = now if folder.name == "current" else folder_end(folder)
        open_at = {}
        last_seen = None
        for raw in logs[0].read_text(encoding="utf-8", errors="replace").splitlines():
            m = LINE.match(raw)
            if not m:
                continue
            t = stamp(m)
            last_seen = t
            name = m.group("name")
            if m.group("what") == "fully connected":
                if name in open_at:  # joined again without a leave line: close the old one here
                    out.append((name, open_at[name], t, "rejoin"))
                open_at[name] = t
            elif name in open_at:
                out.append((name, open_at.pop(name), t, "left"))
        cut = end_of_log or last_seen
        for name, t0 in open_at.items():
            if cut and cut > t0:
                out.append((name, t0, cut, "log ended"))
    return out


def split_by_day(t0, t1):
    while t0 < t1:
        nxt = datetime(t0.year, t0.month, t0.day, tzinfo=timezone.utc) + timedelta(days=1)
        part = min(nxt, t1)
        yield t0.date(), (part - t0).total_seconds()
        t0 = part


def main():
    args = sys.argv[1:]
    since = datetime(2026, 10, 3, tzinfo=timezone.utc)
    player = None
    json_out = None
    if "--since" in args:
        since = datetime.fromisoformat(args[args.index("--since") + 1]).replace(tzinfo=timezone.utc)
    if "--player" in args:
        player = args[args.index("--player") + 1]
    if "--json" in args:
        json_out = args[args.index("--json") + 1]
    rows = [s for s in sessions() if s[2] > since]
    total = defaultdict(float)
    count = defaultdict(int)
    cut_ends = defaultdict(int)
    first = {}
    per_day = defaultdict(lambda: defaultdict(float))
    for name, t0, t1, how in rows:
        t0 = max(t0, since)
        secs = (t1 - t0).total_seconds()
        if secs <= 0:
            continue
        total[name] += secs
        count[name] += 1
        cut_ends[name] += how != "left"
        first[name] = min(first.get(name, t0), t0)
        for day, s in split_by_day(t0, t1):
            per_day[day][name] += s
    names = sorted(total, key=lambda n: -total[n])
    if player:
        names = [n for n in names if n.lower() == player.lower()]
    print(f"{'player':<24}{'hours':>9}{'sessions':>10}  first seen (UTC)   ended by log stop")
    for n in names:
        print(f"{n:<24}{total[n] / 3600:>9.1f}{count[n]:>10}  {first[n]:%Y-%m-%d %H:%M}   {cut_ends[n]}")
    days = sorted(per_day)
    if days:
        print(f"\n{len(names)} players, {len(rows)} sessions, {sum(total.values()) / 3600:.1f} hours, days {days[0]} to {days[-1]}")
    if json_out:
        Path(json_out).write_text(json.dumps({
            "since": since.isoformat(),
            "players": [{"name": n, "hours": round(total[n] / 3600, 2), "sessions": count[n], "first": first[n].isoformat()} for n in names],
            "days": {str(d): {n: round(s / 60) for n, s in per_day[d].items()} for d in days},
        }, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
