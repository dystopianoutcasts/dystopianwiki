// The theme boot script (KB15): sets data-theme on <html> before the first paint, so a
// visitor who chose Light (or whose system is light) never sees a dark flash.
//
// Kept free of DOM types on purpose: each app's vite.config.ts imports themeBootPlugin, and
// the config is type-checked without the DOM library. theme.ts holds the same rules as
// typed functions; logic.test.ts runs this script against them case by case.

/** The same key as theme.ts's THEME_STORAGE_KEY (logic.test.ts pins them equal). */
export const THEME_STORAGE_KEY = 'do.theme'

/**
 * Plain ES5 so it runs before any bundle. Storage and matchMedia can each throw; whatever
 * fails, the page falls back to the default dark palette rather than breaking.
 */
export const THEME_BOOT_SCRIPT =
  '(function(){var d=document.documentElement,c=null;' +
  `try{c=window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}` +
  "if(c!=='light'&&c!=='dark'){c='dark';" +
  "try{if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)c='light'}catch(e){}}" +
  "d.setAttribute('data-theme',c)})();"

/** The tag the plugin writes, first thing in <head>. */
export const THEME_BOOT_TAG = `<script data-theme-boot>${THEME_BOOT_SCRIPT}</script>`

/**
 * A Vite plugin that puts the boot script first in <head> of the app's index.html, so the
 * wiki and the map run the same script without a copy in either index.html. Structurally
 * typed (no import of vite here) so it fits both apps' configs.
 */
export function themeBootPlugin(): { name: string; transformIndexHtml: (html: string) => string } {
  return {
    name: 'dystopian-theme-boot',
    transformIndexHtml(html: string): string {
      if (html.includes('data-theme-boot')) return html
      const head = /<head[^>]*>/i.exec(html)
      if (!head) throw new Error('theme boot: index.html has no <head>')
      const at = head.index + head[0].length
      return `${html.slice(0, at)}\n    ${THEME_BOOT_TAG}${html.slice(at)}`
    },
  }
}
