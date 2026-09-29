/**
 * Tests for the two pure functions behind the home page map viewport
 * (mapView.ts). packages/web has no test framework installed (see
 * package.json); per T40, this is a small node:test file run directly with
 * `npx tsx --test src/utils/mapView.test.ts` from packages/web, not a new
 * test framework dependency.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { centerOf, imageSize, scrollFor, truncateName, WORLD_HEIGHT, WORLD_WIDTH } from './mapView'

const ZOOM = 12
const VIEWPORT = { width: 1100, height: 560 }
const ROSEWOOD = { x: 8350, y: 11750 }

test('imageSize at zoom 12 matches the measured picture (T40 facts: 2496 x 2016)', () => {
  const size = imageSize(ZOOM)
  assert.equal(size.width, 2496)
  assert.equal(size.height, 2016)
})

test('scrollFor centres Rosewood with no clamp (it is away from every edge)', () => {
  const scroll = scrollFor(ROSEWOOD, VIEWPORT, ZOOM)
  // Rosewood at zoom 12 is pixel (1043.75, 1468.75).
  assert.equal(scroll.x, 1043.75 - VIEWPORT.width / 2)
  assert.equal(scroll.y, 1468.75 - VIEWPORT.height / 2)
})

test('scrollFor clamps the left edge without disturbing an unclamped top', () => {
  const scroll = scrollFor({ x: 0, y: 8000 }, VIEWPORT, ZOOM)
  assert.equal(scroll.x, 0)
  assert.equal(scroll.y, 8000 / 8 - VIEWPORT.height / 2)
})

test('scrollFor clamps the right edge without disturbing an unclamped top', () => {
  const scroll = scrollFor({ x: WORLD_WIDTH, y: 8000 }, VIEWPORT, ZOOM)
  const size = imageSize(ZOOM)
  assert.equal(scroll.x, size.width - VIEWPORT.width)
  assert.equal(scroll.y, 8000 / 8 - VIEWPORT.height / 2)
})

test('scrollFor clamps the top edge without disturbing an unclamped left', () => {
  const scroll = scrollFor({ x: 8000, y: 0 }, VIEWPORT, ZOOM)
  assert.equal(scroll.y, 0)
  assert.equal(scroll.x, 8000 / 8 - VIEWPORT.width / 2)
})

test('scrollFor clamps the bottom edge without disturbing an unclamped left', () => {
  const scroll = scrollFor({ x: 8000, y: WORLD_HEIGHT }, VIEWPORT, ZOOM)
  const size = imageSize(ZOOM)
  assert.equal(scroll.y, size.height - VIEWPORT.height)
  assert.equal(scroll.x, 8000 / 8 - VIEWPORT.width / 2)
})

test('scrollFor never goes negative when the viewport is bigger than the picture', () => {
  const scroll = scrollFor(ROSEWOOD, { width: 3000, height: 2500 }, ZOOM)
  assert.equal(scroll.x, 0)
  assert.equal(scroll.y, 0)
})

test('centerOf inverts scrollFor at Rosewood (away from the edges)', () => {
  const scroll = scrollFor(ROSEWOOD, VIEWPORT, ZOOM)
  const back = centerOf(scroll, VIEWPORT, ZOOM)
  assert.equal(back.x, ROSEWOOD.x)
  assert.equal(back.y, ROSEWOOD.y)
})

test('centerOf inverts scrollFor at a second, arbitrary point away from the edges', () => {
  const point = { x: 8000, y: 8000 }
  const scroll = scrollFor(point, VIEWPORT, ZOOM)
  const back = centerOf(scroll, VIEWPORT, ZOOM)
  assert.equal(back.x, point.x)
  assert.equal(back.y, point.y)
})

test('truncateName leaves a short name alone', () => {
  assert.equal(truncateName('Short Name'), 'Short Name')
  assert.equal(truncateName('Another Name'), 'Another Name')
})

test('truncateName cuts a name over 24 characters and ends it in an ellipsis', () => {
  const long = 'A very long player name that must be cut'
  const short = truncateName(long)
  assert.ok(short.endsWith('…'), `expected an ellipsis, got ${JSON.stringify(short)}`)
  assert.ok(short.length <= 25, `expected at most 24 characters plus the ellipsis, got ${short.length}`)
})

test('truncateName does not cut a name of exactly 24 characters', () => {
  const exact = 'x'.repeat(24)
  assert.equal(truncateName(exact), exact)
})
