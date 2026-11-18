import { useEffect, useRef, useState } from 'react';

// The BattleMetrics server card (server 41858330): rank, players, status and the
// player and rank graphs, drawn by BattleMetrics in an iframe. Its colors are set
// on BattleMetrics and carried in the token; to change them, edit the banner there
// and paste the new embed URL into WIDGET_URL.
//
// The card is a fixed width and posts its size to us. BattleMetrics serves it
// sandboxed, so the message origin is "null": a message is used only when it comes
// from this iframe's own window and names this frame. On a screen narrower than
// the card, the card is scaled down to fit rather than cut off.

const FRAME_NAME = 'nizbp';
const SERVER_URL = 'https://www.battlemetrics.com/servers/zomboid/41858330';
const WIDGET_URL =
  'https://cdn.battlemetrics.com/b/452xK3xgD/41858330.html?_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUyOTYiLCJzZXJ2ZXIiOjQxODU4MzMwLCJvcHRpb25zIjp7ImZvcmVncm91bmQiOiIjRUVFRUVFIiwiYmFja2dyb3VuZCI6IiMyMjIyMjIiLCJsaW5lcyI6IiMzMzMzMzMiLCJsaW5rQ29sb3IiOiIjMTE4NWVjIiwiY2hhcnRDb2xvciI6IiNGRjA3MDAifSwibGl2ZVVwZGF0ZXMiOnRydWUsInVzZXJfaWQiOjk5NjU0OSwiaWF0IjoxNzk0OTg2NjM5fQ.6jOVY7eEMiv9DreAgWM62NO3G3CHwZoXBn_A0YRcWaw';

// The card's own size as of 2026-11-18; replaced by what the card reports.
const START = { width: 500, height: 460 };

function readPx(value: unknown, min: number, max: number): number | null {
  const px = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(px) ? Math.min(max, Math.max(min, Math.round(px))) : null;
}

export function BattleMetricsWidget() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(START);
  const [room, setRoom] = useState<number | null>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!frameRef.current || e.source !== frameRef.current.contentWindow) return;
      const data = e.data as { uid?: unknown; type?: unknown; payload?: { width?: unknown; height?: unknown } } | null;
      if (!data || data.uid !== FRAME_NAME || data.type !== 'sizeUpdate') return;
      const width = readPx(data.payload?.width, 200, 1200);
      const height = readPx(data.payload?.height, 100, 1500);
      if (width !== null && height !== null) {
        setSize((old) => (old.width === width && old.height === height ? old : { width, height }));
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // How wide the space for the card is, so a phone can scale it down.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const watch = new ResizeObserver(([entry]) => setRoom(entry.contentRect.width));
    watch.observe(box);
    return () => watch.disconnect();
  }, []);

  const scale = room !== null && room < size.width ? room / size.width : 1;

  return (
    <div className="home-battlemetrics">
      <div className="home-battlemetrics__text">
        <h3 className="home-battlemetrics__title">Live on BattleMetrics</h3>
        <p className="home-battlemetrics__lead">
          The server's rank among Project Zomboid servers, who is on right now, and how the player count and rank
          have moved, straight from BattleMetrics.
        </p>
        <a className="home-battlemetrics__link" href={SERVER_URL} target="_blank" rel="noopener noreferrer">
          Open our server page on BattleMetrics
        </a>
      </div>
      <div className="home-battlemetrics__box" ref={boxRef}>
        <div
          className="home-battlemetrics__clip"
          style={{ width: size.width * scale, height: size.height * scale }}
        >
          <iframe
            ref={frameRef}
            className="home-battlemetrics__frame"
            src={WIDGET_URL}
            name={FRAME_NAME}
            title="Dystopian Outcasts server on BattleMetrics: rank, players online and player graph"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              width: size.width,
              height: size.height,
              transform: scale < 1 ? `scale(${scale})` : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
