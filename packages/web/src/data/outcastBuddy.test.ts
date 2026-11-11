/**
 * Outcast Buddy download data. node:test, run with
 * `npx tsx --test src/data/outcastBuddy.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  BUDDY_WORKSHOP_ID,
  BUDDY_WORKSHOP_URL,
  INSTALLER_DOWNLOAD_URL,
  INSTALLER_SHA256,
  INSTALLER_VERSION,
  formatMegabytes,
} from './outcastBuddy'

test('the download is the exact release on our installer repo, over https', () => {
  const url = new URL(INSTALLER_DOWNLOAD_URL)
  assert.equal(url.protocol, 'https:')
  assert.equal(url.hostname, 'github.com')
  assert.equal(
    url.pathname,
    `/dystopianoutcasts/OutcastBuddy-Installer/releases/download/v${INSTALLER_VERSION}/OutcastBuddyInstaller.exe`,
  )
})

test('the SHA-256 shown is a full 64-character hash', () => {
  assert.match(INSTALLER_SHA256, /^[0-9A-F]{64}$/)
})

test('the Workshop link is the Outcast Buddy item', () => {
  assert.match(BUDDY_WORKSHOP_ID, /^[0-9]{6,20}$/)
  assert.equal(new URL(BUDDY_WORKSHOP_URL).searchParams.get('id'), BUDDY_WORKSHOP_ID)
})

test('sizes read as megabytes with one decimal', () => {
  assert.equal(formatMegabytes(3993088), '3.8 MB')
})
