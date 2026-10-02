/**
 * Tests for authError: reading Supabase Auth's error out of a returned URL, choosing the
 * message, and tidying the URL. The first case is the exact URL a member was sent to on
 * 2026-10-01 when registration failed.
 *
 * node:test, run with `npx tsx --test src/utils/authError.test.ts` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { AUTH_ERROR_TEXT, authErrorKind, readAuthError, withoutAuthError } from './authError'

const REAL_SEARCH = '?error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user'
const REAL_HASH = '#error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user&sb='

test('the failed-registration URL reads as an account that could not be created', () => {
  const e = readAuthError(REAL_SEARCH, REAL_HASH)
  assert.deepEqual(e, { error: 'server_error', code: 'unexpected_failure', description: 'Database error saving new user' })
  assert.equal(authErrorKind(e!), 'account_create_failed')
  assert.match(AUTH_ERROR_TEXT.account_create_failed, /not anything you did/)
})

test('the error is found in the hash alone and in the query alone', () => {
  assert.equal(readAuthError('', '#error=access_denied&error_description=The+user+denied')?.error, 'access_denied')
  assert.equal(readAuthError('?error_description=Signups+not+allowed+for+this+instance', '')?.description, 'Signups not allowed for this instance')
  assert.equal(readAuthError('?error_code=signup_disabled', '')?.code, 'signup_disabled')
})

test('an ordinary URL has no error, including an article anchor and an empty value', () => {
  assert.equal(readAuthError('', ''), null)
  assert.equal(readAuthError('?next=%2Fvote', '#how-the-count-works'), null)
  assert.equal(readAuthError('?error=', '#error_description=%20'), null)
  assert.deepEqual(readAuthError('?error=access_denied&error_code=', '#error_description=%20'), {
    error: 'access_denied',
    code: null,
    description: null,
  })
})

test('each provider failure gets its own message', () => {
  const kind = (error: string | null, code: string | null, description: string | null) => authErrorKind({ error, code, description })
  assert.equal(kind('access_denied', null, 'The resource owner or authorization server denied the request'), 'cancelled')
  assert.equal(kind('server_error', 'unexpected_failure', 'Error getting user email from external provider'), 'email_unverified')
  assert.equal(kind('server_error', null, 'Unverified email with discord. A confirmation email has been sent to your discord email'), 'email_unverified')
  assert.equal(kind('server_error', 'email_not_confirmed', null), 'email_unverified')
  assert.equal(kind('server_error', 'identity_already_exists', 'Identity is already linked to another user'), 'already_linked')
  assert.equal(kind('invalid_request', null, 'Identity is already linked to another user'), 'already_linked')
  assert.equal(kind('access_denied', 'signup_disabled', 'Signups not allowed for this instance'), 'signups_closed')
  assert.equal(kind('invalid_request', 'manual_linking_disabled', 'Manual linking is disabled'), 'linking_disabled')
  assert.equal(kind('server_error', 'unexpected_failure', 'Something else entirely'), 'unknown')
})

test('the provider text never reaches the page: every message is a fixed string', () => {
  const crafted = { error: 'server_error', code: null, description: 'Your account is suspended, call 555-0100' }
  const text = AUTH_ERROR_TEXT[authErrorKind(crafted)]
  assert.equal(text, AUTH_ERROR_TEXT.unknown)
  assert.ok(!text.includes('555'))
})

test('tidying removes only the error keys and keeps everything else', () => {
  assert.deepEqual(withoutAuthError(REAL_SEARCH, REAL_HASH), { search: '', hash: '' })
  assert.deepEqual(withoutAuthError('?next=%2Fvote&error=access_denied', '#error=access_denied'), { search: '?next=%2Fvote', hash: '' })
  assert.deepEqual(withoutAuthError('?next=%2Fvote', '#how-the-count-works'), { search: '?next=%2Fvote', hash: '#how-the-count-works' })
})
