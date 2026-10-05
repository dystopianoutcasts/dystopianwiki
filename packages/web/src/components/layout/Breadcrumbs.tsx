import { Link, useLocation } from 'react-router-dom';
import { generateBreadcrumbs, type BreadcrumbItem } from '../../lib/breadcrumbs';
import '../../styles/components/breadcrumbs.css';

// Home icon
const HomeIcon = () => (
  <svg className="breadcrumbs__home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
}

export function Breadcrumbs({ customItems }: BreadcrumbsProps) {
  const location = useLocation();
  const items = customItems || generateBreadcrumbs(location.pathname);

  // Don't show breadcrumbs on home page
  if (items.length <= 1) {
    return null;
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.href} className="breadcrumbs__item">
          {index > 0 && <span className="breadcrumbs__separator">/</span>}
          {item.isCurrent ? (
            <span className="breadcrumbs__current" aria-current="page">
              {index === 0 ? <HomeIcon /> : item.label}
            </span>
          ) : (
            <Link to={item.href} className="breadcrumbs__link">
              {index === 0 ? <HomeIcon /> : item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
