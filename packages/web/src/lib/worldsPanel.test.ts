/** Tests for worldsPanel: when undo shows, the status line, the leftovers line, the home line. */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { canUndo, homeWorldLine, leftoversText, originText, pendingText, statusLine, UNDO_WINDOW_MS } from './worldsPanel'
import type { World } from './worldsApi'

const NOW = Date.parse('2026-10-02T12:00:00Z')
const W: World = { worldId: 'w', seq: 2, exporterWorldId: null, status: 'current', detectedBy: 'migration', startedAt: '2026-10-02T09:00:00Z', endedAt: null, worldAgeHoursAtStart: 0, note: null }

test('undo shows inside 24 hours and not after', () => {
  assert.equal(canUndo(W, NOW), true)
  assert.equal(canUndo({ ...W, startedAt: new Date(NOW - UNDO_WINDOW_MS + 1000).toISOString() }, NOW), true)
  assert.equal(canUndo({ ...W, startedAt: new Date(NOW - UNDO_WINDOW_MS).toISOString() }, NOW), false)
  assert.equal(canUndo({ ...W, startedAt: '2026-09-30T09:00:00Z' }, NOW), false)
})

test('undo never shows without a current world or with a bad date', () => {
  assert.equal(canUndo(null, NOW), false)
  assert.equal(canUndo({ ...W, status: 'ended' }, NOW), false)
  assert.equal(canUndo({ ...W, startedAt: 'nope' }, NOW), false)
})

test('the status line names who detected the world', () => {
  assert.match(statusLine(W), /^World 2, started .*, detected by the migration$/)
  assert.match(statusLine({ ...W, detectedBy: 'admin' }), /detected by an admin$/)
  assert.match(statusLine({ ...W, detectedBy: 'exporter', exporterWorldId: 'e' }), /detected by the exporter$/)
  assert.equal(originText('migration'), 'Detected by the migration')
  assert.equal(originText('admin'), 'Started by an admin')
})

test('the leftovers line lists non-zero counts only', () => {
  assert.equal(leftoversText({ counts: [], vehicleClaimsStale: 0, pending: null }), 'Nothing left over')
  const t = leftoversText({ counts: [{ key: 'vehicles', count: 5 }, { key: 'safehouses', count: 1 }], vehicleClaimsStale: 3, pending: null })
  assert.match(t, /3 car claims still in the claim file, 5 cars, 1 safehouses/)
  assert.doesNotMatch(t, /\b0 /)
})

test('the pending notice carries the date and the age', () => {
  assert.match(pendingText({ worldId: 'p', startedAt: '2026-10-02T09:00:00Z', worldAgeHoursAtStart: 300.4 }), /world age of 300 hours/)
})

test('the home line exists only when the seq is a number', () => {
  assert.equal(homeWorldLine(null, new Date()), null)
  assert.equal(homeWorldLine(3, new Date(2026, 9, 2, 12)), 'World 3 since Oct 2')
  assert.equal(homeWorldLine(3, null), 'World 3')
})
