/**
 * EyesOnlyPage (/eyes-only) - the hidden document area for executives (migration 041).
 *
 * Not linked from anywhere except the account menu, which shows "EYES ONLY" only to
 * executives, admins and the superadmin, and not listed in the sitemap or robots.txt. The
 * page is a convenience: the list comes from a database function that refuses everyone else.
 * Anyone who is refused, for any reason, sees exactly the ordinary 404, so the area does not
 * reveal itself. Look: the field-notes style kit (styles/pages/eyes-only.css).
 */
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { useEyesOnlyResource } from '../hooks/useEyesOnlyResource'
import { formatBytes, formatDocDate } from '../lib/eyesOnly'
import { fetchEyesOnlyList } from '../lib/eyesOnlyApi'
import { NotFoundPage } from './NotFoundPage'
import '../styles/pages/eyes-only.css'

export function EyesOnlyPage() {
  const list = useEyesOnlyResource(fetchEyesOnlyList)

  if (list.status === 'denied') return <NotFoundPage />

  if (list.status === 'loading') {
    return (
      <Layout hideFooter>
        <Helmet>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="eyes-only-wait" role="status">
          Loading...
        </div>
      </Layout>
    )
  }

  const documents = list.value

  return (
    <Layout hideFooter>
      <Helmet>
        <title>EYES ONLY | Dystopian Outcasts</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="eyes-only">
        <main className="eyes-only__main">
          <div className="eyes-only-strip" aria-hidden="true">
            <span>EYES ONLY</span>
            <span>EXECUTIVES ONLY</span>
            <span>EYES ONLY</span>
          </div>

          <header className="eo-cover">
            <div className="eo-cover-top">
              <img className="eo-cover-logo" src="/eyes-only/logo.png" alt="Dystopian Outcasts" />
              <div className="eo-stamp" aria-hidden="true">
                <span className="eo-stamp-big">EYES ONLY</span>
                <span className="eo-stamp-small">INTERNAL DOCUMENTS</span>
              </div>
            </div>
            <div className="eo-kicker">INTERNAL DOCUMENTS</div>
            <h1 className="eo-title">
              EYES <span className="eo-title-accent">ONLY</span>
            </h1>
            <p className="eo-subtitle">Research, studies and design notes for Outcasts with the executive role. Do not share outside the team.</p>
          </header>

          <section aria-labelledby="eo-documents-title">
            <h2 className="eo-section-title" id="eo-documents-title">
              Documents
            </h2>
            {documents.length === 0 ? (
              <p className="eo-empty">No documents have been published yet.</p>
            ) : (
              <ul className="eo-cards">
                {documents.map((doc) => (
                  <li className="eo-card" key={doc.slug}>
                    <h3 className="eo-card-title">
                      <Link to={`/eyes-only/${doc.slug}`}>{doc.title}</Link>
                    </h3>
                    {doc.summary && <p className="eo-card-summary">{doc.summary}</p>}
                    <p className="eo-card-meta">
                      <span>Updated {formatDocDate(doc.updatedAt)}</span>
                      <span>{formatBytes(doc.sizeBytes)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="eo-footer-note">
            <img src="/eyes-only/benny.png" alt="" />
            <p>Benny is watching. Keep it in the family.</p>
          </div>
        </main>
      </div>
    </Layout>
  )
}
