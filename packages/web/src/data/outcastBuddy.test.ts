/**
 * Outcast Checkpoint download data. node:test, run with
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
    `/dystopianoutcasts/OutcastBuddy-Installer/releases/download/v${INSTALLER_VERSION}/OutcastCheckpointInstaller.exe`,
  )
})

test('the SHA-256 shown is a full 64-character hash', () => {
  assert.match(INSTALLER_SHA256, /^[0-9A-F]{64}$/)
})

test('the Workshop link is the Outcast Checkpoint item', () => {
  assert.match(BUDDY_WORKSHOP_ID, /^[0-9]{6,20}$/)
  assert.equal(new URL(BUDDY_WORKSHOP_URL).searchParams.get('id'), BUDDY_WORKSHOP_ID)
})

test('sizes read as megabytes with one decimal', () => {
  assert.equal(formatMegabytes(3993088), '3.8 MB')
})

test('each system downloads its own file from the same release, with a full hash', async () => {
  const { BUDDY_DOWNLOADS, BUDDY_SYSTEMS } = await import('./outcastBuddy')
  assert.deepEqual(BUDDY_SYSTEMS, ['windows', 'mac', 'linux'])
  const files = new Set<string>()
  for (const s of BUDDY_SYSTEMS) {
    const d = BUDDY_DOWNLOADS[s]
    assert.equal(d.system, s)
    assert.match(d.sha256, /^[0-9A-F]{64}$/, s)
    assert.ok(d.bytes > 1_000_000, s)
    const url = new URL(d.url)
    assert.equal(url.protocol, 'https:')
    assert.equal(url.pathname, `/dystopianoutcasts/OutcastBuddy-Installer/releases/download/v${INSTALLER_VERSION}/${d.file}`)
    assert.ok(d.hashCommand.includes(d.file), `${s}: the hash command names the file`)
    files.add(d.file)
  }
  assert.equal(files.size, 3)
  assert.equal(BUDDY_DOWNLOADS.windows.url, INSTALLER_DOWNLOAD_URL)
  assert.equal(BUDDY_DOWNLOADS.windows.firstTestBuild, false)
})

test('the page opens to the system the browser reports', async () => {
  const { detectSystem } = await import('./outcastBuddy')
  const win = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36'
  const mac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15'
  const linux = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36'
  const deck = 'Mozilla/5.0 (X11; Linux x86_64; Valve Steam Client/default/1700000000) AppleWebKit/537.36'
  const android = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36'
  const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
  assert.equal(detectSystem('Win32', win, 0), 'windows')
  assert.equal(detectSystem('Windows', win, 0), 'windows')
  assert.equal(detectSystem('MacIntel', mac, 0), 'mac')
  assert.equal(detectSystem('macOS', mac, 0), 'mac')
  assert.equal(detectSystem('Linux x86_64', linux, 0), 'linux')
  assert.equal(detectSystem('Linux x86_64', deck, 0), 'linux')
  // phones and tablets: Windows, the most common PC
  assert.equal(detectSystem('Linux armv81', android, 5), 'windows')
  assert.equal(detectSystem('iPhone', iphone, 5), 'windows')
  assert.equal(detectSystem('MacIntel', mac, 5), 'windows') // an iPad reports a Mac
  assert.equal(detectSystem('', '', 0), 'windows')
})
