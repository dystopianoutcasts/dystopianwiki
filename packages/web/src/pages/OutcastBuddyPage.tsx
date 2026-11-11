/**
 * OutcastBuddyPage (/buddy) - download and install Outcast Buddy, in Rax's own words.
 *
 * The one job here is "get Outcast Buddy working": subscribe on the Workshop, download the
 * installer, click Install. Both actions are labeled buttons at the top; the steps and the
 * answers to "what does it change", "how do I undo it" follow. The text matches the
 * Install Instructions file inside the Workshop item.
 */
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/seo/SEOHead';
import { DISCORD_URL, JOIN_PATH, SERVER_ADDRESS } from '../lib/links';
import {
  BUDDY_WORKSHOP_STEAM_URL,
  BUDDY_WORKSHOP_URL,
  INSTALLER_BYTES,
  INSTALLER_DATE,
  INSTALLER_DOWNLOAD_URL,
  INSTALLER_FILE,
  INSTALLER_RELEASES_URL,
  INSTALLER_SHA256,
  INSTALLER_VERSION,
  formatMegabytes,
} from '../data/outcastBuddy';
import '../styles/pages/outcast-buddy.css';

export function OutcastBuddyPage() {
  return (
    <Layout>
      <SEOHead
        title="Outcast Buddy"
        description="The helper that lets Project Zomboid load the Java parts of our mods: Outcast Viewpoint and the Outcast loading screen. Install it once with one click."
      />
      <main className="buddy">
        <header className="buddy__header">
          <p className="buddy__kicker">Dystopian Outcasts</p>
          <h1 className="buddy__title">Outcast Buddy</h1>
          <p className="buddy__lead">
            Hi, and welcome! I'm Rax, and I'm really glad you're here. Outcast Buddy is the small
            helper that lets Project Zomboid load the Java parts of our mods, like the{' '}
            <strong>Outcast Viewpoint</strong> first-person view and our loading screen. Setting it
            up takes about a minute, and you only ever do it once.
          </p>
        </header>

        <section className="buddy__get" aria-labelledby="buddy-get-title">
          <h2 id="buddy-get-title" className="buddy__get-title">
            Get Outcast Buddy
          </h2>
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
              <a className="buddy__button" href={INSTALLER_DOWNLOAD_URL}>
                Download the installer for Windows
              </a>
              <p className="buddy__action-note">
                {INSTALLER_FILE}, version {INSTALLER_VERSION}, {formatMegabytes(INSTALLER_BYTES)},
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
                In PowerShell, run <code>Get-FileHash .\{INSTALLER_FILE}</code> in your Downloads
                folder. The hash should be:
              </p>
              <p className="buddy__hash">
                <code>{INSTALLER_SHA256}</code>
              </p>
            </div>
          </details>
        </section>

        <section className="buddy__section" aria-labelledby="buddy-install-title">
          <h2 id="buddy-install-title">How to install (one time)</h2>
          <ol className="buddy__steps">
            <li>
              <strong>Subscribe to Outcast Buddy</strong> on the Steam Workshop, and let Steam finish
              downloading it.
            </li>
            <li>
              <strong>Download the installer</strong>, {INSTALLER_FILE}, with the button above.
            </li>
            <li>
              <strong>Close Project Zomboid.</strong>
            </li>
            <li>
              <strong>Double-click {INSTALLER_FILE} and click Install.</strong> That's it!
              <ul>
                <li>
                  If Windows says "Windows protected your PC", click <strong>More info</strong>, then{' '}
                  <strong>Run anyway</strong>. Windows shows this for new programs it hasn't seen many
                  times yet.
                </li>
                <li>
                  If Steam is open, the installer will politely ask you to close it, so it can save
                  the launch setting. It tells you when.
                </li>
              </ul>
            </li>
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
            <li>it copies two files into your Project Zomboid folder,</li>
            <li>
              it sets the game to load them when it starts (in the game's launch file and in Steam's
              launch options for Project Zomboid),
            </li>
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
            <dt>Updates</dt>
            <dd>
              You never need to run the installer again for updates. They come through your Workshop
              subscription, and Outcast Buddy puts them in place on its own. A new update is ready the
              next time you start the game, or the time after that.
            </dd>
            <dt>If you unsubscribe</dt>
            <dd>
              Outcast Buddy switches itself off and the game plays as normal. You'll see a short note
              on the main menu saying so. Subscribe again and it switches back on.
            </dd>
            <dt>Removing it</dt>
            <dd>
              Run {INSTALLER_FILE} again and click <strong>Uninstall</strong>. It puts every file and
              setting back the way it was.
            </dd>
            <dt>Prefer the game's own loading screen?</dt>
            <dd>
              Go to <strong>Options</strong>, then <strong>Mods</strong>, then{' '}
              <strong>Outcast Buddy</strong>, and uncheck "Show the Outcast loading screen".
            </dd>
            <dt>On a Mac or Linux?</dt>
            <dd>
              The installer is for Windows. Message us on{' '}
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                our Discord
              </a>{' '}
              and we'll gladly help you set it up by hand.
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
        </section>

        <footer className="buddy__footer">
          <p className="buddy__credits">
            Outcast Buddy is built on the open-source Zombie Buddy loader (MIT license). The license
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
