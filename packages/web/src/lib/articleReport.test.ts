/**
 * Tests for the "Report a problem" rules (articleReport.ts): validation, the live counter, how
 * the database's answer becomes a state, the honeypot, the state machine and the section the
 * reader was in. node:test, run with `npm test` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  EMPTY_DRAFT,
  EVIDENCE_MAX,
  INITIAL_SEND_STATE,
  MESSAGE_MAX,
  REFUSED_TEXT,
  REPORT_KINDS,
  classifyAnswer,
  countChars,
  evidenceCounter,
  isMissingFunction,
  messageCounter,
  reportArgs,
  sectionAtLine,
  sectionChoices,
  sendReducer,
  sendReport,
  senderLine,
  validateDraft,
  type ReportDraft,
  type ReportPage,
  type RpcCall,
  type SendState,
} from './articleReport'

const PAGE: ReportPage = { articleId: 'a1', slug: 'getting-started', title: 'Getting started', url: '/pz/build-42/server/setup/getting-started', version: '2026-11-01T00:00:00Z' }
const GOOD: ReportDraft = { ...EMPTY_DRAFT, kind: 'wrong_fact', message: 'The page says five, the game uses seven.' }

test('the five choices are the five the spec names, in order', () => {
  assert.deepEqual(
    REPORT_KINDS.map((k) => k.label),
    ['A fact is wrong', 'Out of date for the current game version', 'Hard to understand', 'A link or page is broken', 'Something else'],
  )
  assert.deepEqual(REPORT_KINDS.map((k) => k.value), ['wrong_fact', 'out_of_date', 'unclear', 'broken_link', 'other'])
})

test('a draft needs a kind and 10 to 2,000 characters; evidence is optional but capped at 1,000', () => {
  assert.deepEqual(validateDraft(GOOD), {})
  assert.ok(validateDraft({ ...GOOD, kind: '' }).kind)
  assert.ok(validateDraft({ ...GOOD, message: '123456789' }).message)
  assert.equal(validateDraft({ ...GOOD, message: '1234567890' }).message, undefined)
  assert.equal(validateDraft({ ...GOOD, message: 'x'.repeat(MESSAGE_MAX) }).message, undefined)
  assert.ok(validateDraft({ ...GOOD, message: 'x'.repeat(MESSAGE_MAX + 1) }).message)
  assert.equal(validateDraft({ ...GOOD, evidence: 'x'.repeat(EVIDENCE_MAX) }).evidence, undefined)
  assert.ok(validateDraft({ ...GOOD, evidence: 'x'.repeat(EVIDENCE_MAX + 1) }).evidence)
  assert.ok(validateDraft({ ...GOOD, message: 'long enough text' + String.fromCharCode(7) + 'bell' }).message, 'control characters are refused')
  assert.equal(validateDraft({ ...GOOD, message: 'line one' + String.fromCharCode(10, 9) + 'line two is here' }).message, undefined, 'a line break and a tab are fine')
})

test('padding does not count: ten spaces are not ten characters', () => {
  assert.equal(countChars('          '), 0)
  assert.ok(validateDraft({ ...GOOD, message: '          ' }).message)
  assert.equal(countChars(' abc '), 3)
  assert.equal(countChars(String.fromCodePoint(0x1f600)), 1, 'one emoji is one character, as a person counts')
})

test('the live counter shows the count and says why sending is refused', () => {
  assert.equal(messageCounter('').text, '0 of 2,000. At least 10 characters.')
  assert.equal(messageCounter('hello').short, true)
  assert.equal(messageCounter('hello world, ok').text, '15 of 2,000.')
  assert.equal(messageCounter('hello world, ok').short, false)
  assert.match(messageCounter('x'.repeat(2001)).text, /Too long/)
  assert.equal(evidenceCounter('abc').text, '3 of 1,000.')
  assert.match(evidenceCounter('x'.repeat(1001)).text, /Too long/)
})

test('the reader is told "Sent as <name>" or "Sent without your name."', () => {
  assert.equal(senderLine('rp_reader'), 'Sent as rp_reader.')
  assert.equal(senderLine(null), 'Sent without your name.')
})

test('the arguments carry the page, the trimmed text, and NULL for the whole page', () => {
  const a = reportArgs(PAGE, { ...GOOD, message: '  spaced out message here  ', evidence: ' ', section: '' })
  assert.deepEqual(a, {
    p_article_id: 'a1',
    p_article_slug: 'getting-started',
    p_article_version: '2026-11-01T00:00:00Z',
    p_article_title: 'Getting started',
    p_article_url: '/pz/build-42/server/setup/getting-started',
    p_section: null,
    p_kind: 'wrong_fact',
    p_message: 'spaced out message here',
    p_evidence: '',
  })
  assert.equal(reportArgs(PAGE, { ...GOOD, section: 'Setup' }).p_section, 'Setup')
  assert.equal(String(reportArgs({ ...PAGE, title: 'T'.repeat(400) }, GOOD).p_article_title).length, 300)
  assert.equal(Object.keys(reportArgs(PAGE, GOOD)).some((k) => /reporter|user|ip/i.test(k)), false, 'the caller never names the reporter')
})

test('every answer of the database maps to one outcome', () => {
  assert.deepEqual(classifyAnswer('ok', null), { ok: true })
  assert.deepEqual(classifyAnswer('rate_limited', null), { ok: false, reason: 'rate_limited' })
  assert.deepEqual(classifyAnswer('invalid', null), { ok: false, reason: 'invalid' })
  assert.deepEqual(classifyAnswer('something else', null), { ok: false, reason: 'network' })
  assert.deepEqual(classifyAnswer(null, null), { ok: false, reason: 'network' })
  assert.deepEqual(classifyAnswer(null, { message: 'Failed to fetch' }), { ok: false, reason: 'network' })
  assert.deepEqual(classifyAnswer(null, { code: '57014', message: 'timeout' }), { ok: false, reason: 'network' })
})

test('a missing function (migration 048 not applied) is "not switched on yet"', () => {
  for (const error of [
    { code: 'PGRST202', message: 'Could not find the function public.submit_article_report in the schema cache' },
    { code: '42883', message: 'function public.submit_article_report(...) does not exist' },
    { status: 404, message: '' },
    { message: 'Could not find the function public.submit_article_report(p_article_id) in the schema cache' },
  ]) {
    assert.equal(isMissingFunction(error), true, JSON.stringify(error))
    assert.deepEqual(classifyAnswer(null, error), { ok: false, reason: 'not_enabled' })
  }
  assert.equal(isMissingFunction({ code: '42501' }), false)
  assert.equal(isMissingFunction(null), false)
  assert.equal(REFUSED_TEXT.not_enabled, 'Reports are not switched on yet.')
  assert.equal(REFUSED_TEXT.rate_limited, 'Too many reports from you in the last hour. Please try again later.')
  assert.equal(REFUSED_TEXT.network, 'Could not send. Check your connection and try again.')
})

test('sendReport calls submit_article_report once; a missing function, a throw and a rate limit come back as reasons', async () => {
  const calls: string[] = []
  const ok: RpcCall = async (name) => (calls.push(name), { data: 'ok', error: null })
  assert.deepEqual(await sendReport(ok, PAGE, GOOD), { ok: true })
  assert.deepEqual(calls, ['submit_article_report'])

  const missing: RpcCall = async () => ({ data: null, error: { code: 'PGRST202', message: 'Could not find the function' } })
  assert.deepEqual(await sendReport(missing, PAGE, GOOD), { ok: false, reason: 'not_enabled' })

  const limited: RpcCall = async () => ({ data: 'rate_limited', error: null })
  assert.deepEqual(await sendReport(limited, PAGE, GOOD), { ok: false, reason: 'rate_limited' })

  const down: RpcCall = async () => {
    throw new TypeError('Failed to fetch')
  }
  assert.deepEqual(await sendReport(down, PAGE, GOOD), { ok: false, reason: 'network' })
})

test('a filled honeypot shows success and sends nothing', async () => {
  let called = false
  const call: RpcCall = async () => ((called = true), { data: 'ok', error: null })
  assert.deepEqual(await sendReport(call, PAGE, { ...GOOD, honeypot: 'http://spam.example' }), { ok: true })
  assert.equal(called, false)
  assert.deepEqual(await sendReport(call, PAGE, { ...GOOD, honeypot: '   ' }), { ok: true })
  assert.equal(called, true, 'blank spaces are not a filled trap')
})

test('state machine: idle -> sending -> sent, and each refusal keeps the reader able to try again', () => {
  let s: SendState = INITIAL_SEND_STATE
  s = sendReducer(s, { type: 'submit', draft: { ...GOOD, message: 'short' } })
  assert.equal(s.phase, 'idle')
  assert.ok(s.phase === 'idle' && s.problems.message, 'the refusal names the field')
  s = sendReducer(s, { type: 'edit' })
  assert.deepEqual(s, INITIAL_SEND_STATE)

  s = sendReducer(s, { type: 'submit', draft: GOOD })
  assert.deepEqual(s, { phase: 'sending' })
  assert.deepEqual(sendReducer(s, { type: 'submit', draft: GOOD }), { phase: 'sending' }, 'a second press while sending changes nothing')
  assert.deepEqual(sendReducer(s, { type: 'edit' }), { phase: 'sending' })

  const sent = sendReducer(s, { type: 'answer', outcome: { ok: true } })
  assert.deepEqual(sent, { phase: 'sent' })
  assert.deepEqual(sendReducer(sent, { type: 'submit', draft: GOOD }), { phase: 'sent' }, 'sent stays sent')
  assert.deepEqual(sendReducer(sent, { type: 'answer', outcome: { ok: false, reason: 'network' } }), { phase: 'sent' })

  for (const reason of ['rate_limited', 'not_enabled', 'network', 'invalid'] as const) {
    const refused = sendReducer(s, { type: 'answer', outcome: { ok: false, reason } })
    assert.deepEqual(refused, { phase: 'refused', reason })
    assert.deepEqual(sendReducer(refused, { type: 'submit', draft: GOOD }), { phase: 'sending' }, `${reason}: sending again is allowed`)
    assert.deepEqual(sendReducer(refused, { type: 'edit' }), INITIAL_SEND_STATE)
  }
  assert.deepEqual(sendReducer(INITIAL_SEND_STATE, { type: 'answer', outcome: { ok: true } }), INITIAL_SEND_STATE, 'an answer nobody asked for is ignored')
  assert.deepEqual(sendReducer(sent, { type: 'reset' }), INITIAL_SEND_STATE, 'opening the dialog again starts clean')
})

test('the section the reader is in is the last heading at or above the reading line', () => {
  const tops = [
    { text: 'Intro', top: -400 },
    { text: 'Setup', top: -20 },
    { text: 'Commands', top: 300 },
  ]
  assert.equal(sectionAtLine(tops, 120), 'Setup')
  assert.equal(sectionAtLine(tops, 500), 'Commands')
  assert.equal(sectionAtLine([{ text: 'Intro', top: 200 }], 120), '', 'above the first heading: the whole page')
  assert.equal(sectionAtLine([], 120), '')
})

test('the part choices are the article headings (levels 2 to 4), once each, in order', () => {
  assert.deepEqual(
    sectionChoices([
      { id: 'a', text: 'Title', level: 1 },
      { id: 'b', text: 'Setup', level: 2 },
      { id: 'c', text: ' Setup ', level: 3 },
      { id: 'd', text: 'Commands', level: 3 },
      { id: 'e', text: 'Deep', level: 5 },
      { id: 'f', text: '', level: 2 },
    ]),
    ['Setup', 'Commands'],
  )
})
