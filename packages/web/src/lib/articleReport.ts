/**
 * "Report a problem" (migration 048, docs/planning/REPORT-FORM-SPEC.md): the reader's side.
 *
 * Pure logic with no network and no React: the choices, the validation, how the database's
 * answer becomes a state the dialog shows, and the state machine. The dialog
 * (components/article/ReportDialog.tsx) and the call (articleReportApi.ts) use it, and the tests
 * run it directly.
 */

export const REPORT_KINDS = [
  { value: 'wrong_fact', label: 'A fact is wrong' },
  { value: 'out_of_date', label: 'Out of date for the current game version' },
  { value: 'unclear', label: 'Hard to understand' },
  { value: 'broken_link', label: 'A link or page is broken' },
  { value: 'other', label: 'Something else' },
] as const

export type ReportKind = (typeof REPORT_KINDS)[number]['value']

export const MESSAGE_MIN = 10
export const MESSAGE_MAX = 2000
export const EVIDENCE_MAX = 1000
/** The option that means no heading in particular. */
export const WHOLE_PAGE = ''

export function kindLabel(kind: string): string {
  return REPORT_KINDS.find((k) => k.value === kind)?.label ?? kind
}

export interface ReportDraft {
  kind: ReportKind | ''
  /** A heading's text, or WHOLE_PAGE. */
  section: string
  message: string
  evidence: string
  /** The hidden trap field. A person leaves it empty. */
  honeypot: string
}

export const EMPTY_DRAFT: ReportDraft = { kind: '', section: WHOLE_PAGE, message: '', evidence: '', honeypot: '' }

/** The page being reported, as the database wants it. */
export interface ReportPage {
  articleId: string
  slug: string
  title: string
  /** The site path, such as /pz/build-42/server/setup/getting-started. */
  url: string
  /** The article's last_updated as the reader saw it. */
  version: string
}

/** The words a person gets for a refused field, keyed by field. */
export interface DraftProblems {
  kind?: string
  message?: string
  evidence?: string
}

/** Characters as a person counts them (an emoji is one), trimmed the way the database trims. */
export function countChars(text: string): number {
  return Array.from(text.trim()).length
}

export function validateDraft(draft: ReportDraft): DraftProblems {
  const problems: DraftProblems = {}
  if (!REPORT_KINDS.some((k) => k.value === draft.kind)) problems.kind = 'Pick what is wrong.'
  const n = countChars(draft.message)
  if (n < MESSAGE_MIN) problems.message = `Write at least ${MESSAGE_MIN} characters about what you saw.`
  else if (n > MESSAGE_MAX) problems.message = `Shorten this to ${MESSAGE_MAX} characters or fewer.`
  if (countChars(draft.evidence) > EVIDENCE_MAX) problems.evidence = `Shorten this to ${EVIDENCE_MAX} characters or fewer.`
  // The database refuses control characters other than a line break and a tab.
  if (hasControlCharacters(draft.message)) problems.message = 'Remove the unusual characters from this text.'
  if (hasControlCharacters(draft.evidence)) problems.evidence = 'Remove the unusual characters from this text.'
  return problems
}

export function hasControlCharacters(text: string): boolean {
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0
    if ((code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 127) return true
  }
  return false
}

/** The live counter beside the message box: the count, and why sending would be refused. */
export function messageCounter(text: string): { text: string; short: boolean; over: boolean } {
  const n = countChars(text)
  const short = n < MESSAGE_MIN
  const over = n > MESSAGE_MAX
  const count = `${n.toLocaleString('en-US')} of ${MESSAGE_MAX.toLocaleString('en-US')}`
  if (short) return { text: `${count}. At least ${MESSAGE_MIN} characters.`, short, over }
  if (over) return { text: `${count}. Too long: shorten it.`, short, over }
  return { text: `${count}.`, short, over }
}

export function evidenceCounter(text: string): { text: string; over: boolean } {
  const n = countChars(text)
  const over = n > EVIDENCE_MAX
  return { text: `${n.toLocaleString('en-US')} of ${EVIDENCE_MAX.toLocaleString('en-US')}.${over ? ' Too long: shorten it.' : ''}`, over }
}

// ---------------------------------------------------------------------------
// What the database said
// ---------------------------------------------------------------------------

/** Why a send did not go through. */
export type RefusedReason = 'rate_limited' | 'not_enabled' | 'network' | 'invalid'

export type SendOutcome = { ok: true } | { ok: false; reason: RefusedReason }

export const REFUSED_TEXT: Readonly<Record<RefusedReason, string>> = {
  rate_limited: 'Too many reports from you in the last hour. Please try again later.',
  not_enabled: 'Reports are not switched on yet.',
  network: 'Could not send. Check your connection and try again.',
  invalid: 'The wiki could not accept that report. Check what you wrote and try again.',
}

type RpcError = { code?: unknown; message?: unknown; status?: unknown } | null | undefined

/**
 * A missing function is "not switched on": PostgREST answers PGRST202 (or a 404) when the
 * function is not in its schema cache, and Postgres itself 42883 (undefined_function).
 */
export function isMissingFunction(error: RpcError): boolean {
  if (!error) return false
  if (error.code === 'PGRST202' || error.code === '42883') return true
  if (error.status === 404) return true
  const message = typeof error.message === 'string' ? error.message : ''
  return /could not find the function|schema cache|function .* does not exist/i.test(message)
}

/** Turns the answer of submit_article_report into an outcome. Never throws. */
export function classifyAnswer(data: unknown, error: RpcError): SendOutcome {
  if (error) return { ok: false, reason: isMissingFunction(error) ? 'not_enabled' : 'network' }
  if (data === 'ok') return { ok: true }
  if (data === 'rate_limited') return { ok: false, reason: 'rate_limited' }
  if (data === 'invalid') return { ok: false, reason: 'invalid' }
  // Anything else is an answer this page does not know: treat it as a failure to send.
  return { ok: false, reason: 'network' }
}

export type RpcCall = (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: RpcError }>

/** The arguments of submit_article_report. The reader's text is trimmed; empty optional fields are empty strings. */
export function reportArgs(page: ReportPage, draft: ReportDraft): Record<string, unknown> {
  return {
    p_article_id: page.articleId,
    p_article_slug: page.slug,
    p_article_version: page.version.slice(0, 40),
    p_article_title: Array.from(page.title.trim()).slice(0, 300).join(''),
    p_article_url: page.url,
    p_section: draft.section === WHOLE_PAGE ? null : Array.from(draft.section.trim()).slice(0, 200).join(''),
    p_kind: draft.kind,
    p_message: draft.message.trim(),
    p_evidence: draft.evidence.trim(),
  }
}

/**
 * Sends a report through `call`. A filled honeypot gets the success answer without anything
 * being sent. A call that throws is a network failure.
 */
export async function sendReport(call: RpcCall, page: ReportPage, draft: ReportDraft): Promise<SendOutcome> {
  if (draft.honeypot.trim() !== '') return { ok: true }
  try {
    const { data, error } = await call('submit_article_report', reportArgs(page, draft))
    return classifyAnswer(data, error)
  } catch {
    return { ok: false, reason: 'network' }
  }
}

// ---------------------------------------------------------------------------
// The dialog's state machine
// ---------------------------------------------------------------------------

export type SendState =
  | { phase: 'idle'; problems: DraftProblems }
  | { phase: 'sending' }
  | { phase: 'sent' }
  | { phase: 'refused'; reason: RefusedReason }

export type SendAction =
  | { type: 'submit'; draft: ReportDraft }
  | { type: 'answer'; outcome: SendOutcome }
  | { type: 'edit' }
  | { type: 'reset' }

export const INITIAL_SEND_STATE: SendState = { phase: 'idle', problems: {} }

/**
 * idle -> sending when the draft is valid (otherwise idle with the problems named);
 * sending -> sent or refused with the answer; refused -> idle again when the reader edits, and
 * a second submit is allowed from refused; reset (the dialog opening again) starts over. A submit while sending, or after sent, changes nothing.
 */
export function sendReducer(state: SendState, action: SendAction): SendState {
  switch (action.type) {
    case 'submit': {
      if (state.phase === 'sending' || state.phase === 'sent') return state
      const problems = validateDraft(action.draft)
      return Object.keys(problems).length > 0 ? { phase: 'idle', problems } : { phase: 'sending' }
    }
    case 'answer':
      if (state.phase !== 'sending') return state
      return action.outcome.ok ? { phase: 'sent' } : { phase: 'refused', reason: action.outcome.reason }
    case 'reset':
      return INITIAL_SEND_STATE
    case 'edit':
      return state.phase === 'refused' || (state.phase === 'idle' && Object.keys(state.problems).length > 0)
        ? { phase: 'idle', problems: {} }
        : state
  }
}

// ---------------------------------------------------------------------------
// The section the reader was reading
// ---------------------------------------------------------------------------

/**
 * The heading the reader is in: the last one whose top edge is at or above `line` (a few
 * pixels below the top of the window). `tops` are the headings in page order. Returns the text,
 * or WHOLE_PAGE when no heading has been passed.
 */
export function sectionAtLine(tops: readonly { text: string; top: number }[], line: number): string {
  let found = WHOLE_PAGE
  for (const h of tops) {
    if (h.top <= line) found = h.text
    else break
  }
  return found
}

/** The headings a reader can point at: levels 2 to 4, in page order, without repeats. */
export function sectionChoices(items: readonly { id: string; text: string; level: number }[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of items) {
    const text = item.text.trim()
    if (item.level < 2 || item.level > 4 || !text || seen.has(text)) continue
    seen.add(text)
    out.push(text)
  }
  return out
}

/** "Sent as <name>" or "Sent without your name." */
export function senderLine(username: string | null): string {
  return username ? `Sent as ${username}.` : 'Sent without your name.'
}
