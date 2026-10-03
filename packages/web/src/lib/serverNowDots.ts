/**
 * The join behind the home page map's dots (hooks/useServerNow.ts), kept free of the
 * Supabase client so it can be tested. Only players who are online now and alive get
 * a dot; the positions view does not filter on online by itself, so a logged-off
 * player can still have a row. Mirrors playerFeatures in
 * packages/aurora/src/layers/transform.ts (copied: aurora is not a dependency here).
 *
 * Each dot carries both names (T62), so the "Survivor name / Username" toggle flips
 * the labels without a refetch.
 */

export interface MapDot {
  /** Stable key for React: the username. Never rendered as such. */
  id: string
  /** The account username (public by owner decision, T44). */
  username: string
  /** The survivor's name, or null when the game has none for them. */
  displayName: string | null
  /** displayName, falling back to username: the survivor-name label. */
  name: string
  /** World squares. */
  x: number
  y: number
}

export interface PlayerRow {
  username: string
  display_name: string | null
  online: boolean
  is_dead: boolean | null
}

export interface PositionRow {
  username: string
  x: number
  y: number
}

export function buildDots(players: PlayerRow[], positions: PositionRow[]): MapDot[] {
  const drawable = new Map(players.filter((p) => !p.is_dead).map((p) => [p.username, p.display_name || null]))
  return positions
    .filter((pos) => drawable.has(pos.username) && Number.isFinite(pos.x) && Number.isFinite(pos.y))
    .map((pos) => {
      const displayName = drawable.get(pos.username) ?? null
      return {
        id: pos.username,
        username: pos.username,
        displayName,
        name: displayName || pos.username,
        x: pos.x,
        y: pos.y,
      }
    })
}
