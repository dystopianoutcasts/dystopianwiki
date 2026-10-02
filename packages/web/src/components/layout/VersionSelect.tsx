import { useId } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { VERSIONS, DEFAULT_VERSION } from '../../config/versions.generated';
import '../../styles/components/version-select.css';

/**
 * The game build switch (Build 42 / Build 41). It lived in the top bar until the top bar
 * was made identical to the live map's (owner, 2026-10-02); it now sits beside the
 * breadcrumbs on every guide page (WikiLayout), on each build's own page (VersionPage)
 * and in the phone menu, where readers of the older build need it.
 *
 * Keeps as much of the current location as it can: only /pz/{version}/... URLs carry
 * their section, category and article over; anywhere else lands on the version's page.
 */
export function VersionSelect({ onChange, inline = false }: { onChange?: () => void; inline?: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const id = useId();
  const { version, section, category, slug } = useParams<{
    version?: string;
    section?: string;
    category?: string;
    slug?: string;
  }>();
  const currentVersion = version && VERSIONS.some((v) => v.id === version) ? version : DEFAULT_VERSION;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newVersion = event.target.value;
    const isPzPrefixed = location.pathname.split('/').filter(Boolean)[0] === 'pz';

    if (isPzPrefixed && section && category && slug) {
      navigate(`/pz/${newVersion}/${section}/${category}/${slug}`);
    } else if (isPzPrefixed && section) {
      navigate(`/pz/${newVersion}/${section}${category ? `/${category}` : ''}`);
    } else {
      navigate(`/pz/${newVersion}`);
    }
    onChange?.();
  };

  return (
    <div className={inline ? 'version-select version-select--inline' : 'version-select'}>
      <label htmlFor={id} className="version-select__label">
        Game build
      </label>
      <select id={id} className="version-select__control" value={currentVersion} onChange={handleChange}>
        {VERSIONS.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
            {v.status === 'legacy' ? ' (legacy)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
