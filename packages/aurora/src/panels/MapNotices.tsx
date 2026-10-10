// T50: admin-only notices above the layer toggles. MapPage renders this for admins only
// and passes nothing it could not read without error (both fail closed). The admin page
// is the wiki's own /admin, so the links are plain page loads, never react-router links
// (site/MapHeader.tsx and packages/shared/site-header/views.tsx explain why).

/** The no-tiles notice for one map, exactly as the admin reads it. */
export function noTilesText(name: string): string {
  return `The server runs ${name} but the map has no tiles for it.`
}

export const PENDING_WORLD_TEXT = 'The server reported a new world that has not been confirmed.'

export function MapNotices({ noTiles, pendingWorld }: { noTiles: string[]; pendingWorld: boolean }) {
  if (noTiles.length === 0 && !pendingWorld) return null
  return (
    <div className="panel map-notices" role="status">
      {noTiles.map((name) => (
        <p key={name} className="note warn">
          {noTilesText(name)} <a href="/admin">Open the admin page to rebuild.</a>
        </p>
      ))}
      {pendingWorld ? (
        <p className="note warn">
          {PENDING_WORLD_TEXT} <a href="/admin">Open the admin page.</a>
        </p>
      ) : null}
    </div>
  )
}
