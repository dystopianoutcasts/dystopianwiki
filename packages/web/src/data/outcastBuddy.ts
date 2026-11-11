/**
 * Outcast Buddy: the helper that lets Project Zomboid load the Java parts of our mods
 * (Outcast Viewpoint, the Outcast loading screen). Shown at /buddy.
 *
 * The installer file is served from the GitHub release, not copied onto this site, so there is
 * one official file and the mod's own Install Instructions (which point at that release) stay
 * true. The download button links to this exact release, so the SHA-256 shown always matches
 * the file a player gets.
 *
 * Each new installer release: update INSTALLER_VERSION, INSTALLER_SHA256, INSTALLER_BYTES and
 * INSTALLER_DATE from `gh release view <tag> -R dystopianoutcasts/OutcastBuddy-Installer`,
 * then rebuild and deploy the site.
 */

/** The release tag on dystopianoutcasts/OutcastBuddy-Installer, without the leading "v". */
export const INSTALLER_VERSION = '3.0.0-beta3'
/** SHA-256 of OutcastBuddyInstaller.exe in that release (checked 2026-11-11 against the download). */
export const INSTALLER_SHA256 = '00B573A1247EC5F79547A179134E45A180177DA364C82F3277D83474F33663FB'
export const INSTALLER_BYTES = 3993088
/** When the release was published, ISO date. */
export const INSTALLER_DATE = '2026-11-11'

export const INSTALLER_FILE = 'OutcastBuddyInstaller.exe'
export const INSTALLER_REPO_URL = 'https://github.com/dystopianoutcasts/OutcastBuddy-Installer'
export const INSTALLER_DOWNLOAD_URL = `${INSTALLER_REPO_URL}/releases/download/v${INSTALLER_VERSION}/${INSTALLER_FILE}`
export const INSTALLER_RELEASES_URL = `${INSTALLER_REPO_URL}/releases`

/** The Workshop item (unlisted, so it is reached by this link only). */
export const BUDDY_WORKSHOP_ID = '3837533847'
export const BUDDY_WORKSHOP_URL = `https://steamcommunity.com/sharedfiles/filedetails/?id=${BUDDY_WORKSHOP_ID}`
export const BUDDY_WORKSHOP_STEAM_URL = `steam://url/CommunityFilePage/${BUDDY_WORKSHOP_ID}`

/** "3.8 MB" */
export function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
