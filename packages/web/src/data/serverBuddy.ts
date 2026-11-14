/**
 * ServerBuddy: the admins' Windows program for managing our game servers from outside
 * (status, Outcast Buddy setup, files, logs, console). Downloaded only from the admin
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

export const SERVERBUDDY_VERSION = '0.1.1'
/** SHA-256 of ServerBuddy-0.1.1.exe (ServerBuddy commit c11f150, built 2026-11-13). */
export const SERVERBUDDY_SHA256 = '4B784CCC42ECBBD758B54EDBA8C2CE445FFD240C260AD8E1BC18020F43F8F6F1'
export const SERVERBUDDY_BYTES = 11353600
/** When this build was made, ISO date. */
export const SERVERBUDDY_DATE = '2026-11-13'

export const SERVERBUDDY_BUCKET = 'admin-tools'
export const SERVERBUDDY_FILE = `ServerBuddy-${SERVERBUDDY_VERSION}.exe`
/** The object's path inside the bucket. */
export const SERVERBUDDY_OBJECT = `serverbuddy/${SERVERBUDDY_FILE}`
/** How long a signed download link lasts. Long enough to start a download, short enough not to share. */
export const SERVERBUDDY_LINK_SECONDS = 60
