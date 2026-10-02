/**
 * authErrorCapture - keeps the sign-in error from the URL the page was opened with.
 *
 * Imported first in main.tsx, so it reads the address before the Supabase client is
 * created and can tidy the hash. The flash (components/auth/AuthErrorFlash.tsx) shows it
 * once; after that it is gone, so moving to another page does not show it again.
 */
import { authErrorKind, readAuthError, type AuthErrorKind } from './authError';

let pending: AuthErrorKind | null = null;
try {
  const found = readAuthError(window.location.search, window.location.hash);
  pending = found ? authErrorKind(found) : null;
} catch {
  pending = null;
}

/** The error kind the page was opened with, until it has been shown. */
export function pendingAuthError(): AuthErrorKind | null {
  return pending;
}

/** Called once the flash is on screen. */
export function clearPendingAuthError(): void {
  pending = null;
}
