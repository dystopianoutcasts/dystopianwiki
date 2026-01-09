import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { SEOHead } from '../components/seo/SEOHead';
import '../styles/pages/not-found-page.css';

export function NotFoundPage() {
  return (
    <Layout>
      <SEOHead
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        noIndex={true}
      />
      <div className="not-found-page">
        <div className="not-found-page__content">
          <img
            src="/assets/banners/benny404_4K.png"
            alt="Benny the wombat looking lost"
            className="not-found-page__image"
          />
          <h1 className="not-found-page__title">404</h1>
          <h2 className="not-found-page__subtitle">Page Not Found</h2>
          <p className="not-found-page__message">
            Looks like this page got eaten by zombies. The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="not-found-page__actions">
            <Link to="/" className="not-found-page__button not-found-page__button--primary">
              Go Home
            </Link>
            <Link to="/search" className="not-found-page__button not-found-page__button--secondary">
              Search Wiki
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
