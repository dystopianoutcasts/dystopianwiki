// T41 (owner, 2026-09-29): "player icons have the highest z-value so that they're on
// top of anything that appears, like cars and such things." Leaflet's own default panes
// are, in ascending z-index: tile 200, overlay (vector shapes, e.g. streets/safehouses)
// 400, shadow 500, marker 600, tooltip 650, popup 700. Within one pane, draw order
// follows latitude, so "on top of everything" cannot be guaranteed by z-index alone
// inside the shared marker pane - it needs a pane of its own.
//
// A pure module with no Leaflet import (unlike map/MapView.tsx, which touches `window`
// at load time and cannot be imported under this repo's node test environment - see
// data/useAuroraData.test.ts's own header note) - so its numeric constants can be
// asserted on directly rather than only as source text. map/MapView.tsx imports these
// to create the panes and re-exports them; layers/build.ts imports them directly to
// avoid a circular import between the two.
export const PLAYERS_PANE = 'aurora-players'
/** Above the tooltip pane (650), below popups (700): a player is never hidden by
 * another layer's hover text, and a popup still covers everything. */
export const PLAYERS_PANE_Z_INDEX = 660
export const PLAYER_NAMES_PANE = 'aurora-player-names'
export const PLAYER_NAMES_PANE_Z_INDEX = 670

/** Death markers: above vehicles (the marker pane, 600), below the NPC groups (620) and every player pane. */
export const DEATH_PANE = 'aurora-deaths'
export const DEATH_PANE_Z_INDEX = 610

/** A-Life NPC group markers: above vehicles and every other marker (Leaflet's marker pane is
 * 600), below the tooltip pane (650) and so below the player panes (660, 670). */
export const NPC_PANE = 'aurora-npcs'
export const NPC_PANE_Z_INDEX = 620

/** T68: the map key overlay. Above every marker, tooltip and player pane (so the key is never
 * drawn under a symbol), below a popup (700). Leaflet's zoom buttons live in the control
 * corner (z-index 1000, outside the map pane), so the key can never cover them. A pane moves
 * with the map; map/MapView.tsx moves this one back by the same amount on every pan, so the
 * key stays put on screen beside the zoom buttons. */
export const MAP_KEY_PANE = 'aurora-map-key'
export const MAP_KEY_PANE_Z_INDEX = 690
