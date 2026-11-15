/**
 * ServerBuddy: the admins' Windows program for managing our game servers from outside
 * (status, logs, console, restarts, stats, settings, mods, players, Outcast Buddy setup, files). Downloaded only from the admin
 * dashboard (/admin), never from a public link.
 *
 * The file lives in the private Storage bucket `admin-tools` (migration 047). Storage gives a
 * signed link only to a website admin, so nothing here is a secret: the version, size and hash
 * only let an admin check the file they got.
 *
 * Each new release: upload ServerBuddy-<version>.exe to `admin-tools/serverbuddy/` from the
 * Supabase dashboard's Storage page, then update SERVERBUDDY_VERSION, SERVERBUDDY_SHA256,
 * SERVERBUDDY_BYTES and SERVERBUDDY_DATE here, rebuild and deploy the site.
 */

export const SERVERBUDDY_VERSION = '0.6.0'
/** SHA-256 of ServerBuddy-0.6.0.exe (ServerBuddy commit c66a807, built 2026-11-15): the at-a-glance dashboard (All servers, Overview with Restart/Stop/Message/Update, What happened, Performance graphs), Java mod approvals for the pack, and the 0.5 tools (logs, console, restarts, schedules, settings, mods, players, the sb command line). */
export const SERVERBUDDY_SHA256 = '6A159EA9F99F701B73FC806DFD1C78B412DA6058845D4309A39ADB1FB148BF64'
export const SERVERBUDDY_BYTES = 15523840
/** When this build was made, ISO date. */
export const SERVERBUDDY_DATE = '2026-11-15'

export const SERVERBUDDY_BUCKET = 'admin-tools'
export const SERVERBUDDY_FILE = `ServerBuddy-${SERVERBUDDY_VERSION}.exe`
/** The object's path inside the bucket. */
export const SERVERBUDDY_OBJECT = `serverbuddy/${SERVERBUDDY_FILE}`
/** How long a signed download link lasts. Long enough to start a download, short enough not to share. */
export const SERVERBUDDY_LINK_SECONDS = 60
