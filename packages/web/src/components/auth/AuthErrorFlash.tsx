/**
 * AuthErrorFlash - when Supabase Auth sends a member back with an error (a failed
 * registration, a cancelled sign-in, a Discord account that cannot be connected), says
 * what happened in plain words at the top of whatever page they landed on, and removes
 * the error from the address bar so a reload or a shared link does not repeat it.
 *
 * Rendered by Layout under the header, so it works on every page, including the home
 * page Supabase falls back to when it cannot use the redirect URL.
 */
import { useEffect, useState } from 'react';
import { AUTH_ERROR_TEXT, withoutAuthError, type AuthErrorKind } from '../../utils/authError';
import { clearPendingAuthError, pendingAuthError } from '../../utils/authErrorCapture';
import '../../styles/components/auth-error-flash.css';

export function AuthErrorFlash() {
  const [kind, setKind] = useState<AuthErrorKind | null>(() => pendingAuthError());

  useEffect(() => {
    if (kind === null) return;
    clearPendingAuthError();
    try {
      const { pathname, search, hash } = window.location;
      const clean = withoutAuthError(search, hash);
      if (clean.search !== search || clean.hash !== hash) {
        window.history.replaceState(window.history.state, '', `${pathname}${clean.search}${clean.hash}`);
      }
    } catch {
      /* the message still shows */
    }
  }, [kind]);

  // The button disappears with the message, so put keyboard focus on the page's heading
  // instead of letting it fall back to the top of the document.
  const dismiss = () => {
    setKind(null);
    requestAnimationFrame(() => {
      const target =
        document.querySelector<HTMLElement>('main h1') ??
        document.querySelector<HTMLElement>('h1') ??
        document.querySelector<HTMLElement>('main');
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus();
    });
  };

  if (kind === null) return null;

  return (
    <div className="auth-error-flash" role="alert">
      <div className="auth-error-flash__inner">
        <p className="auth-error-flash__text">{AUTH_ERROR_TEXT[kind]}</p>
        <button type="button" className="auth-error-flash__dismiss" onClick={dismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
