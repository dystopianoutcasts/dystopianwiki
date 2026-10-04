import type { ComponentType, ReactNode } from 'react';
import { DISCORD_URL, JOIN_PATH } from '../../lib/links';

// The Outcast invitation at the end of every article (KB05; STYLE.md section 5). The two
// link lines are the owner's words (2026-10-04). All of the wording lives here, so it is
// changed in one place; the links come from lib/links.ts, the same source the home page's
// "Join in three steps" uses.
//
// This view imports neither the router nor a stylesheet, so node:test can render it: the
// in-site link component is passed in (OutcastInvitation passes react-router's Link), and
// the styles (styles/components/outcast-invitation.css) are imported by WikiArticle.

export const INVITATION = {
  title: 'Play and build with us',
  leadIn: 'You read it like an Outcast. Now come build like one.',
  mod: {
    text: 'Mod with us!',
    detail: 'Our Discord, where Outcasts share, test and fix mods together',
  },
  play: {
    text: 'Zomboid with us!',
    detail: 'Join our server in three steps',
  },
} as const;

/** One invitation per page, so a fixed id is safe (and keeps the view hook-free). */
export const INVITATION_TITLE_ID = 'outcast-invitation-title';

export interface InSiteLinkProps {
  to: string;
  className?: string;
  children?: ReactNode;
}

interface OutcastInvitationViewProps {
  /** Renders a link inside this site (react-router's Link in the app). */
  LinkComponent: ComponentType<InSiteLinkProps>;
}

export function OutcastInvitationView({ LinkComponent }: OutcastInvitationViewProps) {
  return (
    <aside className="outcast-invite" aria-labelledby={INVITATION_TITLE_ID}>
      <h2 className="outcast-invite__title" id={INVITATION_TITLE_ID}>
        {INVITATION.title}
      </h2>
      <p className="outcast-invite__lead">{INVITATION.leadIn}</p>
      <ul className="outcast-invite__links">
        <li>
          <a
            className="outcast-invite__link"
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="outcast-invite__text">{INVITATION.mod.text}</span>
            <span className="outcast-invite__detail">{INVITATION.mod.detail}</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
        <li>
          <LinkComponent className="outcast-invite__link" to={JOIN_PATH}>
            <span className="outcast-invite__text">{INVITATION.play.text}</span>
            <span className="outcast-invite__detail">{INVITATION.play.detail}</span>
          </LinkComponent>
        </li>
      </ul>
    </aside>
  );
}
