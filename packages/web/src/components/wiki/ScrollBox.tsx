import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScrollBoxProps {
  /** What the box holds, read out when it takes focus ("Table", "Code: lua"). */
  label: string;
  className: string;
  children: ReactNode;
}

/**
 * A box that scrolls sideways inside the page (KB16), for tables and code wider than a phone.
 * While its content is wider than the box it is a labelled region a keyboard can reach
 * (tabIndex 0), so it can be scrolled with the arrow keys (WCAG 2.1.1); when everything fits it
 * is a plain div and adds no tab stop.
 */
export function ScrollBox({ label, className, children }: ScrollBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const measure = () => setScrolls(box.scrollWidth > box.clientWidth + 1);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    // The content too: a late web font can widen a table without resizing the box.
    if (box.firstElementChild) observer.observe(box.firstElementChild);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      {...(scrolls ? { tabIndex: 0, role: 'region', 'aria-label': label } : {})}
    >
      {children}
    </div>
  );
}
