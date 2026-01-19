import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { WikiLayout } from '../components/layout/WikiLayout';
import { SEOHead } from '../components/seo/SEOHead';
import '../styles/pages/version-page.css';

// Hardcoded version and section data (static metadata)
const versionData: Record<string, {
  name: string;
  description: string;
  status: 'current' | 'legacy' | 'upcoming';
  sections: string[];
  features?: string[];
}> = {
  'build-41': {
    name: 'Build 41',
    description: 'Current stable build with multiplayer support',
    status: 'current',
    sections: ['modding', 'mapping'],
    features: [
      'Multiplayer support',
      'Advanced Lua API',
      'Comprehensive modding tools'
    ]
  },
  'build-42': {
    name: 'Build 42',
    description: 'Upcoming build with animation overhaul',
    status: 'upcoming',
    sections: ['modding'],
    features: [
      'New animation system',
      'Enhanced crafting',
      'Improved lighting'
    ]
  }
};

const sectionsData = [
  { id: 'modding', name: 'Modding', description: 'Learn to create mods' },
  { id: 'mapping', name: 'Mapping', description: 'Create custom maps' }
];

export function VersionPage() {
  const { version = 'build-41' } = useParams<{ version: string }>();

  const versionInfo = versionData[version];

  if (!versionInfo) {
    return (
      <Layout>
        <WikiLayout>
          <div className="version-page">
            <div className="version-page__error">
              <h1>Version Not Found</h1>
              <p>The requested version "{version}" could not be found.</p>
              <Link to="/" className="version-page__back-link">
                Return to Home
              </Link>
            </div>
          </div>
        </WikiLayout>
      </Layout>
    );
  }

  const availableSections = sectionsData.filter(s =>
    versionInfo.sections.includes(s.id)
  );

  return (
    <Layout>
      <SEOHead
        title={`${versionInfo.name} Documentation - Project Zomboid Modding`}
        description={versionInfo.description || `Project Zomboid ${versionInfo.name} modding documentation. Tutorials, guides, and API reference.`}
      />
      <WikiLayout>
        <div className="version-page">
          <header className="version-page__header">
            <div className="version-page__badge">
              {versionInfo.status === 'current' && (
                <span className="version-page__status version-page__status--current">Current</span>
              )}
              {versionInfo.status === 'legacy' && (
                <span className="version-page__status version-page__status--legacy">Legacy</span>
              )}
              {versionInfo.status === 'upcoming' && (
                <span className="version-page__status version-page__status--upcoming">Upcoming</span>
              )}
            </div>
            <h1 className="version-page__title">{versionInfo.name}</h1>
            {versionInfo.description && (
              <p className="version-page__description">{versionInfo.description}</p>
            )}
          </header>

          <section className="version-page__sections">
            <h2 className="version-page__sections-title">Browse Documentation</h2>
            <div className="version-page__sections-grid">
              {availableSections.map((section) => (
                <Link
                  key={section.id}
                  to={`/${version}/${section.id}`}
                  className="version-page__section-card"
                >
                  <span className="version-page__section-icon">
                    {section.id === 'modding' ? '🔌' : '🗺️'}
                  </span>
                  <div className="version-page__section-content">
                    <h3 className="version-page__section-name">{section.name}</h3>
                    <p className="version-page__section-description">{section.description}</p>
                  </div>
                  <span className="version-page__section-arrow">→</span>
                </Link>
              ))}
            </div>
          </section>

          {versionInfo.features && versionInfo.features.length > 0 && (
            <section className="version-page__features">
              <h2 className="version-page__features-title">Version Features</h2>
              <ul className="version-page__features-list">
                {versionInfo.features.map((feature, index) => (
                  <li key={index} className="version-page__feature">
                    <span className="version-page__feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </WikiLayout>
    </Layout>
  );
}
