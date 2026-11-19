#!/usr/bin/env bash
# Pull every Season 1 user.txt (join/leave log) from the Main server's log archives, read-only,
# into R:\DystopianOutcasts\_LOCAL\server-logs\Main\<archive folder>\. Resumable: a folder that
# already has its user.txt and listing is skipped. Each folder's file listing (with modified
# times) is saved too, so a session cut off by a server stop can end at the last write.
set -uo pipefail
export MSYS_NO_PATHCONV=1
SB=/c/Users/ediaz/AppData/Local/Programs/ServerBuddy/sb.exe
OUT=/r/DystopianOutcasts/_LOCAL/server-logs/Main
mkdir -p "$OUT"
folders=$("$SB" files ls Main server-data/Logs 2>/dev/null | awk '$1=="folder"{print $NF}' | grep -E '^logs_2026-(10-0[2-9]|10-[123][0-9]|11-[0-9]{2})')
total=$(printf '%s\n' "$folders" | grep -c .)
n=0
for f in $folders; do
  n=$((n+1))
  dir="$OUT/$f"
  if [ -f "$dir/listing.json" ] && ls "$dir"/*_user.txt >/dev/null 2>&1; then continue; fi
  mkdir -p "$dir"
  if ! grep -q '"entries"' "$dir/listing.json" 2>/dev/null; then
    "$SB" files ls Main "server-data/Logs/$f" --json > "$dir/listing.json" 2>/dev/null
  fi
  name=$(grep -o '"name": "[^"]*_user\.txt"' "$dir/listing.json" | head -1 | sed 's/.*"name": "//; s/"$//')
  if [ -z "$name" ]; then echo "[$n/$total] $f: no user.txt"; continue; fi
  # sb saves only into the current folder (no drive letter or full path), so get from inside it.
  (cd "$dir" && "$SB" files get Main "server-data/Logs/$f/$name" "$name" >/dev/null 2>&1) \
    && echo "[$n/$total] $f: $name" || echo "[$n/$total] $f: FAILED to get $name"
done
# The live session's user.txt too (the folder the server is writing now).
"$SB" files ls Main server-data/Logs --json > "$OUT/current-listing.json" 2>/dev/null
cur=$(grep -o '"name": "[^"]*_user\.txt"' "$OUT/current-listing.json" | head -1 | sed 's/.*"name": "//; s/"$//')
mkdir -p "$OUT/current"; rm -f "$OUT/current/"*_user.txt
[ -n "$cur" ] && (cd "$OUT/current" && "$SB" files get Main "server-data/Logs/$cur" "$cur" >/dev/null 2>&1) && echo "current: $cur"
echo "DONE: $(ls -d "$OUT"/logs_* | wc -l) folders, $(ls "$OUT"/*/*_user.txt 2>/dev/null | wc -l) user logs"
