import '../../styles/components/server-now.css';

// Home page map centerpiece (owner decision 2026-09-29): one large picture of
// the server map and a link to the live map. No status, roster, dots or
// polling; hooks/useServerNow.ts and lib/aurora.ts are kept, unused, for later.
//
// The picture is zoom level 11 of the Deep Zoom pyramid the /map/ app serves
// (map/tiles/base_top/layer0.dzi: 256 px tiles, no overlap). Level 15 is one
// pixel per square, so level 11 is the world at 1/16 scale.
const WORLD_W = 19968; // squares, from map/tiles.json world.squares
const WORLD_H = 16128;
const TILE = 256;
const ZOOM = 11;
const SCALE = 2 ** (ZOOM - 15);
const IMAGE_W = Math.ceil(WORLD_W * SCALE); // 1248
const IMAGE_H = Math.ceil(WORLD_H * SCALE); // 1008
const COLS = Math.ceil(IMAGE_W / TILE); // 5, last column 224 px
const ROWS = Math.ceil(IMAGE_H / TILE); // 4, last row 240 px

// Grid tracks sized in proportion to each tile's real width or height, so the
// partial edge tiles keep their shape.
function tracks(count: number, total: number): string {
  return Array.from({ length: count }, (_, i) => `minmax(0, ${Math.min(TILE, total - i * TILE)}fr)`).join(' ');
}

const TILES = Array.from({ length: ROWS * COLS }, (_, i) => ({ x: i % COLS, y: Math.floor(i / COLS) }));

export function ServerNow() {
  return (
    <section className="server-now" aria-labelledby="server-now-title">
      <div className="server-now__content">
        <h2 className="server-now__title" id="server-now-title">
          The server map
        </h2>

        <div
          className="server-now__map"
          role="img"
          aria-label="Server map of the whole Build 42 world"
          style={{
            aspectRatio: `${WORLD_W} / ${WORLD_H}`,
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
              decoding="async"
              onError={(e) => {
                // The pyramid is sparse: tiles with no populated cells do not exist.
                e.currentTarget.style.visibility = 'hidden';
              }}
            />
          ))}
        </div>

        <p className="server-now__link-row">
          <a className="server-now__link" href="/map/">
            Open the live map
          </a>
        </p>
      </div>
    </section>
  );
}
