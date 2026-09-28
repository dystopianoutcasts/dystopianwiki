// SSH host-key pinning helpers (no npm imports, so they are testable on their own).
//
// A pin is an OpenSSH-style fingerprint: `SHA256:<base64, no padding>`, as printed
// by `ssh-keygen -lf` / `ssh-keyscan`. `ssh2` hands the verifier the raw host-key
// blob, whose SHA-256 is exactly that fingerprint.

/** Parse a comma-separated pin list from a secret or env var. */
export function parsePins(raw: string | undefined | null): string[] {
  return (raw ?? '').split(',').map((s) => s.trim()).filter(Boolean).map(normalizePin);
}

export function normalizePin(pin: string): string {
  const bare = pin.replace(/^SHA256:/i, '').replace(/=+$/, '');
  return `SHA256:${bare}`;
}

export async function fingerprint(key: Uint8Array): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new Uint8Array(key)));
  let bin = '';
  for (const b of digest) bin += String.fromCharCode(b);
  return `SHA256:${btoa(bin).replace(/=+$/, '')}`;
}

export async function hostKeyMatches(key: Uint8Array, pins: string[]): Promise<boolean> {
  if (pins.length === 0) return false;
  const got = await fingerprint(key);
  return pins.some((p) => p === got);
}
