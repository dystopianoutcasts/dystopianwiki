// KB15: the shared header's pure rules: keyboard, theme choice and storage, the boot script,
// the member reading, current link and the login link.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'
import { panelKeyAction, triggerKeyAction } from './menuKeys'
import { LIVE_MAP_ID, currentFor, isMapPath, loginHrefFor } from './nav'
import { avatarUrl, displayName, memberDisplay } from './profile'
import { THEME_CHOICES, THEME_STORAGE_KEY, parseThemeChoice, readThemeChoice, resolveTheme, writeThemeChoice } from './theme'
import { THEME_BOOT_SCRIPT, THEME_BOOT_TAG, THEME_STORAGE_KEY as BOOT_KEY, themeBootPlugin } from './themeBoot'

describe('keyboard: the closed button', () => {
  it('ArrowDown opens on the first option, ArrowUp on the last', () => {
    expect(triggerKeyAction('ArrowDown', false)).toBe('first')
    expect(triggerKeyAction('ArrowUp', false)).toBe('last')
  })
  it('Enter and Space are left to the button, whose click opens on the first option', () => {
    expect(triggerKeyAction('Enter', false)).toBeNull()
    expect(triggerKeyAction(' ', false)).toBeNull()
  })
  it('does nothing once open', () => {
    expect(triggerKeyAction('ArrowDown', true)).toBeNull()
  })
})

describe('keyboard: the open pop-up', () => {
  it('Escape closes and returns focus to the button', () => {
    expect(panelKeyAction('Escape', 1, 3)).toEqual({ kind: 'close', returnFocus: true })
    expect(panelKeyAction('Escape', -1, 0)).toEqual({ kind: 'close', returnFocus: true })
  })
  it('ArrowDown and ArrowUp move with wrap-around', () => {
    expect(panelKeyAction('ArrowDown', 0, 3)).toEqual({ kind: 'focus', index: 1 })
    expect(panelKeyAction('ArrowDown', 2, 3)).toEqual({ kind: 'focus', index: 0 })
    expect(panelKeyAction('ArrowUp', 0, 3)).toEqual({ kind: 'focus', index: 2 })
    expect(panelKeyAction('ArrowUp', 2, 3)).toEqual({ kind: 'focus', index: 1 })
  })
  it('from no option, ArrowDown goes to the first and ArrowUp to the last', () => {
    expect(panelKeyAction('ArrowDown', -1, 3)).toEqual({ kind: 'focus', index: 0 })
    expect(panelKeyAction('ArrowUp', -1, 3)).toEqual({ kind: 'focus', index: 2 })
  })
  it('Home and End jump to the ends', () => {
    expect(panelKeyAction('Home', 2, 3)).toEqual({ kind: 'focus', index: 0 })
    expect(panelKeyAction('End', 0, 3)).toEqual({ kind: 'focus', index: 2 })
  })
  it('Tab is left to the browser, so it moves through the options in order', () => {
    expect(panelKeyAction('Tab', 0, 3)).toEqual({ kind: 'none' })
  })
  it('an empty pop-up ignores movement keys', () => {
    expect(panelKeyAction('ArrowDown', -1, 0)).toEqual({ kind: 'none' })
  })
})

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  }
}
const throwing = {
  getItem: (): string | null => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
  removeItem: () => {
    throw new Error('SecurityError')
  },
}

describe('theme: the choice', () => {
  it('one key, shared by both apps and by the boot script', () => {
    expect(THEME_STORAGE_KEY).toBe('do.theme')
    expect(BOOT_KEY).toBe(THEME_STORAGE_KEY)
  })
  it('System, Light, Dark in that order', () => {
    expect(THEME_CHOICES).toEqual(['system', 'light', 'dark'])
  })
  it('the default follows the system: no stored choice is System', () => {
    expect(readThemeChoice(memoryStorage())).toBe('system')
    expect(readThemeChoice(null)).toBe('system')
    expect(resolveTheme('system', true)).toBe('light')
    expect(resolveTheme('system', false)).toBe('dark')
  })
  it('a stored choice wins over the system setting', () => {
    expect(resolveTheme(readThemeChoice(memoryStorage({ [THEME_STORAGE_KEY]: 'light' })), false)).toBe('light')
    expect(resolveTheme(readThemeChoice(memoryStorage({ [THEME_STORAGE_KEY]: 'dark' })), true)).toBe('dark')
  })
  it('a bad stored value is ignored (System)', () => {
    for (const bad of ['LIGHT', 'blue', '', '"light"', 'system ', '1']) {
      expect(readThemeChoice(memoryStorage({ [THEME_STORAGE_KEY]: bad }))).toBe('system')
    }
    expect(parseThemeChoice(undefined)).toBe('system')
  })
  it('storage that throws reads as System and a write reports failure without throwing', () => {
    expect(readThemeChoice(throwing)).toBe('system')
    expect(writeThemeChoice(throwing, 'light')).toBe(false)
    expect(writeThemeChoice(null, 'dark')).toBe(false)
  })
  it('writing Light or Dark stores it; System removes the key', () => {
    const s = memoryStorage()
    expect(writeThemeChoice(s, 'dark')).toBe(true)
    expect(s.data.get(THEME_STORAGE_KEY)).toBe('dark')
    expect(writeThemeChoice(s, 'system')).toBe(true)
    expect(s.data.has(THEME_STORAGE_KEY)).toBe(false)
  })
})

/** Runs the boot script with a fake page and returns the data-theme it set. */
function boot(opts: { stored?: string | null; storageThrows?: boolean; prefersLight?: boolean; matchMedia?: 'missing' | 'throws' }) {
  const attrs: Record<string, string> = {}
  const window = {
    get localStorage() {
      if (opts.storageThrows) throw new Error('SecurityError')
      return { getItem: (k: string) => (k === THEME_STORAGE_KEY ? opts.stored ?? null : null) }
    },
    matchMedia:
      opts.matchMedia === 'missing'
        ? undefined
        : (q: string) => {
            if (opts.matchMedia === 'throws') throw new Error('no')
            return { matches: q === '(prefers-color-scheme: light)' && !!opts.prefersLight }
          },
  }
  const document = { documentElement: { setAttribute: (k: string, v: string) => void (attrs[k] = v) } }
  runInNewContext(THEME_BOOT_SCRIPT, { window, document })
  return attrs['data-theme']
}

describe('theme: the boot script that runs before the first paint', () => {
  const cases: Array<[string | null, boolean]> = []
  for (const stored of [null, 'light', 'dark', 'system', 'bogus']) for (const light of [false, true]) cases.push([stored, light])

  it.each(cases)('stored %s, system light %s: the same result as the typed rules', (stored, light) => {
    const storage = memoryStorage(stored === null ? {} : { [THEME_STORAGE_KEY]: stored })
    expect(boot({ stored, prefersLight: light })).toBe(resolveTheme(readThemeChoice(storage), light))
  })

  it('always sets data-theme, even when storage or matchMedia throw or are missing (dark, the default)', () => {
    expect(boot({ storageThrows: true })).toBe('dark')
    expect(boot({ storageThrows: true, prefersLight: true })).toBe('light')
    expect(boot({ matchMedia: 'missing' })).toBe('dark')
    expect(boot({ matchMedia: 'throws' })).toBe('dark')
    expect(boot({ stored: 'light', matchMedia: 'throws' })).toBe('light')
  })

  it('the plugin puts it first in <head>, once', () => {
    const plugin = themeBootPlugin()
    const html = '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n  </head>\n  <body></body>\n</html>'
    const out = plugin.transformIndexHtml(html)
    expect(out.indexOf(THEME_BOOT_TAG)).toBeGreaterThan(out.indexOf('<head>'))
    expect(out.indexOf(THEME_BOOT_TAG)).toBeLessThan(out.indexOf('<meta charset'))
    expect(plugin.transformIndexHtml(out)).toBe(out)
    expect(() => plugin.transformIndexHtml('<html><body></body></html>')).toThrow()
  })

  it('both apps load the plugin in their Vite config', () => {
    for (const app of ['web', 'aurora']) {
      const config = readFileSync(fileURLToPath(new URL(`../../${app}/vite.config.ts`, import.meta.url)), 'utf8')
      expect(config, app).toMatch(/import \{ themeBootPlugin \} from '\.\.\/shared\/site-header\/themeBoot'/)
      expect(config, app).toMatch(/plugins: \[[^\]]*themeBootPlugin\(\)/)
    }
  })
})

describe('the member reading', () => {
  const choice = (meta: Record<string, unknown>, email?: string) => memberDisplay({ user_metadata: meta, email })

  it('the name: Discord display name, then full name, name, user name; then the email\'s first part; then Member', () => {
    expect(displayName({ user_metadata: { custom_claims: { global_name: 'Rax' }, full_name: 'raxdeg' } })).toBe('Rax')
    expect(displayName({ user_metadata: { full_name: '  raxdeg ' } })).toBe('raxdeg')
    expect(displayName({ user_metadata: { user_name: 'u' } })).toBe('u')
    expect(displayName({ user_metadata: {}, email: 'outcast@example.com' })).toBe('outcast')
    expect(displayName({ user_metadata: null })).toBe('Member')
  })

  it('only https avatars; anything else falls back to the initial', () => {
    expect(avatarUrl({ user_metadata: { avatar_url: 'https://cdn.discordapp.com/a.png' } })).toBe('https://cdn.discordapp.com/a.png')
    expect(avatarUrl({ user_metadata: { picture: 'https://lh3.googleusercontent.com/a' } })).toBe('https://lh3.googleusercontent.com/a')
    for (const bad of ['http://x/a.png', 'javascript:alert(1)', 'data:image/png;base64,AAAA', '//evil.example/a.png', ' ', 'https://', 42]) {
      expect(avatarUrl({ user_metadata: { avatar_url: bad } }), String(bad)).toBeNull()
    }
  })

  it('the initial is the first character of the name, upper case', () => {
    expect(choice({ full_name: 'raxdeg' }).initial).toBe('R')
    expect(choice({}, undefined).initial).toBe('M')
  })
})

describe('the current link and the login link', () => {
  // The shorter href first, so a bare prefix match would wrongly pick it for /modding.
  const sections = [
    { id: 'mod', name: 'Mod', href: '/pz/build-42/mod' },
    { id: 'modding', name: 'Modding', href: '/pz/build-42/modding' },
  ]
  it('a section is current on its page and below it, not on a longer sibling', () => {
    expect(currentFor('/pz/build-42/modding', sections)).toBe('modding')
    expect(currentFor('/pz/build-42/modding/lua/events', sections)).toBe('modding')
    expect(currentFor('/pz/build-42/mod', sections)).toBe('mod')
    expect(currentFor('/pz/build-41/modding', sections)).toBeNull()
    expect(currentFor('/', sections)).toBeNull()
  })
  it('Live Map is current on the map', () => {
    expect(currentFor('/map/', sections)).toBe(LIVE_MAP_ID)
    expect(isMapPath('/mapping')).toBe(false)
  })
  it('"Log in" carries this page as next, encoded', () => {
    expect(loginHrefFor('/pz/build-42/modding?x=1')).toBe('/login?next=%2Fpz%2Fbuild-42%2Fmodding%3Fx%3D1')
    expect(loginHrefFor('/map/')).toBe('/login?next=%2Fmap%2F')
    expect(loginHrefFor('/map/#/link')).toBe('/login?next=%2Fmap%2F%23%2Flink')
  })
  it('no next for the login and register pages, or for anything that is not a same-site path', () => {
    for (const p of ['/login', '/login?next=%2F', '/register', '//evil.example', 'https://evil.example', '/\\evil']) {
      expect(loginHrefFor(p), p).toBe('/login')
    }
  })
})

