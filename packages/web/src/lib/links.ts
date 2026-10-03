/**
 * External links used in more than one place.
 *
 * Indifferent Broccoli hosts the Dystopian Outcasts servers; a donation made here
 * goes straight to them and pays for those servers only.
 */
export const SUPPORT_URL = 'https://payment.indifferentbroccoli.com/b/aEU3e1b6m2zh4ghgzh'

/** The game server. The owner gave this new address on 2026-10-02; it replaced an earlier host. The in-game Join screen asks for the two separately. */
export const SERVER_IP = '208.75.182.207'
export const SERVER_PORT = 27130
export const SERVER_ADDRESS = `${SERVER_IP}:${SERVER_PORT}`

/** The server's Steam Workshop collection. The owner gave this id on 2026-10-03. */
export const WORKSHOP_COLLECTION_ID = '3812193886'
/** The collection page in a web browser (owner, 2026-10-03). Steam may ask a browser to sign in. */
export const WORKSHOP_COLLECTION_URL = `https://steamcommunity.com/sharedfiles/filedetails/?id=${WORKSHOP_COLLECTION_ID}`
/** The same page inside the Steam app, already signed in (owner request, 2026-10-03). Needs Steam installed on this computer. */
export const WORKSHOP_COLLECTION_STEAM_URL = 'steam://url/CommunityFilePage/' + WORKSHOP_COLLECTION_ID
