import { WORKSHOP_COLLECTION_STEAM_URL, WORKSHOP_COLLECTION_URL } from '../../lib/links';

// Step 1 of "Join in three steps": the Workshop collection (owner, 2026-10-03). The
// web page is the primary link, since a steam:// link does nothing without Steam
// installed; the app link opens the same page inside the Steam client, already
// signed in, which the browser page is not. No hooks, so it renders in a test.

export function GetTheModsStep({ workshop }: { workshop: number | null }) {
  return (
    <li className="home-step">
      <span className="home-step__number" aria-hidden="true">1</span>
      <h3 className="home-step__title">Get the mods</h3>
      <p>
        Subscribe to our Steam Workshop collection so the game downloads every mod the server runs
        {workshop !== null ? ` (${workshop} Workshop items)` : ''}.
      </p>
      <p className="home-step__detail home-step__links">
        <a href={WORKSHOP_COLLECTION_URL} target="_blank" rel="noopener noreferrer">
          Open the collection on Steam
        </a>
        <a href={WORKSHOP_COLLECTION_STEAM_URL}>Open in the Steam app (needs Steam on this PC)</a>
      </p>
      <p className="home-step__detail">
        On the collection page, press <strong>Subscribe to all</strong>.
      </p>
    </li>
  );
}
