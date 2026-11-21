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

export const SERVERBUDDY_VERSION = '0.6.3'
/** SHA-256 of ServerBuddy-0.6.3.exe (ServerBuddy commit f41616b, built 2026-11-15): 0.6.0's dashboard plus Files search (find in this folder, also by a Workshop folder's mod name) and a clickable path, restarts refused while a newly set up restart loop is not running yet, events that name a Workshop item the server could not download, restart warnings that save as they are typed, and a default restart every 8 hours. */
export const SERVERBUDDY_SHA256 = '1086D2AABB373480B922BFA5122705C294BDA942D0B351DFBC3495BFB2C7962D'
export const SERVERBUDDY_BYTES = 15608832
/** When this build was made, ISO date. */
export const SERVERBUDDY_DATE = '2026-11-15'

export const SERVERBUDDY_BUCKET = 'admin-tools'
export const SERVERBUDDY_FILE = `ServerBuddy-${SERVERBUDDY_VERSION}.exe`
/** The object's path inside the bucket. */
export const SERVERBUDDY_OBJECT = `serverbuddy/${SERVERBUDDY_FILE}`
/** How long a signed download link lasts. Long enough to start a download, short enough not to share. */
export const SERVERBUDDY_LINK_SECONDS = 60
