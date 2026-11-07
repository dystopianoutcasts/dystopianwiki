/**
 * SotsPage (/sots) - the current issue of State of the Server, read on the page.
 *
 * Every page of the issue is shown as an image, one after another, with a contents list that
 * jumps to each section (#page-N). Under each page, "Read page N as text" opens the page's
 * text, so the issue works with a screen reader and with find-in-page. There is no download
 * link: the owner wants the issue read here.
 */
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/seo/SEOHead';
import { CURRENT_SOTS, sotsContents } from '../data/sots';
import '../styles/pages/sots.css';

export function SotsPage() {
  const issue = CURRENT_SOTS;
  const total = issue.pages.length;

  return (
    <Layout>
      <SEOHead
        title={`${issue.title}, Issue ${issue.issue}`}
        description={issue.summary}
        ogImage={issue.cover}
      />
      <main className="sots">
        <header className="sots__header">
          <p className="sots__kicker">Dystopian Outcasts presents</p>
          <h1 className="sots__title">
            {issue.title} <span className="sots__issue">Issue {issue.issue}</span>
          </h1>
          <p className="sots__meta">
            {issue.season} &middot; {issue.covers} &middot; {total} pages
          </p>
          <p className="sots__summary">{issue.summary}</p>
        </header>

        <nav className="sots__contents" aria-label={`Contents of issue ${issue.issue}`}>
          <h2 className="sots__contents-title">Inside this issue</h2>
          <ol className="sots__contents-list">
            {sotsContents(issue).map((page) => (
              <li key={page.n}>
                <a href={`#page-${page.n}`}>
                  <span className="sots__contents-name">{page.title}</span>
                  <span className="sots__contents-page">page {page.n}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="sots__pages">
          {issue.pages.map((page) => (
            <figure key={page.n} id={`page-${page.n}`} className="sots__page">
              <img
                className="sots__image"
                src={page.src}
                width={page.width}
                height={page.height}
                alt={`Page ${page.n}: ${page.title}. The text of this page is in "Read page ${page.n} as text" below the page.`}
                loading={page.n <= 2 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <figcaption className="sots__caption">
                Page {page.n} of {total} &middot; {page.title}
              </figcaption>
              <details className="sots__text">
                <summary>Read page {page.n} as text</summary>
                <div className="sots__text-body">
                  {page.lines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </details>
            </figure>
          ))}
        </div>

        <footer className="sots__footer">
          <a href="#page-1" className="sots__top">
            Back to the cover
          </a>
          <Link to="/" className="sots__home">
            Back to the home page
          </Link>
        </footer>
      </main>
    </Layout>
  );
}
