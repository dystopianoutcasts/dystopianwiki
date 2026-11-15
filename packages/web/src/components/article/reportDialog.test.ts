/**
 * Render tests for the "Report a problem" form (ReportDialogView.tsx), through the hook-free
 * staticMarkup helper, plus source checks for the parts that use hooks and the router
 * (ReportDialog.tsx, WikiArticle.tsx). The spec's job J1 is the checklist.
 * node:test, run with `npm test` from packages/web.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { createElement } from 'react'
import { staticMarkup } from '../landing/staticMarkup'
import { EMPTY_DRAFT, REFUSED_TEXT, type ReportDraft, type SendState } from '../../lib/articleReport'
import { ReportFormView, ReportProblemButton, reportIds, type ReportFormProps } from './ReportDialogView'

const SRC = fileURLToPath(new URL('../../', import.meta.url))
const code = (rel: string) => readFileSync(join(SRC, rel), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const ids = reportIds('r')
const base: ReportFormProps = {
  ids,
  pageTitle: 'Getting started',
  draft: EMPTY_DRAFT,
  state: { phase: 'idle', problems: {} },
  sections: ['Setup', 'Commands'],
  sender: null,
  onChange: () => {},
  onSubmit: () => {},
  onCancel: () => {},
  onClose: () => {},
}
const form = (patch: Partial<ReportFormProps> = {}) => staticMarkup(createElement(ReportFormView, { ...base, ...patch }))
const withState = (state: SendState, draft: ReportDraft = EMPTY_DRAFT) => form({ state, draft })

test('J1.1: both buttons say "Report a problem with this page"; one is a small text button, one a full button', () => {
  const link = staticMarkup(createElement(ReportProblemButton, { variant: 'link', onOpen: () => {} }))
  const block = staticMarkup(createElement(ReportProblemButton, { variant: 'block', onOpen: () => {} }))
  assert.match(link, /<button type="button" class="report-open report-open--link">Report a problem with this page<\/button>/)
  assert.match(block, /<button type="button" class="report-open report-open--block">Report a problem with this page<\/button>/)
})

test('the pinned bug icon: a round button whose own text says the same words, the icon hidden from screen readers', () => {
  const float = staticMarkup(createElement(ReportProblemButton, { variant: 'float', onOpen: () => {} }))
  assert.match(float, /^<button type="button" class="report-open report-open--float"><svg class="icon report-open__icon"[^>]*aria-hidden="true"/)
  assert.match(float, /<span class="report-open__tip">Report a problem with this page<\/span><\/button>$/)
  assert.doesNotMatch(float, /aria-label/, 'the visible words are the name; no second label to drift from them')
  const css = readFileSync(join(SRC, 'styles/components/report-dialog.css'), 'utf8')
  assert.match(css, /\.report-open--float \{[^}]*position: fixed;[^}]*right: [^;]*;[^}]*bottom: [^;]*;[^}]*width: 56px;[^}]*height: 56px/)
  assert.match(css, /\.report-open--float:hover \.report-open__tip,\s*\.report-open--float:focus-visible \.report-open__tip \{[^}]*opacity: 1/, 'the words show on hover and on keyboard focus')
  assert.doesNotMatch(css, /\.report-open__tip \{[^}]*display: none/, 'hidden by opacity only, so screen readers still say it')
})

test('J1.1: the button is on every article page, under the title and at the end, and one dialog serves both', () => {
  const src = code('components/wiki/WikiArticle.tsx')
  assert.equal(src.match(/<ReportProblemButton variant="link"/g)?.length, 1)
  assert.equal(src.match(/<ReportProblemButton variant="block"/g)?.length, 1)
  assert.equal(src.match(/<ReportProblemButton variant="float"/g)?.length, 1)
  assert.equal(src.match(/<ReportDialog$/gm)?.length, 1)
  assert.ok(src.indexOf('variant="link"') < src.indexOf('wiki-article__content'), 'the first button is above the content')
  assert.ok(src.indexOf('variant="block"') > src.indexOf('wiki-article__content'), 'the second is below it')
  assert.ok(src.indexOf('variant="block"') < src.indexOf('wiki-article__footer'), 'and before the footer navigation')
  assert.match(src, /sections=\{reportSections\.choices\}/)
  // ArticlePage renders every article page through WikiArticle.
  assert.match(code('pages/ArticlePage.tsx'), /<WikiArticle/)
})

test('J1.2: the dialog is titled "Report a problem" and names the page', () => {
  const html = form()
  assert.match(html, /<h2 id="r-title" class="report-dialog__title">Report a problem<\/h2>/)
  assert.match(html, /On: <strong>Getting started<\/strong>/)
})

test('J1.3: five labeled radio choices, none picked at first; the picked one is checked', () => {
  const html = form()
  const radios = [...html.matchAll(/<label class="report-radio"><input ([^>]*)><\/input><span>([^<]*)<\/span><\/label>/g)]
  assert.deepEqual(
    radios.map((m) => m[2]),
    ['A fact is wrong', 'Out of date for the current game version', 'Hard to understand', 'A link or page is broken', 'Something else'],
  )
  assert.ok(radios.every((m) => /type="radio"/.test(m[1]) && !/checked="true"/.test(m[1])))
  assert.match(html, /<legend class="report-label">What's wrong\? <span class="report-required">\(required\)<\/span><\/legend>/)
  const picked = form({ draft: { ...EMPTY_DRAFT, kind: 'unclear' } })
  assert.equal(picked.match(/checked="true"/g)?.length, 1)
  assert.match(picked, /value="unclear" checked="true"/)
})

test('J1.4: "Which part?" lists the headings after "The whole page" and is optional', () => {
  const html = form()
  assert.match(html, /<label htmlFor="r-section" class="report-label">Which part\? <span class="report-optional">\(optional\)<\/span><\/label>/)
  assert.match(html, /<option value="">The whole page<\/option><option value="Setup">Setup<\/option><option value="Commands">Commands<\/option>/)
  assert.match(form({ draft: { ...EMPTY_DRAFT, section: 'Commands' } }), /<select [^>]*value="Commands"/)
})

test('J1.5: the message box is labeled, required, and has a live counter that says why sending is refused', () => {
  const html = form()
  assert.match(html, /<label htmlFor="r-message" class="report-label">What did you spot, and what should it say instead\?/)
  assert.match(html, /<textarea id="r-message"[^>]*aria-describedby="r-message-hint"/)
  assert.match(html, /<p id="r-message-hint" class="report-hint report-hint--warn">0 of 2,000\. At least 10 characters\.<\/p>/)
  const ok = form({ draft: { ...EMPTY_DRAFT, message: 'It says five, it is seven.' } })
  assert.match(ok, /<p id="r-message-hint" class="report-hint">26 of 2,000\.<\/p>/)
})

test('J1.6: the evidence box is labeled optional with its own limit', () => {
  const html = form()
  assert.match(html, /<label htmlFor="r-evidence" class="report-label">How did you find out\? <span class="report-optional">\(optional\)<\/span><\/label>/)
  assert.match(html, /Your game version, something you tried in game, or a file and line from the game's code\. Fine to skip\. 0 of 1,000\./)
})

test('J1.7: the note, and who the report comes from: the signed-in name, or without a name', () => {
  assert.match(form(), /The wiki team reads every report\. Please leave out passwords and personal info\. You're not signed in, so this goes in without a name\. That's fine too\./)
  assert.match(form({ sender: 'rp_reader' }), /Please leave out passwords and personal info\. You're signed in as rp_reader, so we'll know who to thank\./)
})

test('J1.8: Send report is the main button and Cancel is beside it', () => {
  const html = form()
  assert.match(html, /<button type="button" class="report-btn report-btn--secondary">Cancel<\/button>/)
  assert.match(html, /<button type="submit" class="report-btn report-btn--primary">Send report<\/button>/)
})

test('J1.9: while sending the button reads "Sending..." and is aria-disabled (it keeps focus); Cancel stays available and says what it does', () => {
  const html = withState({ phase: 'sending' })
  assert.match(html, /<button type="submit" class="report-btn report-btn--primary" aria-disabled="true">Sending\.\.\.<\/button>/)
  assert.doesNotMatch(html, /<button type="submit"[^>]*[^-]disabled=/, 'a disabled Send would drop keyboard focus to the page behind the dialog')
  assert.match(html, /<button type="button" class="report-btn report-btn--secondary">Cancel sending<\/button>/)
  assert.match(html, /<textarea id="r-message"[^>]*disabled="true"/)
})

test('J1.9: on success the dialog shows the thanks and a Close button, and no form', () => {
  const html = withState({ phase: 'sent' })
  assert.match(html, /Thanks, we got it! A real person on the wiki team reads every report and checks the page\./)
  assert.match(html, />Close<\/button>/)
  assert.doesNotMatch(html, /<textarea|<form|Send report/)
})

test('J1.10: each failure says why in words, and keeps what the reader typed', () => {
  const draft: ReportDraft = { ...EMPTY_DRAFT, kind: 'wrong_fact', message: 'It says five, it is seven.', evidence: 'Build 42.13' }
  for (const reason of ['rate_limited', 'not_enabled', 'network', 'invalid'] as const) {
    const html = withState({ phase: 'refused', reason }, draft)
    assert.ok(html.includes(REFUSED_TEXT[reason]), reason)
    assert.match(html, /role="alert"/)
    assert.match(html, /It says five, it is seven\./, `${reason}: the message is kept`)
    assert.match(html, /Build 42\.13/, `${reason}: the evidence is kept`)
    assert.match(html, /value="wrong_fact" checked="true"/, `${reason}: the choice is kept`)
    assert.match(html, />Send report<\/button>/, `${reason}: the reader can try again`)
  }
  assert.equal(REFUSED_TEXT.not_enabled, 'Reports are not switched on yet.')
  assert.match(withState({ phase: 'refused', reason: 'not_enabled' }, draft), /Reports are not switched on yet\./)
})

test('a press with a missing field names the problem next to the field and in an alert, and marks the field invalid', () => {
  const html = withState({ phase: 'idle', problems: { kind: "Pick what's wrong.", message: 'Write at least 10 characters about what you saw.' } })
  assert.match(html, /<p id="r-kind-error" class="report-error" role="alert">Pick what's wrong\.<\/p>/)
  assert.match(html, /<p id="r-message-error" class="report-error" role="alert">Write at least 10 characters about what you saw\.<\/p>/)
  assert.match(html, /<textarea id="r-message"[^>]*aria-describedby="r-message-hint r-message-error"[^>]*aria-invalid="true"/)
  assert.match(html, /<fieldset id="r-kind" class="report-fieldset" aria-describedby="r-kind-error" aria-invalid="true">/)
  assert.doesNotMatch(form(), /role="alert"/, 'a clean form has no alert')
})

test('the honeypot is out of sight and the tab order, hidden from screen readers, and empty by default', () => {
  const html = form()
  assert.match(html, /<div class="report-trap" aria-hidden="true">/)
  assert.match(html, /<input type="text" name="q7_trap" tabindex="-1" autoComplete="off" value=""/i)
  assert.doesNotMatch(html, /name="(website|url|email|phone|name)"/, 'a name browsers autofill would drop a real report')
  const css = readFileSync(join(SRC, 'styles/components/report-dialog.css'), 'utf8')
  assert.match(css, /\.report-trap \{[^}]*position: absolute;[^}]*left: -10000px/)
  assert.doesNotMatch(css, /\.report-trap \{[^}]*display: none/)
})

test('the user text is never rendered as HTML: the form has no dangerouslySetInnerHTML', () => {
  for (const f of ['components/article/ReportDialogView.tsx', 'components/article/ReportDialog.tsx', 'components/admin/ReportsViews.tsx', 'components/admin/ReportsSection.tsx']) {
    assert.doesNotMatch(code(f), /dangerouslySetInnerHTML|innerHTML/, f)
  }
})

test('the dialog stays inside a 360 px screen: it is at most 94 vw wide, scrolls itself, and the buttons stack', () => {
  const css = readFileSync(join(SRC, 'styles/components/report-dialog.css'), 'utf8')
  assert.match(css, /\.report-dialog \{[^}]*width: min\(94vw, 600px\)/)
  assert.match(css, /\.report-dialog \{[^}]*overflow: auto/)
  assert.match(css, /\.report-actions \{[^}]*flex-direction: column-reverse/)
  assert.match(css, /\.report-btn \{[^}]*min-height: 48px/)
  assert.match(css, /\.report-radio \{[^}]*min-height: 44px/)
})
