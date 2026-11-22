/**
 * OutcastBuddyPage (/buddy) - download and install Outcast Checkpoint, in Rax's own words.
 *
 * The one job here is "get Outcast Checkpoint working": subscribe on the Workshop, download the
 * installer, click Install. Both actions are labeled buttons at the top; the steps and the
 * answers to "what does it change", "how do I undo it" follow. The text matches the
 * Install Instructions file inside the Workshop item.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/seo/SEOHead';
import { DISCORD_URL, JOIN_PATH, SERVER_ADDRESS } from '../lib/links';
import {
  BUDDY_DOWNLOADS,
  BUDDY_SYSTEMS,
  BUDDY_WORKSHOP_STEAM_URL,
  BUDDY_WORKSHOP_URL,
  INSTALLER_DATE,
  BROKEN_INSTALLER_VERSION,
  INSTALLER_RELEASES_URL,
  INSTALLER_VERSION,
  detectSystem,
  formatMegabytes,
  type BuddySystem,
} from '../data/outcastBuddy';
import { ClearedStamp, PreflightTag, RemoveBeforeFlight } from '../components/buddy/BuddyDetails';
import '../styles/pages/outcast-buddy.css';
import '../styles/components/boone-details.css';
import '../styles/components/buddy-details.css';

/** The visitor's system as the browser reports it; Windows when it cannot tell. */
function visitorSystem(): BuddySystem {
  if (typeof navigator === 'undefined') return 'windows';
  const withHints = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = withHints.userAgentData?.platform || navigator.platform || '';
  return detectSystem(platform, navigator.userAgent || '', navigator.maxTouchPoints || 0);
}

export function OutcastBuddyPage() {
  const [system, setSystem] = useState<BuddySystem>(visitorSystem);
  const chosen = BUDDY_DOWNLOADS[system];
  return (
    <Layout>
      <SEOHead
        title="Outcast Checkpoint"
        description="The helper that lets Project Zomboid load the Java parts of our mods: Outcast Viewpoint and the Outcast loading screen. Install it once with one click."
      />
      <main className="buddy">
        <header className="buddy__header">
          <p className="buddy__kicker">Dystopian Outcasts</p>
          <h1 className="buddy__title">Outcast Checkpoint</h1>
          <p className="buddy__lead">
            Hi, and welcome! I'm Rax, and I'm really glad you're here. Outcast Checkpoint (formerly Outcast Buddy) is the small
            helper that lets Project Zomboid load the Java parts of our mods, like the{' '}
            <strong>Outcast Viewpoint</strong> first-person view and our loading screen. Setting it
            up takes about a minute, and you only ever do it once.
          </p>
        </header>

        <section className="buddy__get boone-rivets" aria-labelledby="buddy-get-title">
          <RemoveBeforeFlight />
          <h2 id="buddy-get-title" className="buddy__get-title">
            Get Outcast Checkpoint
          </h2>
          <fieldset className="buddy__systems">
            <legend className="buddy__systems-legend">Your computer</legend>
            <div className="buddy__systems-options">
              {BUDDY_SYSTEMS.map((s) => (
                <label key={s} className="buddy__system">
                  <input
                    type="radio"
                    name="buddy-system"
                    value={s}
                    checked={system === s}
                    onChange={() => setSystem(s)}
                  />
                  <span>{BUDDY_DOWNLOADS[s].label}</span>
                </label>
              ))}
            </div>
            <p className="buddy__systems-note">
              We picked the system your browser reports. Choose another if you're downloading for a different
              computer; the download and the steps below follow your choice.
            </p>
          </fieldset>
          <div className="buddy__actions">
            <div className="buddy__action">
              <p className="buddy__action-step">First</p>
              <a
                className="buddy__button buddy__button--secondary"
                href={BUDDY_WORKSHOP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Subscribe on the Steam Workshop
              </a>
              <p className="buddy__action-note">
                The installer uses the copy Steam downloads for you.{' '}
                <a href={BUDDY_WORKSHOP_STEAM_URL}>Open in the Steam app instead</a> (needs Steam on
                this PC).
              </p>
            </div>
            <div className="buddy__action">
              <p className="buddy__action-step">Then</p>
              <a className="buddy__button" href={chosen.url}>
                Download the installer for {chosen.label}
              </a>
              <p className="buddy__action-note">
                {chosen.file}, version {INSTALLER_VERSION}, {formatMegabytes(chosen.bytes)},
                released {INSTALLER_DATE}. The file comes from our official{' '}
                <a href={INSTALLER_RELEASES_URL} target="_blank" rel="noopener noreferrer">
                  release page on GitHub
                </a>
                , and only from there.
              </p>
            </div>
          </div>
          <details className="buddy__check">
            <summary>Check the file you downloaded (optional)</summary>
            <div className="buddy__check-body">
              <p>
                {chosen.hashWhere} <code>{chosen.hashCommand}</code>. The hash should be (capital or
                small letters, both are fine):
              </p>
              <p className="buddy__hash">
                <code>{chosen.sha256}</code>
              </p>
            </div>
          </details>
        </section>

        <section className="buddy__section" aria-labelledby="buddy-install-title">
          <PreflightTag />
          <h2 id="buddy-install-title">How to install (one time)</h2>
          {chosen.firstTestBuild && (
            <p className="buddy__note">
              <strong>New for {chosen.label}:</strong> this is our first {chosen.label} build. We tested it against
              copies of Steam's folders, not yet on real {system === 'mac' ? 'Macs' : 'Linux PCs or Steam Decks'}. If
              anything goes wrong, tell us on Discord. <strong>Uninstall</strong> puts back everything it changed.
            </p>
          )}
          <ol className="buddy__steps">
            <li>
              <strong>Subscribe to Outcast Checkpoint</strong> on the Steam Workshop, and let Steam finish
              downloading it.
            </li>
            <li>
              <strong>Download the installer</strong>, {chosen.file}, with the button above.
              {system === 'mac' && <> Double-click it to unpack <strong>Outcast Checkpoint Installer</strong>.</>}
              {system === 'linux' && (
                <> Unpack it (right-click it, then Extract). On a Steam Deck, do this in Desktop Mode.</>
              )}
            </li>
            <li>
              <strong>Close Project Zomboid.</strong>
            </li>
            {system === 'windows' && (
              <li>
                <strong>Double-click {chosen.file} and click Install Outcast Checkpoint.</strong> That's it!
                <ul>
                  <li>
                    If Windows says "Windows protected your PC", click <strong>More info</strong>, then{' '}
                    <strong>Run anyway</strong>. Windows shows this for new programs it hasn't seen many
                    times yet.
                  </li>
                  <li>
                    If Steam is open, the installer offers to close it for you, finishes, and opens
                    Steam again. If you'd rather not, click <strong>Go back</strong> and nothing is
                    changed.
                  </li>
                </ul>
              </li>
            )}
            {system === 'mac' && (
              <li>
                <strong>Right-click Outcast Checkpoint Installer, choose Open, then click Open again.</strong>{' '}
                Then click <strong>Install Outcast Checkpoint</strong>. That's it!
                <ul>
                  <li>
                    Right-click is needed the first time only. The app isn't signed by Apple, so a plain
                    double-click says it "cannot be opened".
                  </li>
                  <li>
                    If macOS still refuses, open <strong>System Settings</strong>, then{' '}
                    <strong>Privacy &amp; Security</strong>, and click <strong>Open Anyway</strong> next to the
                    installer's name.
                  </li>
                  <li>
                    If Steam is open, the installer offers to close it for you, finishes, and opens Steam
                    again. If you'd rather not, click <strong>Go back</strong> and nothing is changed.
                  </li>
                </ul>
              </li>
            )}
            {system === 'linux' && (
              <li>
                <strong>
                  Double-click outcast-checkpoint-installer in the unpacked folder and click Install Outcast
                  Checkpoint.
                </strong>{' '}
                That's it!
                <ul>
                  <li>
                    If your file manager asks what to do with it, choose <strong>Run</strong> or{' '}
                    <strong>Execute</strong>.
                  </li>
                  <li>
                    Prefer a terminal? In the unpacked folder, run{' '}
                    <code>./outcast-checkpoint-installer install</code> (or <code>status</code>, or{' '}
                    <code>uninstall</code>). Never use <code>sudo</code>: it only changes files in your own Steam
                    folder, so it refuses to run as root.
                  </li>
                  <li>Steam installed as a Flatpak works too.</li>
                  <li>
                    If Steam is open, the installer offers to close it for you, finishes, and opens Steam
                    again. If you'd rather not, click <strong>Go back</strong> and nothing is changed.
                  </li>
                </ul>
              </li>
            )}
            <li>
              <strong>Start Project Zomboid and join the server</strong> at{' '}
              <code>{SERVER_ADDRESS}</code>. New here? <Link to={JOIN_PATH}>Join in three steps</Link>.
              Enjoy!
            </li>
          </ol>
        </section>

        <section className="buddy__section" aria-labelledby="buddy-why-title">
          <h2 id="buddy-why-title">Why there is an installer</h2>
          <p>
            The Steam Workshop only delivers mod files. It doesn't allow programs inside mods, so it
            can't put the helper where the game looks for it. The installer does that one job:
          </p>
          <ul className="buddy__list">
            {system === 'windows' ? (
              <>
                <li>it copies two files into your Project Zomboid folder,</li>
                <li>
                  it sets the game to load them when it starts (in the game's launch file and in Steam's
                  launch options for Project Zomboid),
                </li>
              </>
            ) : (
              <>
                <li>it copies one file into your Project Zomboid folder,</li>
                <li>it sets the game to load it when it starts (in Steam's launch options for Project Zomboid),</li>
              </>
            )}
            <li>it keeps a backup of everything it changes.</li>
          </ul>
          <p>
            It doesn't touch your saves, your characters or your other mods, and you can undo it any
            time with one click.
          </p>
        </section>

        <section className="buddy__section" aria-labelledby="buddy-faq-title">
          <h2 id="buddy-faq-title">Good to know</h2>
          <dl className="buddy__faq">
            <dt>Game memory (RAM)</dt>
            <dd>
              The installer also shows how much memory your PC has and how much the game is set to
              use. If you like, pick a new amount: it only offers sizes that are safe for your PC, and
              it marks the one we recommend. If you're happy with your current setting, leave it on
              "Keep current". Your other Steam launch options are never touched.
            </dd>
            <dt>Game stopped starting after an earlier installer?</dt>
            <dd>
              The first installer ({BROKEN_INSTALLER_VERSION}) could stop the game from starting if you already had
              Steam launch options, like a memory setting. We're sorry about that! Download the new
              installer above, run it, and click <strong>Update or apply memory</strong> (or{' '}
              <strong>Uninstall</strong>). Either one fixes it.
            </dd>
            <dt>Updates</dt>
            <dd>
              You never need to run the installer again for updates. They come through your Workshop
              subscription, and Outcast Checkpoint puts them in place on its own. A new update is ready the
              next time you start the game, or the time after that.
            </dd>
            <dt>If you unsubscribe</dt>
            <dd>
              Outcast Checkpoint switches itself off and the game plays as normal. You'll see a short note
              on the main menu saying so. Subscribe again and it switches back on.
            </dd>
            <dt>Removing it</dt>
            <dd>
              Run the installer again, click <strong>Uninstall</strong>, then{' '}
              <strong>Remove Outcast Checkpoint</strong>. It puts every file and setting back the way it was.
              In the 3.0.0-beta4 installer that last button did nothing, sorry! Download the new one
              above and it works.
            </dd>
            <dt>Prefer the game's own loading screen?</dt>
            <dd>
              Go to <strong>Options</strong>, then <strong>Mods</strong>, then{' '}
              <strong>Outcast Checkpoint</strong>, and uncheck "Show the Outcast loading screen".
            </dd>
          </dl>
        </section>

        <section className="buddy__section buddy__signoff" aria-labelledby="buddy-help-title">
          <h2 id="buddy-help-title">Need a hand?</h2>
          <p>
            Come say hi on{' '}
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
              our Discord
            </a>
            . No question is too small, and we're always happy to help.
          </p>
          <p>See you out there, Outcast.</p>
          <p className="buddy__signature">
            Rax
            <br />
            Dystopian Outcasts
          </p>
          <ClearedStamp />
        </section>

        <footer className="buddy__footer">
          <p className="buddy__credits">
            Outcast Checkpoint is built on the open-source Zombie Buddy loader (MIT license). The license
            text is included in the Workshop item as LICENSE.txt.
          </p>
          <Link to="/" className="buddy__home">
            Back to the home page
          </Link>
        </footer>
      </main>
    </Layout>
  );
}
