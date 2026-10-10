// The site header shared by the wiki (packages/web) and the live map (packages/aurora), KB15.
//
// A source-shared folder, not a built package: each app's Vite build and tsc compile these
// files with the app's own React (both 18.3). It is excluded from the @dystopianwiki/shared
// tsc build (packages/shared/tsconfig.json), like shared/aurora. Its tests run in the map's
// vitest (packages/aurora/vite.config.ts includes them).
export { SiteHeader } from './SiteHeader'
export type { AccountInput, SiteHeaderProps } from './SiteHeader'
export { LIVE_MAP_HREF, LIVE_MAP_ID, currentFor, isMapPath, loginHrefFor } from './nav'
export type { SiteSection } from './nav'
export { memberDisplay } from './profile'
export type { MemberDisplay, UserLike } from './profile'
export type { SiteAdminCheck } from './useSiteAdmin'
export type { LinkClick } from './views'
