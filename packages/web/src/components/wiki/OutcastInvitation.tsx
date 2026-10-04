import { Link } from 'react-router-dom';
import { OutcastInvitationView, type InSiteLinkProps } from './OutcastInvitationView';

// The Outcast invitation at the end of every article (KB05). The wording and the links are in
// OutcastInvitationView; this wrapper only supplies the router's Link, so "Zomboid with us!"
// moves to /#join without reloading the site (ScrollToHash then scrolls to the section).

function InSiteLink({ to, className, children }: InSiteLinkProps) {
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

export function OutcastInvitation() {
  return <OutcastInvitationView LinkComponent={InSiteLink} />;
}
