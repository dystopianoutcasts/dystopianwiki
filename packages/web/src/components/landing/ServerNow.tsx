import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useServerNow } from '../../hooks/useServerNow';
import { useHomeSummary } from '../../hooks/useHomeSummary';
import { TBD } from '../../lib/homeSummary';
import { centerOf, imageSize, scrollFor, squaresPerPixel, truncateName, type WorldPoint } from '../../utils/mapView';
import '../../styles/components/server-now.css';

// Home page map centerpiece: live counters from aurora.home_summary() (027), a
// scrollable window onto the zoom-12 picture of the whole server map, a dot and
// name for each player who is online, the same names as a list, and a link to the
// live map centred on the same place. No zoom control, no Leaflet.
//
// The picture is zoom level 12 of the Deep Zoom pyramid the /map/ app serves
// (map/tiles/base_top/layer0.dzi: 256 px tiles, no overlap; 70 of 80 tiles
// exist, the rest are empty world and left blank). Level 15 is one pixel per
// square, so level 12 is the world at 1/8 scale.
const TILE = 256;
const ZOOM = 12;
const SCALE = squaresPerPixel(ZOOM) ** -1; // pixels per square: 1/8
const { width: IMAGE_W, height: IMAGE_H } = imageSize(ZOOM); // 2496 x 2016
const COLS = Math.ceil(IMAGE_W / TILE); // 10, last column 192 px
const ROWS = Math.ceil(IMAGE_H / TILE); // 8, last row 224 px

// Rosewood (map/areas.json): the opening position, owner's decision.
const ROSEWOOD: WorldPoint = { x: 8350, y: 11750 };

// Grid tracks sized in proportion to each tile's real width or height, so the
// partial edge tiles keep their shape.
function tracks(count: number, total: number): string {
  return Array.from({ length: count }, (_, i) => `minmax(0, ${Math.min(TILE, total - i * TILE)}fr)`).join(' ');
}

function tileExtent(total: number, index: number): number {
  return Math.min(TILE, total - index * TILE);
}

const TILES = Array.from({ length: ROWS * COLS }, (_, i) => ({ x: i % COLS, y: Math.floor(i / COLS) }));

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
  const [center, setCenter] = useState<WorldPoint>(ROSEWOOD);

  // Opening position: land on Rosewood before the visitor ever sees the
  // top-left corner. A layout effect runs before paint.
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const scroll = scrollFor(ROSEWOOD, { width: el.clientWidth, height: el.clientHeight }, ZOOM);
    el.scrollLeft = scroll.x;
    el.scrollTop = scroll.y;
  }, []);

  const updateCenterFromScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setCenter(centerOf({ x: el.scrollLeft, y: el.scrollTop }, { width: el.clientWidth, height: el.clientHeight }, ZOOM));
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(updateCenterFromScroll, 150);
  }, [updateCenterFromScroll]);

  // Dragging: an alternative to the scrollbar and touch scroll, never the
  // only way to move the map (WCAG 2.5.7). Touch already scrolls the region
  // natively via touch-action, so this only runs for mouse/pen pointers.
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    const el = viewportRef.current;
    if (!el) return;
    dragRef.current = { x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
    el.classList.add('server-now__viewport--grabbing');

    const onMove = (ev: PointerEvent) => {
      const drag = dragRef.current;
      const target = viewportRef.current;
      if (!drag || !target) return;
      target.scrollLeft = drag.scrollLeft - (ev.clientX - drag.x);
      target.scrollTop = drag.scrollTop - (ev.clientY - drag.y);
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

        <div
          ref={viewportRef}
          className="server-now__viewport"
          tabIndex={0}
          role="region"
          aria-label="Server map, centred on Rosewood. Scroll or drag to move."
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
        >
          <div className="server-now__inner" style={{ width: IMAGE_W, height: IMAGE_H }}>
            <div
              className="server-now__map"
              role="img"
              aria-label={describe(dots.length)}
              style={{
                gridTemplateColumns: tracks(COLS, IMAGE_W),
                gridTemplateRows: tracks(ROWS, IMAGE_H),
              }}
            >
              {TILES.map((tile) => (
                <img
                  key={`${tile.x}_${tile.y}`}
                  className="server-now__map-tile"
                  src={`/map/tiles/base_top/layer0_files/${ZOOM}/${tile.x}_${tile.y}.webp`}
                  alt=""
                  width={tileExtent(IMAGE_W, tile.x)}
                  height={tileExtent(IMAGE_H, tile.y)}
                  loading="lazy"
                  decoding="async"
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
                  style={{ left: dot.x * SCALE, top: dot.y * SCALE }}
                >
                  <span className="server-now__dot" />
                  <span className="server-now__name">{truncateName(dot.name)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="server-now__help">Drag or scroll to look around.</p>

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

        <p className="server-now__link-row">
          <a className="server-now__link" href={liveMapHref}>
            Open the live map
          </a>
        </p>
      </div>
    </section>
  );
}
