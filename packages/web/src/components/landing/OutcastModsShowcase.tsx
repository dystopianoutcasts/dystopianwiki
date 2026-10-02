import { useId } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_VERSION, getVersion } from '../../config/versions.generated';

// "Our own mods": one card per Outcast mod, from the wiki's Outcast Mods section
// (the generated navigation, so a new mod page appears here on the next build).
// The "about" category is the family's principles, not a mod, so it is left out.

const SECTION = 'outcast-mods';

export function OutcastModsShowcase() {
  const titleId = useId();
  const section = getVersion(DEFAULT_VERSION)?.sections.find((s) => s.id === SECTION);
  const mods = [...(section?.categories ?? [])]
    .filter((c) => c.id !== 'about' && c.articleCount > 0)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  if (mods.length === 0) return null;

  return (
    <section className="home-section home-section--alt" aria-labelledby={titleId}>
      <div className="home-section__inner">
        <h2 className="home-section__title" id={titleId}>
          Mods made here
        </h2>
        <p className="home-section__lead">
          We build our own mods and play them on our server first. Each one has its own page.
        </p>
        <ul className="home-mods">
          {mods.map((m) => (
            <li key={m.id} className="home-mod">
              <Link to={`/pz/${DEFAULT_VERSION}/${SECTION}/${m.id}`} className="home-mod__link">
                <span className="home-mod__name">{m.name}</span>
                <span className="home-mod__description">{m.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
