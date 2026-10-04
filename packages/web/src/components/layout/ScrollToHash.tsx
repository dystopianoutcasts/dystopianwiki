import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FIND_TARGET_MS, HEADING_SELECTOR, HOLD_TARGET_MS, hashTargetId } from '../../lib/hashTarget';

// Scrolls to the element a location hash names, also when the reader arrives from another
// page (KB05: "Zomboid with us!" links to /#join). React Router does not do this itself, and
// the browser's own jump happens before the page has rendered, so it finds nothing.
//
// The jump is instant (the page's smooth scrolling would start from wherever the previous
// page was). Sections above the target load live data and grow after the first render, so
// the target is held at the top for a few seconds, until the reader does anything. The
// target's scroll-margin-top keeps it clear of the sticky header. Focus then moves to the
// target's heading, but only to a heading that opted in with tabIndex -1, so keyboard and
// screen-reader users continue from the section they asked for.

const READER_INPUT = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

export function ScrollToHash() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    const id = hashTargetId(hash);
    if (!id) return undefined;

    const started = performance.now();
    let frame = 0;
    let holdTimer = 0;
    let observer: ResizeObserver | null = null;
    let stopped = false;

    const stop = () => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(holdTimer);
      observer?.disconnect();
      for (const type of READER_INPUT) window.removeEventListener(type, stop);
    };

    const place = (el: HTMLElement) => {
      el.scrollIntoView({ block: 'start', behavior: 'instant' });
    };

    const find = () => {
      if (stopped) return;
      const el = document.getElementById(id);
      if (!el) {
        if (performance.now() - started < FIND_TARGET_MS) frame = requestAnimationFrame(find);
        else stop();
        return;
      }
      place(el);
      const heading = el.matches(HEADING_SELECTOR)
        ? el
        : el.querySelector<HTMLElement>(HEADING_SELECTOR);
      if (heading && heading.hasAttribute('tabindex')) heading.focus({ preventScroll: true });
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(() => {
          if (!stopped) place(el);
        });
        observer.observe(document.body);
      }
      holdTimer = window.setTimeout(stop, HOLD_TARGET_MS);
    };

    for (const type of READER_INPUT) window.addEventListener(type, stop, { passive: true });
    frame = requestAnimationFrame(find);
    return stop;
  }, [pathname, hash, key]);

  return null;
}
