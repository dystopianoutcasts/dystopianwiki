// "Log in"'s next on the map (KB15): this page of the map, so the login page sends the
// member back here. Its own module so it can be tested without loading React Router.
import { LIVE_MAP_HREF } from '../../../shared/site-header/nav'

/** /map/ on the map's home route, /map/#/<route> on another HashRouter route. */
export function mapPagePath(routePath: string): string {
  return routePath === '/' || routePath === '' ? LIVE_MAP_HREF : `${LIVE_MAP_HREF}#${routePath}`
}
