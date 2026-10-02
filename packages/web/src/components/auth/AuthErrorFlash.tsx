/**
 * AuthErrorFlash - when Supabase Auth sends a member back with an error (a failed
 * registration, a cancelled sign-in, a Discord account that cannot be connected), says
 * what happened in plain words at the top of whatever page they landed on, and removes
 * the error from the address bar so a reload or a shared link does not repeat it.
 *
 * One error is handled instead of shown: "Connect Discord" refused because that Discord
 * account already has its own account here. If the member pressed the button (a fresh
 * mark from discordLinkIntent), the site logs them in with Discord - the account that
 * can vote - and returns them to the page they were on, where a notice says so. The
 * notice needs proof the switch happened (the session now has Discord); any other error
 * on the way back throws the mark away.
 *
 * Rendered by Layout under the header, so it works on every page, including the home
 * page Supabase falls back to when it cannot use the redirect URL. /login forwards a
 * signed-in member straight on, so an error that lands there is kept for the next page.
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AUTH_ERROR_TEXT, withoutAuthError, type AuthErrorKind } from '../../utils/authError';
import { clearPendingAuthError, pendingAuthError } from '../../utils/authErrorCapture';
import { hasLinkIntent, rememberSwitched, takeLinkIntent, takeSwitched } from '../../utils/discordLinkIntent';
import { hasDiscordIdentity } from '../../utils/memberProfile';
import '../../styles/components/auth-error-flash.css';

const SWITCHED_TEXT =
  'That Discord account was already registered here, so you are now logged in with it.';

type Shown =
  | { type: 'error'; kind: AuthErrorKind }
  | { type: 'switching' }
  | { type: 'switched' }
  | null;

function initial(): Shown {
  const kind = pendingAuthError();
  if (kind === null) return null;
  // Decide before the first paint, so the warning never flashes up ahead of the switch.
  if (kind === 'already_linked' && hasLinkIntent()) return { type: 'switching' };
  return { type: 'error', kind };
}

export function AuthErrorFlash() {
  const { user, loading, signInWithOAuth } = useAuth();
  const { pathname } = useLocation();
  const [shown, setShown] = useState<Shown>(initial);
  const switchStarted = useRef(false);
  const onLoginPage = pathname === '/login' || pathname === '/register';

  // Tidy the address bar once an error has been read. Any error other than the switch
  // means a switch that was under way did not complete.
  useEffect(() => {
    if (shown?.type !== 'error' && shown?.type !== 'switching') return;
    if (shown.type === 'error') takeSwitched();
    try {
      const { pathname: path, search, hash } = window.location;
      const clean = withoutAuthError(search, hash);
      if (clean.search !== search || clean.hash !== hash) {
        window.history.replaceState(window.history.state, '', `${path}${clean.search}${clean.hash}`);
      }
    } catch {
      /* the message still shows */
    }
  }, [shown]);

  // Forget the captured error once it has been seen where it will stay on screen.
  useEffect(() => {
    if (shown?.type !== 'error') return;
    if (onLoginPage && (loading || user)) return; // /login is about to forward them
    clearPendingAuthError();
  }, [shown, onLoginPage, loading, user]);

  // "Already linked" after the member pressed Connect Discord: log in with Discord instead.
  useEffect(() => {
    if (shown?.type !== 'switching' || switchStarted.current) return;
    switchStarted.current = true;
    clearPendingAuthError();
    const returnPath = takeLinkIntent();
    if (returnPath === null) {
      setShown({ type: 'error', kind: 'already_linked' });
      return;
    }
    rememberSwitched();
    signInWithOAuth('discord', returnPath).catch(() => {
      takeSwitched();
      setShown({ type: 'error', kind: 'already_linked' });
    });
  }, [shown, signInWithOAuth]);

  // Back from that Discord log-in: say what happened, once, on the page they return to.
  // Once the session has Discord, any leftover intent is spent (the link worked).
  useEffect(() => {
    if (shown !== null || !user || onLoginPage) return;
    if (!hasDiscordIdentity(user)) return;
    takeLinkIntent();
    if (takeSwitched()) setShown({ type: 'switched' });
  }, [shown, user, onLoginPage]);

  // The button disappears with the message, so put keyboard focus on the page's heading
  // instead of letting it fall back to the top of the document.
  const dismiss = () => {
    clearPendingAuthError();
    setShown(null);
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

  if (shown === null) return null;

  if (shown.type === 'switching') {
    return (
      <div className="auth-error-flash auth-error-flash--info" role="status">
        <div className="auth-error-flash__inner">
          <p className="auth-error-flash__text">
            That Discord account is already registered here. Logging you in with it...
          </p>
        </div>
      </div>
    );
  }

  const isError = shown.type === 'error';
  return (
    <div className={isError ? 'auth-error-flash' : 'auth-error-flash auth-error-flash--info'} role={isError ? 'alert' : 'status'}>
      <div className="auth-error-flash__inner">
        <p className="auth-error-flash__text">{isError ? AUTH_ERROR_TEXT[shown.kind] : SWITCHED_TEXT}</p>
        <button type="button" className="auth-error-flash__dismiss" onClick={dismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
