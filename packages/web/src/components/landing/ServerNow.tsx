import { useServerNow } from '../../hooks/useServerNow';
import '../../styles/components/server-now.css';

const PLAYER_LIST_CAP = 12;

// Zoom level 10 of the tile pyramid: 3 columns x 2 rows of 256px tiles, right
// column and bottom row partial. Source: docs/planning/BUILD42_CONTENT_PLAN.md
// section 2 and packages/aurora/src/map/tiles.json (world.squares).
const MAP_TILE_COLS = 3;
const MAP_TILE_ROWS = 2;
// Natural pyramid size at zoom 10 (right column and bottom row are partial tiles),
// stretched to fill the grid; see docs/planning/BUILD42_CONTENT_PLAN.md section 2.
const MAP_ASPECT_RATIO = 624 / 504;

function statusText(
  status: 'ok' | 'stale' | 'nodata' | 'error',
  onlineCount: number,
  lastReportAgeText: string | null,
): string {
  switch (status) {
    case 'ok':
      return onlineCount === 1 ? 'Online, 1 player' : `Online, ${onlineCount} players`;
    case 'stale':
      return lastReportAgeText
        ? `Server may be offline, last report ${lastReportAgeText}`
        : 'Server may be offline';
    case 'nodata':
      return 'No reports yet';
    case 'error':
    default:
      return 'Could not reach the server data';
  }
}

export function ServerNow() {
  const { data, isLoading } = useServerNow();

  const status = data?.status;
  const onlineCount = data?.onlineCount ?? 0;
  const players = data?.players ?? [];
  const positions = data?.positions ?? [];
  const worldSize = data?.worldSize;

  const shownPlayers = players.slice(0, PLAYER_LIST_CAP);
  const extraCount = players.length - shownPlayers.length;

  const showHiddenPositionsNote = onlineCount > 0 && positions.length === 0;

  const tiles: { x: number; y: number }[] = [];
  for (let y = 0; y < MAP_TILE_ROWS; y++) {
    for (let x = 0; x < MAP_TILE_COLS; x++) {
      tiles.push({ x, y });
    }
  }

  const mapAriaLabel =
    positions.length > 0
      ? `Server map showing ${positions.length} player position${positions.length === 1 ? '' : 's'}`
      : 'Server map, no player positions to show';

  return (
    <section className="server-now" aria-labelledby="server-now-title">
      <div className="server-now__content">
        <h2 className="server-now__title" id="server-now-title">
          Server right now
        </h2>

        {isLoading ? (
          <p className="server-now__status server-now__status--loading">Checking the server...</p>
        ) : (
          <>
            <p className={`server-now__status server-now__status--${status ?? 'error'}`}>
              {statusText(status ?? 'error', onlineCount, data?.lastReportAgeText ?? null)}
            </p>

            <div className="server-now__body">
              <div className="server-now__roster">
                {shownPlayers.length > 0 ? (
                  <ul className="server-now__players">
                    {shownPlayers.map((player) => (
                      <li key={player.name} className="server-now__player">
                        {player.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="server-now__empty">Nobody online right now.</p>
                )}
                {extraCount > 0 && <p className="server-now__more">+{extraCount} more</p>}
                {showHiddenPositionsNote && (
                  <p className="server-now__note">Player positions are hidden for visitors.</p>
                )}
              </div>

              <div className="server-now__map-wrap">
                <div
                  className="server-now__map"
                  role="img"
                  aria-label={mapAriaLabel}
                  style={{ aspectRatio: `${MAP_ASPECT_RATIO}` }}
                >
                  <div
                    className="server-now__map-tiles"
                    style={{
                      gridTemplateColumns: `repeat(${MAP_TILE_COLS}, 1fr)`,
                      gridTemplateRows: `repeat(${MAP_TILE_ROWS}, 1fr)`,
                    }}
                  >
                    {tiles.map((tile) => (
                      <img
                        key={`${tile.x}_${tile.y}`}
                        className="server-now__map-tile"
                        src={`/map/tiles/base_top/layer0_files/10/${tile.x}_${tile.y}.webp`}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.visibility = 'hidden';
                        }}
                      />
                    ))}
                  </div>
                  {worldSize &&
                    positions.map((pos) => (
                      <span
                        key={pos.username}
                        className="server-now__dot"
                        title={pos.name}
                        style={{
                          left: `${(pos.x / worldSize.w) * 100}%`,
                          top: `${(pos.y / worldSize.h) * 100}%`,
                        }}
                      />
                    ))}
                </div>
              </div>
            </div>
          </>
        )}

        <a className="server-now__link" href="/map/">
          Open the live map
        </a>
      </div>
    </section>
  );
}
