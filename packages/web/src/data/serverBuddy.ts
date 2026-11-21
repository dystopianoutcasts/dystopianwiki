/**
 * ServerBuddy: the admins' Windows program for managing our game servers from outside
 * (status, logs, console, restarts, stats, settings, mods, players, Outcast Checkpoint setup, files). Downloaded only from the admin
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

export const SERVERBUDDY_VERSION = '0.6.6'
/** SHA-256 of ServerBuddy-0.6.6.exe (ServerBuddy commit 7ef5691, built 2026-11-21): a restart lock left blank by a crash no longer blocks restarts, a refused scheduled restart shows as "Refused" and on Needs you, restarts follow a host move without reopening the window, the agent is shown as Outcast Checkpoint, and "restart onupdate <server> on|off" turns "Restart when a mod updates" on or off from the command line. */
export const SERVERBUDDY_SHA256 = '984A0B087B999A41956BF103121371C055C95FBD1097B18BE497F6BF980F7762'
export const SERVERBUDDY_BYTES = 16349696
/** When this build was made, ISO date. */
export const SERVERBUDDY_DATE = '2026-11-21'

export const SERVERBUDDY_BUCKET = 'admin-tools'
export const SERVERBUDDY_FILE = `ServerBuddy-${SERVERBUDDY_VERSION}.exe`
/** The object's path inside the bucket. */
export const SERVERBUDDY_OBJECT = `serverbuddy/${SERVERBUDDY_FILE}`
/** How long a signed download link lasts. Long enough to start a download, short enough not to share. */
export const SERVERBUDDY_LINK_SECONDS = 60
