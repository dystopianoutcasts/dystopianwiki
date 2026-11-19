#!/usr/bin/env bash
# Save the BattleMetrics API token in Supabase Vault, as the secret
# `battlemetrics_api_token`. aurora.battlemetrics_request() (migration 051) reads it
# from there every hour to fill the home page's BattleMetrics rank tile and card.
#
#   bash /r/Dystopian_Wiki/scripts/set-battlemetrics-token.sh            save or replace the token, then fetch once
#   bash /r/Dystopian_Wiki/scripts/set-battlemetrics-token.sh --check    only check the login and whether a token is saved
#   bash /r/Dystopian_Wiki/scripts/set-battlemetrics-token.sh --dry-run  read and check a token, save nothing
#
# The token is typed at a hidden prompt. It is never shown, never put on a command
# line, never written to the repo, and never sent anywhere except the project's own
# database. The SQL that carries it goes to a private temporary file that is deleted
# when the script ends, however it ends. Runs in Git Bash.
set -euo pipefail

PROJECT=gwubcipchkwthsorhcky
SECRET=battlemetrics_api_token
SERVER=outcasts-main
MODE=save
case "${1:-}" in
  "") ;;
  --check) MODE=check ;;
  --dry-run) MODE=dry-run ;;
  -h|--help) sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
  *) echo "Unknown option: $1 (use --check, --dry-run or nothing)"; exit 2 ;;
esac

say() { printf '%s\n' "$*"; }
fail() { printf 'STOPPED: %s\n' "$*" >&2; exit 1; }

# The Supabase CLI reads settings from the folder it runs in; inside the wiki repo it
# picks up a different access token. Run every CLI call from the home folder.
cd "$HOME"

# A CLI with `db query --remote` (v3). The scoop default may point at an older v2,
# so look at every installed version, newest first.
pick_cli() {
  local candidates=() c
  if command -v supabase >/dev/null 2>&1; then candidates+=("$(command -v supabase)"); fi
  if [ -d "$HOME/scoop/apps/supabase" ]; then
    while IFS= read -r c; do candidates+=("$c"); done < <(
      ls -d "$HOME"/scoop/apps/supabase/[0-9]*/ 2>/dev/null | sort -V -r | sed 's#/$#/supabase.exe#')
  fi
  for c in "${candidates[@]}"; do
    [ -x "$c" ] || continue
    if "$c" db query --help 2>&1 | grep -q -- '--remote'; then printf '%s' "$c"; return 0; fi
  done
  return 1
}
CLI="$(pick_cli)" || fail "no Supabase CLI with 'db query --remote' (version 3 or later) was found. Install it with: scoop install supabase"

query_read() { "$CLI" db query --remote="$PROJECT" --yes "$1" 2>&1 || true; }  # SELECTs only; the read-only role may not call aurora.battlemetrics_token()
query_file() { "$CLI" db query --remote="$PROJECT" --yes -f "$1" 2>&1 || true; }

STATE_SQL="SELECT CASE WHEN aurora.battlemetrics_token() IS NOT NULL THEN 'TOKEN_SAVED'
  WHEN EXISTS (SELECT 1 FROM vault.secrets WHERE name = '$SECRET') THEN 'TOKEN_TOO_SHORT'
  ELSE 'NO_TOKEN' END AS state"

login_expired() { printf '%s' "$1" | grep -q 'Invalid access token\|status 401\|not logged in\|Access token not provided'; }

if [ "$MODE" != "dry-run" ]; then
  # Check the login with a harmless read. An expired login is the usual failure.
  say "Checking the Supabase login (project dystopianoutcasts.wiki)..."
  STATE_OUT="$(query_read "$STATE_SQL")"
  if login_expired "$STATE_OUT"; then
    [ -t 0 ] || fail "the Supabase login has expired. Run this script in a Git Bash window so it can log you in."
    say "Your Supabase login has expired. Logging in now: a browser window opens; finish there, then come back."
    "$CLI" login || fail "supabase login did not finish."
    STATE_OUT="$(query_read "$STATE_SQL")"
  fi
  case "$STATE_OUT" in
    *TOKEN_SAVED*) say "Login works. A BattleMetrics token is already saved in Vault." ;;
    *TOKEN_TOO_SHORT*) say "Login works. A token is saved, but it is too short to be a real one (under 20 characters)." ;;
    *NO_TOKEN*) say "Login works. No BattleMetrics token is saved yet." ;;
    *) printf '%s\n' "$STATE_OUT" >&2; fail "could not read the database (the lines above say why)." ;;
  esac
  if [ "$MODE" = "check" ]; then
    say ""
    say "Hourly jobs:"
    query_read "SELECT jobname, schedule, active FROM cron.job WHERE jobname LIKE 'battlemetrics-%' ORDER BY jobname"
    say "Last fetch:"
    query_read "SELECT rank, players, status, fetched_at, last_error, last_error_at FROM aurora.battlemetrics_status WHERE server_id = '$SERVER'"
    exit 0
  fi
fi

# Read the token: a hidden prompt at a terminal, or one line from a pipe.
if [ -t 0 ]; then
  say ""
  say "Paste the BattleMetrics token, then press Enter. Nothing shows while you paste; that is on purpose."
  IFS= read -r -s TOKEN || true
  say ""
else
  IFS= read -r TOKEN || true
fi
TOKEN="${TOKEN//[$' \t\r\n']/}"
[ -n "$TOKEN" ] || fail "no token was pasted. Nothing was saved."
[ "${#TOKEN}" -ge 20 ] || fail "that is ${#TOKEN} characters; a BattleMetrics token is much longer. Nothing was saved."
# Tokens are JWTs: letters, digits and . _ - (plus + / = ~ to be safe). Anything else,
# a quote above all, means something other than the token was pasted.
[[ "$TOKEN" =~ ^[A-Za-z0-9._~+/=-]+$ ]] || fail "that has characters a token never has (spaces, quotes or the like). Copy just the token and run this again. Nothing was saved."
say "Token read: ${#TOKEN} characters, ending in ...${TOKEN: -4}."

umask 077
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
SQL="$WORK/save-token.sql"
cat >"$SQL" <<SQL
DO \$save\$
DECLARE v_id uuid;
BEGIN
  SELECT id INTO v_id FROM vault.secrets WHERE name = '$SECRET';
  IF v_id IS NULL THEN
    PERFORM vault.create_secret('$TOKEN', '$SECRET', 'BattleMetrics API token for the home page rank (051)');
  ELSE
    PERFORM vault.update_secret(v_id, '$TOKEN');
  END IF;
END
\$save\$;
SQL

if [ "$MODE" = "dry-run" ]; then
  say "Dry run: this is what would be sent (token hidden). Nothing was saved."
  hidden="$(cat "$SQL")"
  printf '%s\n' "${hidden//"$TOKEN"/<token hidden>}"
  exit 0
fi

say "Saving it in Vault..."
OUT="$(query_file "$SQL")"
rm -f "$SQL"
STATE_OUT="$(query_read "$STATE_SQL")"
case "$STATE_OUT" in
  *TOKEN_SAVED*) say "[COMPLETE] Saved. The secret '$SECRET' now holds the new token." ;;
  *) printf '%s\n' "${OUT//"$TOKEN"/<token hidden>}" >&2; fail "the token did not save (the lines above say why)." ;;
esac

# Ask BattleMetrics once now instead of waiting for the next hour.
say ""
say "Asking BattleMetrics for the rank now..."
SENT="$("$CLI" db query --remote="$PROJECT" --yes "SELECT 'SENT_' || aurora.battlemetrics_request() AS requests" 2>&1 || true)"
case "$SENT" in
  *SENT_0*) say "No request went out: the database did not find the token. Run this script with --check."; exit 1 ;;
  *SENT_[1-9]*) ;;
  *) printf '%s\n' "$SENT" >&2; fail "could not start the fetch (the lines above say why). The token is saved; the hourly job will try on its own." ;;
esac
RESULT_SQL="SELECT CASE WHEN fetched_at > now() - interval '10 minutes' AND rank IS NOT NULL THEN 'RANK_' || rank
  WHEN last_error_at > now() - interval '10 minutes' THEN 'ERROR ' || last_error
  ELSE 'WAITING' END AS result
  FROM aurora.battlemetrics_status RIGHT JOIN (SELECT 1) one ON server_id = '$SERVER'"
RESULT=""
for wait_s in 15 30; do
  say "Waiting ${wait_s} seconds for the answer..."
  sleep "$wait_s"
  "$CLI" db query --remote="$PROJECT" --yes "SELECT aurora.battlemetrics_collect() AS answers_read" >/dev/null 2>&1 || true
  RESULT="$(query_read "$RESULT_SQL")"
  case "$RESULT" in *RANK_*|*ERROR*) break ;; esac
done
say ""
case "$RESULT" in
  *RANK_*)
    RANK="$(printf '%s' "$RESULT" | grep -o 'RANK_[0-9]*' | head -1)"
    say "[COMPLETE] BattleMetrics answered: rank #${RANK#RANK_}. The home page shows it within 10 minutes, and it refreshes every hour." ;;
  *403*) say "BattleMetrics refused the token (403): the account needs an active subscription for the API. The token stays saved; the hourly job tries again on its own once the subscription is active." ;;
  *401*) say "BattleMetrics says the token is not valid (401). Make a new token on BattleMetrics and run this script again." ;;
  *ERROR*) printf '%s\n' "$RESULT"; say "BattleMetrics answered with the error above. The token stays saved; the hourly job tries again on its own." ;;
  *) say "No answer yet. The hourly job picks it up within the hour; run this script with --check to see the rank." ;;
esac
