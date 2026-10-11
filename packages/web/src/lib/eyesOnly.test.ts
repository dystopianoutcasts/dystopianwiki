/**
 * Tests for the EYES ONLY area's pure logic (eyesOnly.ts).
 * node:test, run with `npm test` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  EYES_ONLY_MAX_BYTES,
  executiveState,
  formatBytes,
  formatDocDate,
  isValidSlug,
  parseDocument,
  parseDocumentList,
  parseExecutiveMembers,
  parsePutResult,
  suggestSlug,
  uploadProblem,
} from './eyesOnly'

const HASH = 'a'.repeat(64)

const listRow = { slug: 'alpha-brief', title: 'Alpha', summary: 'First', updated_at: '2026-10-11T10:00:00Z', size_bytes: 2048 }
const docRow = { slug: 'alpha-brief', title: 'Alpha', summary: 'First', html: '<p>x</p>', sha256: HASH, updated_at: '2026-10-11T10:00:00Z' }
const memberRow = {
  user_id: 'u1',
  email: 'a@example.invalid',
  providers: ['discord'],
  discord_username: 'some_user',
  discord_id: '123',
  joined_at: '2026-10-01T10:00:00Z',
  last_sign_in_at: null,
  is_admin: false,
  is_superadmin: false,
  is_executive: true,
}

test('the slug rule matches the table: lowercase words joined by single hyphens, 80 at most', () => {
  for (const ok of ['a', 'alpha-brief', 'a1-b2-c3', '2026-report', 'a'.repeat(80)]) assert.equal(isValidSlug(ok), true, ok)
  for (const bad of ['', 'Alpha', 'alpha brief', '-a', 'a-', 'a--b', 'a_b', 'a/b', 'a.b', 'a'.repeat(81), 'café']) {
    assert.equal(isValidSlug(bad), false, bad)
  }
})

test('suggestSlug turns a file name into a valid slug, or nothing', () => {
  assert.equal(suggestSlug('My Report (v2).html'), 'my-report-v2')
  assert.equal(suggestSlug('OUR_OWN_NPCS_EYES_ONLY.html'), 'our-own-npcs-eyes-only')
  assert.equal(suggestSlug('...html'), '')
  assert.equal(suggestSlug('éè.html'), '')
  const long = suggestSlug(`${'word-'.repeat(30)}.html`)
  assert.ok(long.length <= 80 && isValidSlug(long))
})

test('uploadProblem checks the file, slug, title and summary, and passes a good draft', () => {
  const good = { slug: 'alpha-brief', title: 'Alpha', summary: '', html: '<p>x</p>' }
  assert.equal(uploadProblem(good), null)
  assert.match(uploadProblem({ ...good, html: '   ' }) ?? '', /Choose an HTML file/)
  assert.match(uploadProblem({ ...good, slug: '' }) ?? '', /Enter a slug/)
  assert.match(uploadProblem({ ...good, slug: 'Bad Slug' }) ?? '', /slug must be/)
  assert.match(uploadProblem({ ...good, title: '  ' }) ?? '', /Enter a title/)
  assert.match(uploadProblem({ ...good, title: 't'.repeat(201) }) ?? '', /title can be at most 200/)
  assert.equal(uploadProblem({ ...good, title: 't'.repeat(200) }), null)
  assert.match(uploadProblem({ ...good, summary: 's'.repeat(501) }) ?? '', /summary can be at most 500/)
  assert.equal(uploadProblem({ ...good, summary: 's'.repeat(500) }), null)
})

test('the size limit is 8 MiB of UTF-8 bytes, not characters', () => {
  const good = { slug: 'big', title: 'Big', summary: '' }
  assert.equal(uploadProblem({ ...good, html: 'a'.repeat(EYES_ONLY_MAX_BYTES) }), null)
  assert.match(uploadProblem({ ...good, html: 'a'.repeat(EYES_ONLY_MAX_BYTES + 1) }) ?? '', /larger than 8\.0 MB/)
  // 2 bytes each: half as many characters already breaks the limit by one character.
  assert.match(uploadProblem({ ...good, html: 'é'.repeat(EYES_ONLY_MAX_BYTES / 2 + 1) }) ?? '', /larger than/)
})

test('formatBytes', () => {
  assert.equal(formatBytes(0), '0 B')
  assert.equal(formatBytes(1023), '1023 B')
  assert.equal(formatBytes(1536), '1.5 KB')
  assert.equal(formatBytes(20 * 1024), '20 KB')
  assert.equal(formatBytes(EYES_ONLY_MAX_BYTES), '8.0 MB')
  assert.equal(formatBytes(-1), '')
  assert.equal(formatBytes(Number.NaN), '')
})

test('parseDocumentList reads the rows and refuses anything malformed', () => {
  const r = parseDocumentList([listRow])
  assert.deepEqual(r.ok && r.value, [{ slug: 'alpha-brief', title: 'Alpha', summary: 'First', updatedAt: '2026-10-11T10:00:00Z', sizeBytes: 2048 }])
  assert.deepEqual(parseDocumentList([]), { ok: true, value: [] })
  assert.equal(parseDocumentList(null).ok, false)
  assert.equal(parseDocumentList({}).ok, false)
  assert.equal(parseDocumentList([{ ...listRow, slug: 'Bad Slug' }]).ok, false)
  assert.equal(parseDocumentList([{ ...listRow, size_bytes: '5' }]).ok, false)
  assert.equal(parseDocumentList([{ ...listRow, size_bytes: -1 }]).ok, false)
  assert.equal(parseDocumentList([{ ...listRow, size_bytes: 1.5 }]).ok, false)
  assert.equal(parseDocumentList([{ ...listRow, updated_at: 'yesterday' }]).ok, false)
  assert.equal(parseDocumentList([{ ...listRow, title: null }]).ok, false)
  assert.equal(parseDocumentList([listRow, 7]).ok, false)
})

test('parseDocument wants exactly one well-formed row', () => {
  const r = parseDocument([docRow])
  assert.deepEqual(r.ok && r.value, {
    slug: 'alpha-brief',
    title: 'Alpha',
    summary: 'First',
    html: '<p>x</p>',
    sha256: HASH,
    updatedAt: '2026-10-11T10:00:00Z',
  })
  assert.equal(parseDocument([]).ok, false)
  assert.equal(parseDocument([docRow, docRow]).ok, false)
  assert.equal(parseDocument(docRow).ok, false)
  assert.equal(parseDocument(null).ok, false)
  assert.equal(parseDocument([{ ...docRow, html: null }]).ok, false)
  assert.equal(parseDocument([{ ...docRow, sha256: 'xyz' }]).ok, false)
  assert.equal(parseDocument([{ ...docRow, sha256: 'A'.repeat(64) }]).ok, false)
  assert.equal(parseDocument([{ ...docRow, slug: '../x' }]).ok, false)
})

test('parsePutResult accepts only a lowercase sha256 hex string', () => {
  assert.deepEqual(parsePutResult(HASH), { ok: true, value: HASH })
  assert.equal(parsePutResult(null).ok, false)
  assert.equal(parsePutResult(HASH.slice(1)).ok, false)
  assert.equal(parsePutResult({ hash: HASH }).ok, false)
})

test('parseExecutiveMembers reads the member columns plus is_executive', () => {
  const r = parseExecutiveMembers([memberRow, { ...memberRow, user_id: 'u2', is_executive: false }])
  assert.equal(r.ok, true)
  assert.deepEqual(r.ok && r.value.map((m) => [m.userId, m.email, m.isExecutive]), [
    ['u1', 'a@example.invalid', true],
    ['u2', 'a@example.invalid', false],
  ])
  assert.deepEqual(parseExecutiveMembers([]), { ok: true, value: [] })
  assert.equal(parseExecutiveMembers(null).ok, false)
  assert.equal(parseExecutiveMembers([{ ...memberRow, is_executive: 'true' }]).ok, false)
  const { is_executive: _dropped, ...without } = memberRow
  void _dropped
  assert.equal(parseExecutiveMembers([without]).ok, false)
  assert.equal(parseExecutiveMembers([{ ...memberRow, is_admin: 'yes' }]).ok, false)
})

test('executiveState: admins and the superadmin are inherited, others by their flag', () => {
  assert.equal(executiveState({ isAdmin: true, isSuperadmin: false, isExecutive: false }), 'inherited')
  assert.equal(executiveState({ isAdmin: true, isSuperadmin: true, isExecutive: true }), 'inherited')
  assert.equal(executiveState({ isAdmin: false, isSuperadmin: false, isExecutive: true }), 'executive')
  assert.equal(executiveState({ isAdmin: false, isSuperadmin: false, isExecutive: false }), 'none')
})

test('formatDocDate reads in UTC and gives nothing for a bad time', () => {
  assert.equal(formatDocDate('2026-10-11T23:30:00Z'), 'Oct 11, 2026')
  assert.equal(formatDocDate('2026-10-12T00:30:00Z'), 'Oct 12, 2026')
  assert.equal(formatDocDate('yesterday'), '')
})
