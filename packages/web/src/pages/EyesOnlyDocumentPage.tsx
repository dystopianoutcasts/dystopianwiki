/**
 * EyesOnlyDocumentPage (/eyes-only/:slug) - one EYES ONLY document (migration 041).
 *
 * A slim bar (back to the list, the document's title) above the document, shown exactly as
 * uploaded. The document is a self-contained HTML file built by the style kit, and it runs
 * in a sandboxed iframe: scripts and popups are allowed (the appendix open/close buttons),
 * but there is NO allow-same-origin, so it has an opaque origin and cannot reach this site's
 * session, storage or DOM; and no allow-top-navigation or allow-forms. Do not add them.
 *
 * A missing slug, a refusal and a failure all show the ordinary 404, like /eyes-only.
 */
import { useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { useEyesOnlyResource } from '../hooks/useEyesOnlyResource'
import { isValidSlug } from '../lib/eyesOnly'
import type { ApiResult } from '../lib/adminApi'
import type { EyesOnlyDocument } from '../lib/eyesOnly'
import { fetchEyesOnlyDocument } from '../lib/eyesOnlyApi'
import { NotFoundPage } from './NotFoundPage'
import '../styles/pages/eyes-only.css'

export function EyesOnlyDocumentPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  // A slug the table could never hold is not worth a request.
  const load = useCallback(
    (): Promise<ApiResult<EyesOnlyDocument>> =>
      isValidSlug(slug) ? fetchEyesOnlyDocument(slug) : Promise.resolve({ ok: false, reason: 'refused' }),
    [slug],
  )
  const doc = useEyesOnlyResource(load)

  if (doc.status === 'denied') return <NotFoundPage />

  if (doc.status === 'loading') {
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

  const { title, html } = doc.value

  return (
    <div className="eyes-only eo-viewer">
      <Helmet>
        <title>{title} | EYES ONLY</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="eo-bar">
        <Link className="eo-bar-back" to="/eyes-only" aria-label="Back to the EYES ONLY list">
          EYES ONLY
        </Link>
        <h1 className="eo-bar-title">{title}</h1>
      </div>
      <iframe
        className="eo-frame"
        title={title}
        srcDoc={html}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  )
}
