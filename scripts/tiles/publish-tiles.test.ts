import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { checkBudget, listPyramidFiles, parseOverlayArgs, publishDir, pyramidBytes } from './publish-tiles'

// T45 Part PUBLISH: fixture pyramids built on disk under a scratch temp dir, never
// R:\tmp\pzmap2dzi\out or map/tiles. main() itself is not called here - it parses argv,
// prints to stdout and calls process.exit on bad input/over-budget, which would kill the
// test runner; every piece it's built from (parseOverlayArgs, listPyramidFiles,
// pyramidBytes, checkBudget, publishDir) is exported and tested directly instead.

let roots: string[] = []
function makeRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'aurora-publish-'))
  roots.push(root)
  return root
}
afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true })
  roots = []
})

function makePyramid(dir: string, tiles: Record<string, string>): void {
  mkdirSync(join(dir, 'layer0_files', '0'), { recursive: true })
  writeFileSync(join(dir, 'layer0.dzi'), '<Image TileSize="256"/>')
  for (const [rel, content] of Object.entries(tiles)) {
    mkdirSync(join(dir, 'layer0_files', ...rel.split('/').slice(0, -1)), { recursive: true })
    writeFileSync(join(dir, 'layer0_files', ...rel.split('/')), content)
  }
}

describe('parseOverlayArgs', () => {
  it('parses id=dir pairs in the order given', () => {
    expect(parseOverlayArgs(['sd_cc=R:/tmp/sd_cc', 'other=R:/tmp/other'])).toEqual([
      { id: 'sd_cc', from: 'R:/tmp/sd_cc' },
      { id: 'other', from: 'R:/tmp/other' },
    ])
  })

  it('empty list returns empty', () => {
    expect(parseOverlayArgs([])).toEqual([])
  })

  it('refuses a value with no "="', () => {
    expect(() => parseOverlayArgs(['sd_cc'])).toThrow(/<id>=<from dir>/)
  })

  it('a Windows path\'s own colon does not confuse id/dir splitting (split on the first "=", not ":")', () => {
    expect(parseOverlayArgs(['sd_cc=R:/tmp/pzmap2dzi/out-t45'])).toEqual([
      { id: 'sd_cc', from: 'R:/tmp/pzmap2dzi/out-t45' },
    ])
  })
})

describe('listPyramidFiles + pyramidBytes', () => {
  it('lists layer0.dzi plus every file under layer0_files, and sums their sizes', () => {
    const root = makeRoot()
    makePyramid(root, { '0/0_0.webp': 'abcde', '0/1_0.webp': 'xy' })

    const files = listPyramidFiles(root)
    expect(files.sort()).toEqual([join('layer0_files', '0', '0_0.webp'), join('layer0_files', '0', '1_0.webp'), 'layer0.dzi'].sort())

    const dziBytes = Buffer.byteLength('<Image TileSize="256"/>')
    expect(pyramidBytes(root, files)).toBe(dziBytes + 5 + 2)
  })
})

describe('checkBudget: the combined total, not each pyramid alone', () => {
  it('passes when the total is under budget', () => {
    expect(() => checkBudget(0.5 * 1024 ** 3, 0.9)).not.toThrow()
  })

  it('throws when the total alone exceeds budget', () => {
    expect(() => checkBudget(1.5 * 1024 ** 3, 0.9)).toThrow(/exceeds --budgetGB/)
  })

  it('base (0.6 GB) and one overlay (0.5 GB) each fit a 0.9 GB budget alone, but the combined 1.1 GB does not', () => {
    const baseBytes = 0.6 * 1024 ** 3
    const overlayBytes = 0.5 * 1024 ** 3
    expect(() => checkBudget(baseBytes, 0.9)).not.toThrow()
    expect(() => checkBudget(overlayBytes, 0.9)).not.toThrow()
    expect(() => checkBudget(baseBytes + overlayBytes, 0.9)).toThrow(/exceeds --budgetGB/)
  })
})

describe('publishDir: content-hash skipping', () => {
  it('copies a file that does not exist at the destination yet (added)', () => {
    const root = makeRoot()
    const from = join(root, 'from')
    const to = join(root, 'to')
    makePyramid(from, { '0/0_0.webp': 'hello' })
    const files = listPyramidFiles(from)

    const result = publishDir(from, files, to, false)

    expect(result).toEqual({ added: files.length, changed: 0, skipped: 0 })
    expect(readFileSync(join(to, 'layer0_files', '0', '0_0.webp'), 'utf8')).toBe('hello')
  })

  it('skips a file whose content hash already matches the destination', () => {
    const root = makeRoot()
    const from = join(root, 'from')
    const to = join(root, 'to')
    makePyramid(from, { '0/0_0.webp': 'hello' })
    const files = listPyramidFiles(from)
    publishDir(from, files, to, false)

    const second = publishDir(from, files, to, false)

    expect(second).toEqual({ added: 0, changed: 0, skipped: files.length })
  })

  it('re-copies a file whose content changed (changed, not added)', () => {
    const root = makeRoot()
    const from = join(root, 'from')
    const to = join(root, 'to')
    makePyramid(from, { '0/0_0.webp': 'hello' })
    const files = listPyramidFiles(from)
    publishDir(from, files, to, false)

    writeFileSync(join(from, 'layer0_files', '0', '0_0.webp'), 'goodbye')
    const second = publishDir(from, files, to, false)

    expect(second).toEqual({ added: 0, changed: 1, skipped: files.length - 1 })
    expect(readFileSync(join(to, 'layer0_files', '0', '0_0.webp'), 'utf8')).toBe('goodbye')
  })

  it('--dry-run counts what would change but copies nothing', () => {
    const root = makeRoot()
    const from = join(root, 'from')
    const to = join(root, 'to')
    makePyramid(from, { '0/0_0.webp': 'hello' })
    const files = listPyramidFiles(from)

    const result = publishDir(from, files, to, true)

    expect(result.added).toBe(files.length)
    expect(existsSync(join(to, 'layer0_files', '0', '0_0.webp'))).toBe(false)
  })

  it('an overlay publishes under mod_maps/<id>/base_top, independent of the base destination', () => {
    const root = makeRoot()
    const from = join(root, 'from-overlay')
    const to = join(root, 'to')
    makePyramid(from, { '0/0_0.webp': 'overlay-tile' })
    const files = listPyramidFiles(from)

    publishDir(from, files, join(to, 'mod_maps', 'sd_cc', 'base_top'), false)

    expect(readFileSync(join(to, 'mod_maps', 'sd_cc', 'base_top', 'layer0_files', '0', '0_0.webp'), 'utf8')).toBe('overlay-tile')
  })
})
