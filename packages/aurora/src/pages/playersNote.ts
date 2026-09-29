/**
 * The note under the Players layer toggle. Pure so the wording rules are tested.
 *
 * T21 (owner decision 2026-09-29): everyone online shows on the public map, delayed
 * and rounded, and the link-character feature is dormant. So:
 *   - An anonymous visitor with nothing to show sees "Nobody is online right now."
 *     when anonymous positions are on, and the sign-in hint only when they are off.
 *   - Live visibility for your own character and safehouse members is derived from a
 *     LINKED character (aurora.visible_live_usernames starts from my_usernames, which
 *     reads players.linked_user_id). With linking dormant nobody sees anyone live, so
 *     that sentence is only shown while the link feature is enabled.
 */
export interface PlayersNoteInput {
  signedIn: boolean
  positionCount: number
  vis: { delayMinutes: number; roundToCell: boolean; anonPositions: boolean } | undefined
  linkEnabled: boolean
}

export function playersNote({ signedIn, positionCount, vis, linkEnabled }: PlayersNoteInput): string | undefined {
  if (!vis) return undefined
  if (!signedIn && positionCount === 0) {
    return vis.anonPositions ? 'Nobody is online right now.' : 'Sign in to see approximate player positions.'
  }
  const delay = `Other players are shown about ${vis.delayMinutes} minutes late${vis.roundToCell ? ' and rounded to a map cell' : ''}.`
  return linkEnabled ? `${delay} Your own and safehouse members show live.` : delay
}
