/**
 * discordLinkIntent - remembers that a member pressed "Connect Discord", so that when
 * Supabase answers "that Discord account is already linked to another account", the site
 * can log them in with Discord instead (the account that owns their Discord, which can
 * vote) rather than leave them stuck.
 *
 * Two short-lived marks in sessionStorage:
 *   - the link intent, set when the button is pressed: where to return to. Only a
 *     fresh intent allows the switch, so a crafted link cannot start one.
 *   - the switch notice, set when the switch starts: shown once on arrival.
 * Every storage access is wrapped; without storage the member simply sees the
 * "already connected" message instead.
 *
 * Tests: discordLinkIntent.test.ts (`npm test` in packages/web).
 */
import { safeNext } from './safeNext';

const INTENT_KEY = 'do.discord.link';
const SWITCH_KEY = 'do.discord.switched';
const MAX_AGE_MS = 10 * 60 * 1000;

function write(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

/** Reads and clears a mark; null when missing, malformed or older than ten minutes. */
function take(key: string): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw === null) return null;
    sessionStorage.removeItem(key);
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const at = (parsed as { at?: unknown }).at;
    if (typeof at !== 'number' || Date.now() - at > MAX_AGE_MS || at > Date.now() + 60_000) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Called by "Connect Discord" just before it leaves for Discord. */
export function rememberLinkIntent(returnPath: string): void {
  write(INTENT_KEY, { path: safeNext(returnPath) ?? '/', at: Date.now() });
}

/** Whether a fresh intent is waiting, without using it up. */
export function hasLinkIntent(): boolean {
  try {
    const raw = sessionStorage.getItem(INTENT_KEY);
    if (raw === null) return false;
    const parsed: unknown = JSON.parse(raw);
    const at = typeof parsed === 'object' && parsed !== null ? (parsed as { at?: unknown }).at : undefined;
    return typeof at === 'number' && Date.now() - at <= MAX_AGE_MS && at <= Date.now() + 60_000;
  } catch {
    return false;
  }
}

/** Where to send the member after switching to their Discord account, or null when they never pressed the button. */
export function takeLinkIntent(): string | null {
  const mark = take(INTENT_KEY);
  if (!mark || typeof mark.path !== 'string') return null;
  return safeNext(mark.path);
}

export function rememberSwitched(): void {
  write(SWITCH_KEY, { at: Date.now() });
}

/** True once, on arrival after the switch. */
export function takeSwitched(): boolean {
  return take(SWITCH_KEY) !== null;
}
