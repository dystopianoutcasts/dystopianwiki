import { useId } from 'react';
import { useHomeSummary } from '../../hooks/useHomeSummary';
import { joiningText } from '../../lib/homeSummary';
import { SERVER_IP, SERVER_PORT } from '../../lib/links';
import { CopyField } from './CopyField';
import { GetTheModsStep } from './GetTheModsStep';

// "Join in three steps". Step 1 links the Workshop collection (owner, 2026-10-03;
// GetTheModsStep, ids in lib/links.ts); the address is the owner's (lib/links.ts); the
// mod count and the joining rules come from the server's own settings (027).

const DISCORD = 'https://discord.gg/KgNBWyfcvZ';

export function JoinSteps() {
  const { summary } = useHomeSummary();
  const titleId = useId();
  const workshop = Array.isArray(summary?.settings.WorkshopItems)
    ? (summary?.settings.WorkshopItems as unknown[]).length
    : null;

  return (
    <section className="home-section home-section--alt" aria-labelledby={titleId}>
      <div className="home-section__inner">
        <h2 className="home-section__title" id={titleId}>
          Join in three steps
        </h2>
        <ol className="home-steps">
          <GetTheModsStep workshop={workshop} />
          <li className="home-step">
            <span className="home-step__number" aria-hidden="true">2</span>
            <h3 className="home-step__title">Connect</h3>
            <p>In Project Zomboid, choose Join, then add the server by its address.</p>
            <p className="home-step__detail">
              IP: <CopyField value={SERVER_IP} what="IP" />, port:{' '}
              <CopyField value={String(SERVER_PORT)} what="port" />
            </p>
            <p className="home-step__detail">Joining: {joiningText(summary)}</p>
          </li>
          <li className="home-step">
            <span className="home-step__number" aria-hidden="true">3</span>
            <h3 className="home-step__title">Say hi on Discord</h3>
            <p>Find people to survive with, ask questions, and hear about events first.</p>
            <p className="home-step__detail">
              <a href={DISCORD} target="_blank" rel="noopener noreferrer">
                Join our Discord
              </a>
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}
