import { useId } from 'react';
import { useHomeSummary } from '../../hooks/useHomeSummary';
import { joiningText, TBD } from '../../lib/homeSummary';
import { SERVER_IP, SERVER_PORT } from '../../lib/links';

// "Join in three steps". The Workshop collection link is not published yet (the
// owner decides), so it reads TBD; the address is the owner's (lib/links.ts); the mod
// count and the joining rules come from the server's own settings (027).

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
          <li className="home-step">
            <span className="home-step__number" aria-hidden="true">1</span>
            <h3 className="home-step__title">Get the mods</h3>
            <p>
              Subscribe to our Steam Workshop collection so the game downloads every mod the server runs
              {workshop !== null ? ` (${workshop} Workshop items)` : ''}.
            </p>
            <p className="home-step__detail">
              Collection link: <span className="home-tbd">{TBD}</span>
            </p>
          </li>
          <li className="home-step">
            <span className="home-step__number" aria-hidden="true">2</span>
            <h3 className="home-step__title">Connect</h3>
            <p>In Project Zomboid, choose Join, then add the server by its address.</p>
            <p className="home-step__detail">
              IP: <code className="home-address__value">{SERVER_IP}</code>, port:{' '}
              <code className="home-address__value">{SERVER_PORT}</code>
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
