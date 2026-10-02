import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_VERSION, getVersion } from '../../config/versions.generated';
import { useHomeSummary } from '../../hooks/useHomeSummary';
import ourMods from '../../data/ourMods.json';
import {
  COLLAPSE_AFTER,
  groupMods,
  guideSlug,
  isOnServer,
  liveModIds,
  steamUrl,
  type ModGroupList,
  type OurMod,
} from '../../lib/ourMods';
import '../../styles/components/our-mods.css';

// "Made by Dystopian Outcasts": every mod of ours that runs on the server, from
// data/ourMods.json (scripts/build-our-mods.ts reads the Workshop folders). A card links
// to its Workshop page, and to its guide when the wiki's Outcast Mods section has one
// (the generated navigation, so a new guide appears here on the next build). The
// "On the server" badge comes from the live mod list; it never hides a card.

const SECTION = 'outcast-mods';

function ModCard({ mod, guide, live }: { mod: OurMod; guide: string | null; live: boolean }) {
  return (
    <li className="our-mod">
      <div className="our-mod__poster">
        {mod.poster && mod.posterWidth && mod.posterHeight ? (
          <img
            src={mod.poster}
            alt={`${mod.name} poster`}
            width={mod.posterWidth}
            height={mod.posterHeight}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="our-mod__poster-none" aria-hidden="true">
            {mod.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="our-mod__body">
        <h4 className="our-mod__name">{mod.name}</h4>
        {live && <span className="our-mod__badge">On the server</span>}
        <p className="our-mod__blurb">{mod.blurb}</p>
        <p className="our-mod__links">
          <a href={steamUrl(mod.workshopId)} target="_blank" rel="noopener noreferrer">
            View on Steam Workshop
            <span className="sr-only"> for {mod.name} (opens in a new tab)</span>
          </a>
          {guide && (
            <Link to={guide}>
              Read the guide
              <span className="sr-only"> for {mod.name}</span>
            </Link>
          )}
        </p>
      </div>
    </li>
  );
}

function ModGroup({
  list,
  guides,
  live,
}: {
  list: ModGroupList;
  guides: Set<string>;
  live: Set<string> | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const gridRef = useRef<HTMLUListElement>(null);
  const movedFocus = useRef(false);
  const listId = useId();
  const collapsible = list.mods.length > COLLAPSE_AFTER;
  const shown = collapsible && !expanded ? list.mods.slice(0, COLLAPSE_AFTER) : list.mods;

  // After "Show all", keyboard focus goes to the first card that appeared, so Tab
  // continues through the new cards instead of jumping back from past them.
  useEffect(() => {
    if (!expanded || !movedFocus.current) return;
    movedFocus.current = false;
    gridRef.current?.children[COLLAPSE_AFTER]?.querySelector('a')?.focus();
  }, [expanded]);

  return (
    <div className="our-mods__group">
      <h3 className="our-mods__group-title">
        {list.group} <span className="our-mods__count">({list.mods.length})</span>
      </h3>
      <ul className="our-mods__grid" id={listId} ref={gridRef}>
        {shown.map((m) => (
          <ModCard
            key={m.id}
            mod={m}
            guide={guides.has(guideSlug(m.id)) ? `/pz/${DEFAULT_VERSION}/${SECTION}/${guideSlug(m.id)}` : null}
            live={live !== null && isOnServer(live, m.id)}
          />
        ))}
      </ul>
      {collapsible && (
        <button
          type="button"
          className="our-mods__toggle"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => {
            movedFocus.current = !expanded;
            setExpanded(!expanded);
          }}
        >
          {expanded ? 'Show fewer' : `Show all ${list.mods.length}`}
          <span className="sr-only"> {list.group} mods</span>
        </button>
      )}
    </div>
  );
}

export function OutcastModsShowcase() {
  const titleId = useId();
  const { summary } = useHomeSummary();
  const section = getVersion(DEFAULT_VERSION)?.sections.find((s) => s.id === SECTION);
  const guides = new Set(
    (section?.categories ?? []).filter((c) => c.id !== 'about' && c.articleCount > 0).map((c) => c.id),
  );
  const live = summary ? liveModIds(summary.settings.Mods) : null;
  const groups = groupMods(ourMods as OurMod[]);
  if (groups.length === 0) return null;

  return (
    <section className="home-section home-section--alt" aria-labelledby={titleId}>
      <div className="home-section__inner">
        <h2 className="home-section__title" id={titleId}>
          Made by Dystopian Outcasts
        </h2>
        <p className="home-section__lead">
          Every mod below was made by our community (Fanare, REALLY_TINY_RICK!, Raxdeg and ItsCosmicX.ttv) for the
          server.
        </p>
        {groups.map((list) => (
          <ModGroup key={list.group} list={list} guides={guides} live={live} />
        ))}
      </div>
    </section>
  );
}
