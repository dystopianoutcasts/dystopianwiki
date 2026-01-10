import { useState, useEffect, useCallback, useRef } from 'react';
import type { TOCItem } from '../../types/wiki';
import '../../styles/components/table-of-contents.css';

// Chevron icon for mobile toggle
const ChevronIcon = () => (
  <svg className="toc__toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

interface TableOfContentsProps {
  items: TOCItem[];
  className?: string;
}

export function TableOfContents({ items, className = '' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tocOffset, setTocOffset] = useState(0);
  const targetOffset = useRef(0);
  const isMobile = className.includes('mobile');

  // Track scroll position and update active heading
  useEffect(() => {
    const handleScroll = () => {
      // Calculate read progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));

      // Find active heading
      const headings = items
        .map((item) => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[];

      if (headings.length === 0) return;

      // Find the heading that's currently in view
      const headerOffset = 100; // Account for sticky header
      let currentId = items[0]?.id || '';

      for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= headerOffset) {
          currentId = heading.id;
        } else {
          break;
        }
      }

      setActiveId(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  // Smooth follow animation for desktop TOC
  useEffect(() => {
    if (isMobile) return;

    let animationFrame: number;
    let currentOffset = 0;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Calculate target offset - subtle movement (10% of scroll, max 50px)
      targetOffset.current = Math.min(scrollTop * 0.08, 50);
    };

    const animate = () => {
      // Lerp (linear interpolation) towards target for smooth following
      const diff = targetOffset.current - currentOffset;
      if (Math.abs(diff) > 0.1) {
        currentOffset += diff * 0.12;
        setTocOffset(currentOffset);
      }
      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrame);
    };
  }, [isMobile]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Close mobile TOC after clicking
      setExpanded(false);
    }
  }, []);

  if (items.length === 0) {
    return null;
  }

  const tocStyle = !isMobile ? { transform: `translateY(${tocOffset}px)` } : undefined;

  return (
    <nav
      className={`toc ${expanded ? 'toc--expanded' : ''} ${className}`}
      aria-label="Table of contents"
      style={tocStyle}
    >
      {/* Mobile toggle */}
      <button
        className="toc__toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span>On this page</span>
        <ChevronIcon />
      </button>

      {/* Title (desktop) */}
      <div className="toc__title">On this page</div>

      {/* Links */}
      <ul className="toc__list">
        {items.map((item) => (
          <li key={item.id} className="toc__item">
            <a
              href={`#${item.id}`}
              className={`toc__link toc__link--level-${item.level} ${
                activeId === item.id ? 'toc__link--active' : ''
              }`}
              onClick={(e) => handleClick(e, item.id)}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>

      {/* Progress bar */}
      <div className="toc__progress">
        <div className="toc__progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </nav>
  );
}

/**
 * Extract TOC items from markdown content
 */
export function extractTOCFromMarkdown(markdown: string): TOCItem[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const items: TOCItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    items.push({ id, text, level });
  }

  return items;
}
