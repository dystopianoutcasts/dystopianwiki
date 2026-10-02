/**
 * authError - reads the error Supabase Auth puts in the URL when a sign-in, a
 * registration or "Connect Discord" fails, and turns it into words a member can act on.
 *
 * Supabase sends the error in the query string, the hash, or both
 * (`?error=server_error&error_code=unexpected_failure&error_description=...`), to the
 * redirect URL or, when it cannot use that, to the project's Site URL. The provider's own
 * description is never shown: it is text from a URL anyone can craft, so it only picks
 * one of the fixed messages below.
 *
 * Tests: authError.test.ts (`npm test` in packages/web).
 */

export interface AuthUrlError {
  error: string | null;
  code: string | null;
  description: string | null;
}

export type AuthErrorKind =
  | 'account_create_failed'
  | 'cancelled'
  | 'email_unverified'
  | 'already_linked'
  | 'signups_closed'
  | 'linking_disabled'
  | 'unknown';

const ERROR_KEYS = ['error', 'error_code', 'error_description'] as const;
/** Also removed when tidying the URL: Supabase appends an empty `sb` marker. */
const STRIP_KEYS = [...ERROR_KEYS, 'sb'];

function paramsOf(part: string): URLSearchParams {
  return new URLSearchParams(part.replace(/^[?#]/, ''));
}

function value(a: URLSearchParams, b: URLSearchParams, key: string): string | null {
  const v = (a.get(key) ?? b.get(key) ?? '').trim();
  return v === '' ? null : v;
}

/** The error in a URL's query string and hash, or null when there is none. */
export function readAuthError(search: string, hash: string): AuthUrlError | null {
  const q = paramsOf(search);
  const h = paramsOf(hash);
  const found: AuthUrlError = {
    error: value(q, h, 'error'),
    code: value(q, h, 'error_code'),
    description: value(q, h, 'error_description'),
  };
  return found.error || found.code || found.description ? found : null;
}

export function authErrorKind(e: AuthUrlError): AuthErrorKind {
  const code = (e.code ?? '').toLowerCase();
  const text = (e.description ?? '').toLowerCase();
  if (code === 'identity_already_exists' || /already (been )?linked|identity is already/.test(text)) return 'already_linked';
  if (code === 'manual_linking_disabled' || text.includes('manual linking')) return 'linking_disabled';
  if (code === 'signup_disabled' || /signups? (are )?not allowed/.test(text)) return 'signups_closed';
  if (code === 'email_not_confirmed' || /unverified email|email (address )?(is )?not verified|getting user email/.test(text)) {
    return 'email_unverified';
  }
  if (text.includes('saving new user')) return 'account_create_failed';
  if ((e.error ?? '').toLowerCase() === 'access_denied') return 'cancelled';
  return 'unknown';
}

export const AUTH_ERROR_TEXT: Readonly<Record<AuthErrorKind, string>> = {
  account_create_failed:
    'We could not create your account. That was a fault on our side, not anything you did. Please try again in a few minutes, and if it keeps happening, tell us in the Discord.',
  cancelled: 'The sign-in was cancelled before it finished. You can try again whenever you are ready.',
  email_unverified:
    "Your Discord account's email address is not verified, so Discord would not share it. Verify it in Discord (User Settings, then My Account) and try again, or register with Google and connect Discord afterwards.",
  already_linked:
    'That Discord account is already connected to a different account on this site. Log out, then log in with Discord instead.',
  signups_closed: 'New accounts are closed right now. Please check the Discord for news.',
  linking_disabled: 'Connecting Discord is switched off on our side right now. Please tell us in the Discord.',
  unknown: 'The sign-in did not complete. Please try again, and if it keeps happening, tell us in the Discord.',
};

/** The same query string and hash without the error keys (each keeps its `?` or `#` when anything is left). */
export function withoutAuthError(search: string, hash: string): { search: string; hash: string } {
  const strip = (part: string, mark: '?' | '#') => {
    const p = paramsOf(part);
    let changed = false;
    for (const key of STRIP_KEYS) {
      if (p.has(key)) {
        p.delete(key);
        changed = true;
      }
    }
    if (!changed) return part;
    const rest = p.toString();
    return rest ? `${mark}${rest}` : '';
  };
  return { search: strip(search, '?'), hash: strip(hash, '#') };
}
