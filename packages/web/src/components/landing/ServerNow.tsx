import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useServerNow } from '../../hooks/useServerNow';
import { useHomeSummary } from '../../hooks/useHomeSummary';
import { TBD } from '../../lib/homeSummary';
import { centerAt, fitScale, imageSize, scrollAt, truncateName, type MapScale, type WorldPoint } from '../../utils/mapView';
import '../../styles/components/server-now.css';

// "The world right now": live counters from aurora.home_summary() (027), who is on,
// then the server map as a full-width banner with a dot and name for each player
// online, and a link to the live map centred on the same place. No zoom control,
// no Leaflet.
//
// The banner is as wide as the page and a fixed height (owner, 2026-10-02). On a
// wide screen the whole world's width is visible and it pans up and down; on a phone
// it shows zoom 11 and pans both ways (a finger pans sideways only: vertical swipes
// scroll the page, owner 2026-10-02). utils/mapView.ts fitScale picks the tile
// level (11 to 13 of map/tiles/base_top/layer0.dzi: 256 px tiles, no overlap,
// sparse) and the drawn size from the measured viewport width.
const TILE = 256;

// Arrow-key pan distance in px; Shift takes the larger step.
const PAN_STEP = 80;
const PAN_STEP_LARGE = 320;

// Rosewood (map/areas.json): the opening position, owner's decision.
const ROSEWOOD: WorldPoint = { x: 8350, y: 11750 };

// Grid tracks sized in proportion to each tile's real width or height, so the
// partial edge tiles keep their shape at any drawn size.
function tracks(count: number, total: number): string {
  return Array.from({ length: count }, (_, i) => `minmax(0, ${Math.min(TILE, total - i * TILE)}fr)`).join(' ');
}

function tilesFor(zoom: number) {
  const { width, height } = imageSize(zoom);
  const cols = Math.ceil(width / TILE);
  const rows = Math.ceil(height / TILE);
  return {
    width,
    height,
    cols,
    rows,
    tiles: Array.from({ length: rows * cols }, (_, i) => ({ x: i % cols, y: Math.floor(i / cols) })),
  };
}

function describe(count: number): string {
  if (count === 0) return 'Server map of the whole Build 42 world';
  if (count === 1) return 'Server map of the whole Build 42 world, with 1 player shown';
  return `Server map of the whole Build 42 world, with ${count} players shown`;
}

/** One counter; TBD when the server has not reported it. */
function Counter({ value, label }: { value: number | null | undefined; label: string }) {
  const known = typeof value === 'number';
  return (
    <li className={known ? 'home-counter' : 'home-counter home-counter--tbd'}>
      <span className="home-counter__value">{known ? value.toLocaleString() : TBD}</span>
      <span className="home-counter__label">{label}</span>
    </li>
  );
}

export function ServerNow() {
  const dots = useServerNow();
  const { summary } = useHomeSummary();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const centerRef = useRef<WorldPoint>(ROSEWOOD);
  const [center, setCenter] = useState<WorldPoint>(ROSEWOOD);
  const [scale, setScale] = useState<MapScale>(() => fitScale(1100));

  // Measure the banner and size the picture to it, before paint, and again whenever
  // the window is resized; the view stays centred on the same place.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let last = -1;
    const apply = () => {
      const width = el.clientWidth;
      if (width === last || width === 0) return;
      last = width;
      const next = fitScale(width);
      setScale(next);
      const scroll = scrollAt(centerRef.current, { width, height: el.clientHeight }, next);
      // After React has applied the new picture size.
      requestAnimationFrame(() => {
        el.scrollLeft = scroll.x;
        el.scrollTop = scroll.y;
      });
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const updateCenterFromScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const c = centerAt({ x: el.scrollLeft, y: el.scrollTop }, { width: el.clientWidth, height: el.clientHeight }, scale);
    centerRef.current = c;
    setCenter(c);
  }, [scale]);

  const handleScroll = useCallback(() => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(updateCenterFromScroll, 150);
  }, [updateCenterFromScroll]);

  // The viewport is overflow: hidden, so the wheel and trackpad never move the map
  // (the page keeps scrolling past it) and only these handlers do: dragging, and the
  // arrow keys as the non-drag alternative (WCAG 2.5.7). Programmatic scrollLeft and
  // scrollTop still work, and still fire the scroll event that tracks the centre.
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const el = viewportRef.current;
    if (!el) return;
    const step = e.shiftKey ? PAN_STEP_LARGE : PAN_STEP;
    switch (e.key) {
      case 'ArrowLeft':
        el.scrollLeft -= step;
        break;
      case 'ArrowRight':
        el.scrollLeft += step;
        break;
      case 'ArrowUp':
        el.scrollTop -= step;
        break;
      case 'ArrowDown':
        el.scrollTop += step;
        break;
      case 'Home':
        el.scrollLeft = 0;
        break;
      case 'End':
        el.scrollLeft = el.scrollWidth;
        break;
      default:
        return;
    }
    e.preventDefault();
  }, []);

  // Dragging with a mouse or pen moves both axes. A finger moves the map sideways
  // only: touch-action: pan-y leaves vertical swipes to the page, and the browser
  // cancels the pointer when it takes one over.
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = viewportRef.current;
    if (!el) return;
    const touch = e.pointerType === 'touch';
    // The map is made of <img> tiles. Without this the browser starts dragging the
    // image itself (its native drag-and-drop), which cancels this pointer drag, so
    // the map never moved. Not for touch, where it would only fight the page scroll.
    // Focus still lands on the region.
    if (!touch) e.preventDefault();
    el.focus({ preventScroll: true });
    dragRef.current = { x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
    el.classList.add('server-now__viewport--grabbing');

    const onMove = (ev: PointerEvent) => {
      const drag = dragRef.current;
      const target = viewportRef.current;
      if (!drag || !target) return;
      target.scrollLeft = drag.scrollLeft - (ev.clientX - drag.x);
      if (!touch) target.scrollTop = drag.scrollTop - (ev.clientY - drag.y);
    };
    const endDrag = () => {
      dragRef.current = null;
      viewportRef.current?.classList.remove('server-now__viewport--grabbing');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
      document.removeEventListener('pointerleave', endDrag);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    document.addEventListener('pointerleave', endDrag);
  }, []);

  const liveMapHref = `/map/?x=${Math.round(center.x)}&y=${Math.round(center.y)}&zoom=15`;
  const grid = tilesFor(scale.tileZoom);

  return (
    <section className="server-now" aria-labelledby="server-now-title">
      <div className="server-now__content">
        <h2 className="server-now__title" id="server-now-title">
          The world right now
        </h2>

        <ul className="home-counters" aria-label="Server right now">
          <Counter value={summary?.onlineNow} label="survivors online" />
          <Counter value={summary?.safehouses} label="safehouses claimed" />
          <Counter value={summary?.vehicles} label="vehicles on the map" />
          <Counter value={summary?.zombiesKilledToday} label="zombies killed today" />
          <Counter value={summary?.playersKilledToday} label="survivors lost today" />
        </ul>

        <div className="home-onnow">
          <h3 className="home-onnow__title">Who is on now</h3>
          {dots.length > 0 ? (
            <ul className="home-onnow__list">
              {dots.map((dot) => (
                <li key={dot.id} className="home-onnow__name">
                  {dot.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="home-onnow__empty">
              {summary && summary.onlineNow > 0
                ? `${summary.onlineNow} on now, positions hidden.`
                : 'Nobody is on right now. Be the first.'}
            </p>
          )}
        </div>
      </div>

      {/* Full width of the page: a banner, outside the centred content column. */}
      <div
        ref={viewportRef}
        className="server-now__viewport"
        tabIndex={0}
        role="region"
        aria-label="Server map, centred on Rosewood. Drag, or use the arrow keys, to move."
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
      >
        <div className="server-now__inner" style={{ width: scale.width, height: scale.height }}>
          <div
            className="server-now__map"
            role="img"
            aria-label={describe(dots.length)}
            style={{
              gridTemplateColumns: tracks(grid.cols, grid.width),
              gridTemplateRows: tracks(grid.rows, grid.height),
            }}
          >
            {grid.tiles.map((tile) => (
              <img
                key={`${scale.tileZoom}_${tile.x}_${tile.y}`}
                className="server-now__map-tile"
                src={`/map/tiles/base_top/layer0_files/${scale.tileZoom}/${tile.x}_${tile.y}.webp`}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                onError={(e) => {
                  // The pyramid is sparse: tiles with no populated cells do not exist.
                  e.currentTarget.style.visibility = 'hidden';
                }}
              />
            ))}
          </div>

          {/* Last child, above the tile grid: players are always the top layer. */}
          <ul className="server-now__players" aria-label="Players online">
            {dots.map((dot) => (
              <li
                key={dot.id}
                className="server-now__player"
                style={{ left: dot.x * scale.pixelsPerSquare, top: dot.y * scale.pixelsPerSquare }}
              >
                <span className="server-now__dot" />
                <span className="server-now__name">{truncateName(dot.name)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="server-now__content">
        <p className="server-now__help">Drag to look around, or focus the map and use the arrow keys.</p>
        <p className="server-now__link-row">
          <a className="server-now__link" href={liveMapHref}>
            Open the live map
          </a>
        </p>
      </div>
    </section>
  );
}
