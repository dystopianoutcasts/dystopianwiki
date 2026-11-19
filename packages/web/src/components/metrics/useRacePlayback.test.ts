import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { START_ROOT_MARGIN, autoStartMode } from './useRacePlayback'

test('a race never starts by itself with reduced motion', () => {
  assert.equal(autoStartMode(true, true), 'never')
  assert.equal(autoStartMode(true, false), 'never')
})

test('a race waits until it is seen when the browser can tell', () => {
  assert.equal(autoStartMode(false, true), 'when-seen')
})

test('a race starts at once when the browser cannot tell what is on screen', () => {
  assert.equal(autoStartMode(false, false), 'now')
})

test('the start line uses a bottom margin, not a ratio, so a race taller than a phone still starts', () => {
  assert.match(START_ROOT_MARGIN, /^0px 0px -\d+% 0px$/)
})

test('every race section carries the view ref, and nothing starts playing on mount', () => {
  const shell = readFileSync(new URL('./RaceShell.tsx', import.meta.url), 'utf8')
  assert.match(shell, /<section ref=\{playback\.viewRef\}/)
  const hook = readFileSync(new URL('./useRacePlayback.ts', import.meta.url), 'utf8')
  assert.match(hook, /useState\(false\)/)
  assert.doesNotMatch(hook, /useState\(\(\) => !snapshot\(\)\)/)
})
