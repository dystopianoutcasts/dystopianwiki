import { Link, useLocation } from 'react-router-dom';
import { VERSIONS } from '../../config/versions.generated';
import '../../styles/components/breadcrumbs.css';

// Home icon
const HomeIcon = () => (
  <svg className="breadcrumbs__home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

// Map of slugs to display names. Version labels are no longer listed here;
// they come from the generated VERSIONS module (contract C1) so a version's
// name only has to be maintained in one place.
const displayNames: Record<string, string> = {
  pz: 'Project Zomboid',
  modding: 'Modding',
  mapping: 'Mapping',
  'lua-api': 'Lua API',
  recipes: 'Recipes',
  items: 'Items',
  'game-mechanics': 'Game Mechanics',
  'weapon-repair': 'Weapon Repair',
  foraging: 'Foraging',
  tools: 'Tools',
  tilezed: 'TileZed',
  worlded: 'WorldEd',
  buildings: 'Buildings',
  terrain: 'Terrain',
};

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent: boolean;
}

function versionLabel(segment: string): string | undefined {
  return VERSIONS.find((v) => v.id === segment)?.name;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Home
  breadcrumbs.push({
    label: 'Home',
    href: '/',
    isCurrent: segments.length === 0,
  });

  // Build breadcrumbs from path segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    breadcrumbs.push({
      label:
        versionLabel(segment) ||
        displayNames[segment] ||
        segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      href: currentPath,
      isCurrent: isLast,
    });
  });

  return breadcrumbs;
}

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
