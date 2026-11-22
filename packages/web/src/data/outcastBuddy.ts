/**
 * Outcast Checkpoint (formerly Outcast Buddy): the helper that lets Project Zomboid load the Java parts of our mods
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
export const INSTALLER_VERSION = '3.0.0-beta20'
/** SHA-256 of OutcastCheckpointInstaller.exe in that release (checked 2026-11-21 against GitHub's digest). */
export const INSTALLER_SHA256 = '37E11075A0BCAE2A5025CFE1B5CF5646655738B4D7E2D5FE13757470DC81BB0F'
export const INSTALLER_BYTES = 9259008
/** When the release was published, ISO date. */
export const INSTALLER_DATE = '2026-11-21'

/**
 * The one released installer that could stop the game from starting (two "--" in the Steam
 * launch options). Fixed on purpose: it names that old release, not the current one.
 */
export const BROKEN_INSTALLER_VERSION = '3.0.0-beta3'

export const INSTALLER_FILE = 'OutcastCheckpointInstaller.exe'
export const INSTALLER_REPO_URL = 'https://github.com/dystopianoutcasts/OutcastBuddy-Installer'
export const INSTALLER_DOWNLOAD_URL = `${INSTALLER_REPO_URL}/releases/download/v${INSTALLER_VERSION}/${INSTALLER_FILE}`
export const INSTALLER_RELEASES_URL = `${INSTALLER_REPO_URL}/releases`

/** The three systems the installer is released for (Linux and Mac since 3.0.0-beta20). */
export type BuddySystem = 'windows' | 'mac' | 'linux'

export type BuddyDownload = {
  system: BuddySystem
  /** The name on the system picker. */
  label: string
  file: string
  sha256: string
  bytes: number
  url: string
  /** The command that prints a file's SHA-256 on that system, with the file name filled in. */
  hashCommand: string
  /** Where to type hashCommand. */
  hashWhere: string
  /** Built and tested against fake Steam folders only, not yet on a real machine of that system. */
  firstTestBuild: boolean
}

function download(system: BuddySystem, label: string, file: string, sha256: string, bytes: number,
  hashCommand: string, hashWhere: string, firstTestBuild: boolean): BuddyDownload {
  return {
    system, label, file, sha256, bytes, hashCommand, hashWhere, firstTestBuild,
    url: `${INSTALLER_REPO_URL}/releases/download/v${INSTALLER_VERSION}/${file}`,
  }
}

/** Each system's file in the INSTALLER_VERSION release; SHA-256 checked 2026-11-21 against GitHub's digests. */
export const BUDDY_DOWNLOADS: Record<BuddySystem, BuddyDownload> = {
  windows: download('windows', 'Windows', INSTALLER_FILE, INSTALLER_SHA256, INSTALLER_BYTES,
    `Get-FileHash .\\${INSTALLER_FILE}`, 'In PowerShell, in your Downloads folder, run', false),
  mac: download('mac', 'Mac', 'outcast-checkpoint-installer-mac.zip',
    '2BFAB8B0AE751E4184080C954E8D64323FE25974991D780156C4F1E9D08DCD67', 7436761,
    'shasum -a 256 outcast-checkpoint-installer-mac.zip', 'In Terminal, in your Downloads folder, run', true),
  linux: download('linux', 'Linux and Steam Deck', 'outcast-checkpoint-installer-linux-amd64.tar.gz',
    '9372D0D414B65733B164356C790944FECDD29B1C08A0CE5542371DFFCB0545F2', 3879710,
    'sha256sum outcast-checkpoint-installer-linux-amd64.tar.gz', 'In a terminal, in your Downloads folder, run', true),
}

export const BUDDY_SYSTEMS: BuddySystem[] = ['windows', 'mac', 'linux']

/**
 * The visitor's system, from the browser's own report. Phones, tablets and anything unknown get Windows, the
 * system most players have. iPads report "Macintosh", so a Mac report with a touch screen counts as not a Mac.
 */
export function detectSystem(platform: string, userAgent: string, touchPoints: number): BuddySystem {
  const text = `${platform} ${userAgent}`.toLowerCase()
  if (/android|iphone|ipad|ipod/.test(text)) return 'windows'
  if (/mac/.test(text)) return touchPoints > 1 ? 'windows' : 'mac'
  if (/linux|x11|cros/.test(text)) return 'linux'
  return 'windows'
}

/** The Workshop item (unlisted, so it is reached by this link only). */
export const BUDDY_WORKSHOP_ID = '3838159103'
export const BUDDY_WORKSHOP_URL = `https://steamcommunity.com/sharedfiles/filedetails/?id=${BUDDY_WORKSHOP_ID}`
export const BUDDY_WORKSHOP_STEAM_URL = `steam://url/CommunityFilePage/${BUDDY_WORKSHOP_ID}`

/** "3.8 MB" */
export function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
