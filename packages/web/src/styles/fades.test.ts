/**
 * Fades (fades.css) run sideways from the page ground tinted green or orange (one edge) to
 * --color-surface (the other end). Text may sit anywhere on a fade, so every point along it must
 * keep every text color at WCAG 2.2 AA (4.5:1) in both themes. Tokens are read from variables.css.
 * Run with `npx tsx --test src/styles/fades.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const css = readFileSync(fileURLToPath(new URL('./variables.css', import.meta.url)), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

function block(selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`)
  assert.ok(start >= 0, `no ${selector} block in variables.css`)
  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('\n}', start))
  const tokens = new Map<string, string>()
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) tokens.set(m[1], m[2].trim())
  return tokens
}
const dark = block(':root')
const light = new Map([...dark, ...block('[data-theme="light"]')])

function resolve(tokens: Map<string, string>, name: string): string {
  const v = tokens.get(name)
  assert.ok(v, `${name} is not set`)
  const ref = /^var\((--[\w-]+)\)$/.exec(v)
  return ref ? resolve(tokens, ref[1]) : v
}

type Rgb = [number, number, number]
function hex(v: string): Rgb {
  const m = /^#([0-9a-f]{6})$/i.exec(v)
  assert.ok(m, `not a 6-digit hex: ${v}`)
  return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) as Rgb
}
function rgba(v: string): { rgb: Rgb; a: number } {
  const m = /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/.exec(v)
  assert.ok(m, `not an rgba(): ${v}`)
  return { rgb: [Number(m[1]), Number(m[2]), Number(m[3])], a: Number(m[4]) }
}
const over = (ground: Rgb, l: { rgb: Rgb; a: number }): Rgb =>
  ground.map((g, i) => Math.round(g * (1 - l.a) + l.rgb[i] * l.a)) as Rgb
function lum([r, g, b]: Rgb): number {
  const c = (x: number) => ((x /= 255) <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
}
const contrast = (a: Rgb, b: Rgb) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb => a.map((x, i) => x + (b[i] - x) * t) as Rgb

for (const [mode, tokens] of [['dark', dark], ['light', light]] as const) {
  for (const tint of ['--fade-green', '--fade-orange']) {
    test(`${mode}: text keeps 4.5:1 all along a ${tint} fade`, () => {
      const page = hex(resolve(tokens, '--color-background'))
      const surface = hex(resolve(tokens, '--color-surface'))
      const edge = rgba(resolve(tokens, tint))
      for (let i = 0; i <= 40; i++) {
        const t = i / 40
        const ground = over(mix(page, surface, t), { rgb: edge.rgb, a: edge.a * (1 - t) })
        for (const text of ['--color-text-primary', '--color-text-secondary', '--color-text-muted']) {
          const ratio = contrast(hex(resolve(tokens, text)), ground)
          assert.ok(ratio >= 4.5, `${mode} ${text} at ${Math.round(t * 100)}% of ${tint}: ${ratio.toFixed(2)}:1`)
        }
      }
    })
  }
}
