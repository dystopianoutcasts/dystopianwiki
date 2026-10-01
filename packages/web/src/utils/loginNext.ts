/**
 * loginNext - carries the "next" destination across the OAuth round trip.
 *
 * The primary carrier is the redirect URL (`/login?next=...`). A short-lived copy in
 * sessionStorage is the backup, for the case where the identity provider returns the
 * member somewhere other than the exact redirect URL. Every storage access is wrapped:
 * storage can be blocked or throw, and the page must still work without it.
 */
import { safeNext, isMapPath } from './safeNext';

const STORAGE_KEY = 'do.login.next';
const MAX_AGE_MS = 10 * 60 * 1000;

export function rememberNext(next: string | null): void {
  try {
    if (next === null) {
      sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ next, at: Date.now() }));
  } catch {
    /* storage unavailable: the query string still carries it */
  }
}

/** Reads and clears the remembered destination. Re-validates it; expired or bad -> null. */
export function takeRememberedNext(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { next, at } = parsed as { next?: unknown; at?: unknown };
    if (typeof next !== 'string' || typeof at !== 'number') return null;
    if (Date.now() - at > MAX_AGE_MS) return null;
    return safeNext(next);
  } catch {
    return null;
  }
}

/** `/login?next=<encoded path>`; no next for the login and register pages themselves. */
export function loginUrlFor(pathWithSearch: string): string {
  const next = safeNext(pathWithSearch);
  if (next === null || /^\/(login|register)([/?]|$)/.test(next)) return '/login';
  return `/login?next=${encodeURIComponent(next)}`;
}

/** Sends the member on. The map is a separate app, so it gets a full page load. */
export function goTo(path: string, navigate: (to: string, opts?: { replace?: boolean }) => void): void {
  const safe = safeNext(path) ?? '/';
  if (isMapPath(safe)) {
    window.location.assign(safe);
  } else {
    navigate(safe, { replace: true });
  }
}
