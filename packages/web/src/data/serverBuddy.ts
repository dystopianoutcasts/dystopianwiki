/**
 * ServerBuddy: the admins' Windows program for managing our game servers from outside
 * (status, logs, console, restarts, stats, settings, mods, players, Outcast Overclock setup, files). Downloaded only from the admin
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

export const SERVERBUDDY_VERSION = '0.6.10'
/** SHA-256 of ServerBuddy-0.6.10.exe (ServerBuddy commit ce3bc12, built 2026-11-22). Changes:
 * - Outcast Overclock runs from a fixed copy in the game folder, never from the Workshop folder a Steam update can empty.
 * - The restart loop checks that jar before each start.
 * - Every countdown call has a time limit, each server counts down on its own, and a crash leaves a record.
 * - A missed scheduled restart shows on Needs you.
 * - The [Overclock] log tag and the name Outcast Overclock are recognized. */
export const SERVERBUDDY_SHA256 = '4BFB0295C92E6E0643F2F3E776D1F1F0C3D0676F340B3D7B70119D7E17541EC8'
export const SERVERBUDDY_BYTES = 16565248
/** When this build was made, ISO date. */
export const SERVERBUDDY_DATE = '2026-11-22'

export const SERVERBUDDY_BUCKET = 'admin-tools'
export const SERVERBUDDY_FILE = `ServerBuddy-${SERVERBUDDY_VERSION}.exe`
/** The object's path inside the bucket. */
export const SERVERBUDDY_OBJECT = `serverbuddy/${SERVERBUDDY_FILE}`
/** How long a signed download link lasts. Long enough to start a download, short enough not to share. */
export const SERVERBUDDY_LINK_SECONDS = 60
