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

export const SERVERBUDDY_VERSION = '0.1.2'
/** SHA-256 of ServerBuddy-0.1.2.exe (ServerBuddy commit 3f5c739, built 2026-11-14): the ringtail stripes icon. */
export const SERVERBUDDY_SHA256 = '1C05A157FBD299DBAABC8E24FCA506BD3C58E53B6D9538DB72A0718C34A6AE09'
export const SERVERBUDDY_BYTES = 11368448
/** When this build was made, ISO date. */
export const SERVERBUDDY_DATE = '2026-11-14'

export const SERVERBUDDY_BUCKET = 'admin-tools'
export const SERVERBUDDY_FILE = `ServerBuddy-${SERVERBUDDY_VERSION}.exe`
/** The object's path inside the bucket. */
export const SERVERBUDDY_OBJECT = `serverbuddy/${SERVERBUDDY_FILE}`
/** How long a signed download link lasts. Long enough to start a download, short enough not to share. */
export const SERVERBUDDY_LINK_SECONDS = 60
