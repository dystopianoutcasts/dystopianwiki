/**
 * The join behind the home page map's dots (hooks/useServerNow.ts), kept free of the
 * Supabase client so it can be tested. Only players who are online now and alive get
 * a dot; the positions view does not filter on online by itself, so a logged-off
 * player can still have a row. Mirrors playerFeatures in
 * packages/aurora/src/layers/transform.ts (copied: aurora is not a dependency here).
 *
 * Each dot carries both names (T62), so the "Survivor name / Username" toggle flips
 * the labels without a refetch.
 *
 * The "Who is on now" list is NOT the dots (T77): it is every online player, so its
 * count agrees with the counter (home_summary_tz online_now) and the map's "Online
 * now". A player with a dot can be shown on the map; a dead one or one without a
 * visible position is listed without one (buildOnlineList).
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
  const drawable = new Map(
    players.filter((p) => p.online && !p.is_dead).map((p) => [p.username, p.display_name || null]),
  )
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

/** Why a listed player has no dot on the map. */
export type NoDotReason = 'dead' | 'no-position'

/** One entry of "Who is on now": every online player, with their dot when they have one. */
export interface OnlinePlayer {
  /** Stable key for React: the username. */
  id: string
  username: string
  displayName: string | null
  /** The player's dot on the home map, or null when they have none. */
  dot: MapDot | null
  /** Set exactly when dot is null. */
  noDot: NoDotReason | null
}

/**
 * Every online player for "Who is on now" (T77), dead or alive, with or without a
 * position, in the order the rows came (OnlinePlayer order is decided by sortOnline,
 * which needs the name mode). `dots` is buildDots' output for the same rows.
 */
export function buildOnlineList(players: PlayerRow[], dots: MapDot[]): OnlinePlayer[] {
  const dotFor = new Map(dots.map((d) => [d.username, d]))
  const seen = new Set<string>()
  const out: OnlinePlayer[] = []
  for (const p of players) {
    if (!p.online || seen.has(p.username)) continue
    seen.add(p.username)
    const dot = dotFor.get(p.username) ?? null
    out.push({
      id: p.username,
      username: p.username,
      displayName: p.display_name || null,
      dot,
      noDot: dot ? null : p.is_dead ? 'dead' : 'no-position',
    })
  }
  return out
}
