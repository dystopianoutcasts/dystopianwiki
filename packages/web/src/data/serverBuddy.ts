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

export const SERVERBUDDY_VERSION = '0.6.5'
/** SHA-256 of ServerBuddy-0.6.5.exe (ServerBuddy commit cbe7ae5, built 2026-11-21): one program (the command line is built in), "Java on this server" (each Java mod's version, newest or not, running or blocked, Approve), and "Set up Outcast on this server" (one button: adds Outcast Buddy, its startup line, the Java approvals and the restart loop, restarts only when needed, and finishes by itself). */
export const SERVERBUDDY_SHA256 = '67593C692E87A9A37C0C930156BF34AA91CE83A5FBF402B6A0ADDC89073647AD'
export const SERVERBUDDY_BYTES = 16327168
/** When this build was made, ISO date. */
export const SERVERBUDDY_DATE = '2026-11-21'

export const SERVERBUDDY_BUCKET = 'admin-tools'
export const SERVERBUDDY_FILE = `ServerBuddy-${SERVERBUDDY_VERSION}.exe`
/** The object's path inside the bucket. */
export const SERVERBUDDY_OBJECT = `serverbuddy/${SERVERBUDDY_FILE}`
/** How long a signed download link lasts. Long enough to start a download, short enough not to share. */
export const SERVERBUDDY_LINK_SECONDS = 60
