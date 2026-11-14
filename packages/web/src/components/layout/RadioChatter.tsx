/**
 * Radio chatter in the footer: one short line from Boone, callsign Ringtail, picked once per
 * visit (DystopianOutcasts repo, DOCS/LORE/Boone.md; the lines are PROPOSED there until the owner
 * rules). Plain text, so screen readers read it like any other footer line.
 */

export const CHATTER_LINES = [
  'Ringtail, say status. ... Still flying.',
  'Ringtail here. No friendlies on the ground.',
  'Ringtail here. Fuel low, ammo low, still here.',
  'Ringtail, check in. ... Alone. Living. Surviving.',
  'Ringtail to anyone on this frequency: keep your head down.',
  'Ringtail here. Passed my brother on another billboard. Kept flying.',
  'Ringtail, how many today? ... Lost count.',
  'Ringtail here. Somebody leave a light on.',
] as const;

/** The line for a random number in [0, 1). */
export function chatterLine(random: number): string {
  const i = Math.min(CHATTER_LINES.length - 1, Math.max(0, Math.floor(random * CHATTER_LINES.length)));
  return CHATTER_LINES[i];
}

// Chosen on first use and kept for the visit, so moving between pages does not change it.
let visitLine: string | null = null;

export function RadioChatter({ random }: { random?: number }) {
  const line = random === undefined ? (visitLine ??= chatterLine(Math.random())) : chatterLine(random);
  return (
    <p className="footer__radio">
      <span className="footer__radio-channel">CH 7</span> {line}
    </p>
  );
}
