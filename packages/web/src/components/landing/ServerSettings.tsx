import { useId } from 'react';
import { useHomeSummary } from '../../hooks/useHomeSummary';
import { cleanWelcome, settingRows, TBD } from '../../lib/homeSummary';

// "How this world plays": the server's own settings and sandbox options, read from
// its settings files by the ingest (027) and labelled with the game's own words.

export function ServerSettings() {
  const { summary } = useHomeSummary();
  const titleId = useId();
  const welcome = cleanWelcome(summary?.settings.ServerWelcomeMessage);

  return (
    <section className="home-section" aria-labelledby={titleId}>
      <div className="home-section__inner">
        <h2 className="home-section__title" id={titleId}>
          How this world plays
        </h2>
        {welcome && <blockquote className="home-welcome">{welcome}</blockquote>}
        <dl className="home-settings">
          {settingRows(summary).map((row) => (
            <div key={row.label} className={row.value === TBD ? 'home-setting home-setting--tbd' : 'home-setting'}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        {summary?.configUpdatedAt && (
          <p className="home-section__note">
            Read from the server&apos;s own settings {summary.configUpdatedAt.toLocaleString()}.
          </p>
        )}
      </div>
    </section>
  );
}
