/**
 * ServerBuddy download, the pure half. node:test, run with
 * `npx tsx --test src/lib/serverBuddy.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { classifyStorageError, findListedFile, formatMegabytes, parseSignedUrl, storedFileLine } from './serverBuddy'
import {
  SERVERBUDDY_BUCKET,
  SERVERBUDDY_BYTES,
  SERVERBUDDY_FILE,
  SERVERBUDDY_LINK_SECONDS,
  SERVERBUDDY_OBJECT,
  SERVERBUDDY_SHA256,
  SERVERBUDDY_VERSION,
} from '../data/serverBuddy'

test('the release data names one file in the private bucket', () => {
  assert.equal(SERVERBUDDY_BUCKET, 'admin-tools')
  assert.equal(SERVERBUDDY_FILE, `ServerBuddy-${SERVERBUDDY_VERSION}.exe`)
  assert.equal(SERVERBUDDY_OBJECT, `serverbuddy/${SERVERBUDDY_FILE}`)
  assert.match(SERVERBUDDY_SHA256, /^[0-9A-F]{64}$/)
  assert.ok(Number.isSafeInteger(SERVERBUDDY_BYTES) && SERVERBUDDY_BYTES > 0)
  assert.ok(SERVERBUDDY_LINK_SECONDS > 0 && SERVERBUDDY_LINK_SECONDS <= 300)
})

test('Storage errors sort into missing, login and network', () => {
  // What Storage sends for a missing object, and for one row level security hides.
  assert.equal(classifyStorageError({ name: 'StorageApiError', message: 'Object not found', status: 400, statusCode: '404' }), 'missing')
  assert.equal(classifyStorageError({ message: 'not_found' }), 'missing')
  assert.equal(classifyStorageError({ message: 'jwt expired', status: 400, statusCode: '403' }), 'login')
  assert.equal(classifyStorageError({ message: 'Invalid JWT', status: 400, statusCode: '400' }), 'login')
  assert.equal(classifyStorageError({ message: 'Unauthorized', statusCode: '401' }), 'login')
  assert.equal(classifyStorageError({ name: 'StorageUnknownError', message: 'Failed to fetch' }), 'network')
  assert.equal(classifyStorageError({ message: 'Internal Server Error', status: 500, statusCode: '500' }), 'network')
  assert.equal(classifyStorageError(null), 'network')
})

test('a signed link is followed only when it is https and carries a token', () => {
  const good = 'https://abc.supabase.co/storage/v1/object/sign/admin-tools/serverbuddy/ServerBuddy-0.1.0.exe?token=eyJ.x.y&download=ServerBuddy-0.1.0.exe'
  assert.equal(parseSignedUrl({ signedUrl: good }), new URL(good).toString())
  assert.equal(parseSignedUrl({ signedUrl: 'http://abc.supabase.co/x?token=t' }), null)
  assert.equal(parseSignedUrl({ signedUrl: 'http://localhost:54321/x?token=t' }), 'http://localhost:54321/x?token=t')
  assert.equal(parseSignedUrl({ signedUrl: 'javascript:alert(1)//?token=t' }), null)
  assert.equal(parseSignedUrl({ signedUrl: 'https://abc.supabase.co/x' }), null)
  assert.equal(parseSignedUrl({ signedUrl: 'not a url' }), null)
  assert.equal(parseSignedUrl({ signedUrl: 42 }), null)
  assert.equal(parseSignedUrl(null), null)
})

test('the listing finds the release file and its size', () => {
  const listing = [
    { name: 'ServerBuddy-0.0.9.exe', updated_at: '2026-11-01T00:00:00Z', metadata: { size: 1 } },
    { name: 'ServerBuddy-0.1.0.exe', updated_at: '2026-11-13T22:00:00Z', metadata: { size: 11352576, mimetype: 'application/octet-stream' } },
  ]
  assert.deepEqual(findListedFile(listing, 'ServerBuddy-0.1.0.exe'), { bytes: 11352576, updatedAt: '2026-11-13T22:00:00Z' })
  assert.equal(findListedFile(listing, 'ServerBuddy-0.2.0.exe'), null)
  assert.equal(findListedFile([], 'ServerBuddy-0.1.0.exe'), null)
  assert.deepEqual(findListedFile([{ name: 'ServerBuddy-0.1.0.exe', metadata: null }], 'ServerBuddy-0.1.0.exe'), { bytes: null, updatedAt: null })
  assert.equal(findListedFile({ name: 'x' }, 'x'), 'malformed')
  assert.equal(findListedFile([{ id: 1 }], 'x'), 'malformed')
})

test('the card warns when the file is missing or a different size', () => {
  assert.equal(storedFileLine({ bytes: 100, updatedAt: null }, 100, 'f.exe').tone, 'ok')
  assert.equal(storedFileLine({ bytes: null, updatedAt: null }, 100, 'f.exe').tone, 'ok')
  const missing = storedFileLine(null, 100, 'f.exe')
  assert.equal(missing.tone, 'warn')
  assert.match(missing.text, /not uploaded yet/)
  const other = storedFileLine({ bytes: 99, updatedAt: null }, 100, 'f.exe')
  assert.equal(other.tone, 'warn')
  assert.match(other.text, /99 bytes, not 100/)
})

test('sizes read as megabytes with one decimal', () => {
  assert.equal(formatMegabytes(11352576), '10.8 MB')
})
