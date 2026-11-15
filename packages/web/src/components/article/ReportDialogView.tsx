/**
 * The "Report a problem" form, as hook-free views (spec: docs/planning/REPORT-FORM-SPEC.md).
 * ReportDialog.tsx owns the state and the call; these only draw, so the tests can render them.
 *
 * Every field has a visible label, every refusal is said in words next to the field and in a
 * live region, and the main button is always enabled: a press with a missing field says what to
 * fix and moves focus there, instead of leaving a dead button.
 */
import type { ChangeEvent, FormEvent } from 'react'
import {
  EVIDENCE_MAX,
  MESSAGE_MAX,
  REFUSED_TEXT,
  REPORT_KINDS,
  WHOLE_PAGE,
  evidenceCounter,
  messageCounter,
  senderLine,
  type ReportDraft,
  type SendState,
} from '../../lib/articleReport'

/** The ids the form uses, so the container can move focus to a refused field. */
export function reportIds(prefix: string) {
  return {
    title: `${prefix}-title`,
    kind: `${prefix}-kind`,
    kindError: `${prefix}-kind-error`,
    section: `${prefix}-section`,
    message: `${prefix}-message`,
    messageHint: `${prefix}-message-hint`,
    messageError: `${prefix}-message-error`,
    evidence: `${prefix}-evidence`,
    evidenceHint: `${prefix}-evidence-hint`,
    evidenceError: `${prefix}-evidence-error`,
    note: `${prefix}-note`,
    done: `${prefix}-done`,
    live: `${prefix}-live`,
  }
}

export type ReportIds = ReturnType<typeof reportIds>

/** The button that opens the dialog. Both placements say the same words. */
export function ReportProblemButton({
  onOpen,
  variant,
}: {
  onOpen: () => void
  /** link: the small text button under the title; block: the one at the end of the article */
  variant: 'link' | 'block'
}) {
  return (
    <button type="button" className={`report-open report-open--${variant}`} onClick={onOpen}>
      Report a problem with this page
    </button>
  )
}

export interface ReportFormProps {
  ids: ReportIds
  pageTitle: string
  draft: ReportDraft
  state: SendState
  sections: readonly string[]
  /** The signed-in name, or null when signed out. */
  sender: string | null
  onChange: (patch: Partial<ReportDraft>) => void
  onSubmit: () => void
  onCancel: () => void
  onClose: () => void
}

export function ReportFormView(props: ReportFormProps) {
  const { state } = props
  if (state.phase === 'sent') return <ReportSentView ids={props.ids} onClose={props.onClose} />
  return <ReportFields {...props} />
}

function ReportSentView({ ids, onClose }: { ids: ReportIds; onClose: () => void }) {
  return (
    <div className="report-done">
      <h2 id={ids.title} className="report-dialog__title">
        Report sent
      </h2>
      <p id={ids.done} className="report-done__text" tabIndex={-1} role="status">
        Thanks, your report was sent. We review every report by hand.
      </p>
      <div className="report-actions">
        <button type="button" className="report-btn report-btn--primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

function ReportFields({ ids, pageTitle, draft, state, sections, sender, onChange, onSubmit, onCancel }: ReportFormProps) {
  const problems = state.phase === 'idle' ? state.problems : {}
  const sending = state.phase === 'sending'
  const counter = messageCounter(draft.message)
  const evidence = evidenceCounter(draft.evidence)
  const messageDescribedBy = [ids.messageHint, problems.message ? ids.messageError : ''].filter(Boolean).join(' ')

  return (
    <form
      className="report-form"
      noValidate
      onSubmit={(e: FormEvent) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <h2 id={ids.title} className="report-dialog__title">
        Report a problem
      </h2>
      <p className="report-form__page">
        On: <strong>{pageTitle}</strong>
      </p>

      <fieldset
        id={ids.kind}
        className="report-fieldset"
        aria-describedby={problems.kind ? ids.kindError : undefined}
        aria-invalid={problems.kind ? true : undefined}
      >
        <legend className="report-label">
          What is wrong? <span className="report-required">(required)</span>
        </legend>
        {REPORT_KINDS.map((k) => (
          <label key={k.value} className="report-radio">
            <input
              type="radio"
              name={`${ids.kind}-kind`}
              value={k.value}
              checked={draft.kind === k.value}
              disabled={sending}
              onChange={() => onChange({ kind: k.value })}
            />
            <span>{k.label}</span>
          </label>
        ))}
        {problems.kind && (
          <p id={ids.kindError} className="report-error" role="alert">
            {problems.kind}
          </p>
        )}
      </fieldset>

      <div className="report-field">
        <label htmlFor={ids.section} className="report-label">
          Which part? <span className="report-optional">(optional)</span>
        </label>
        <select
          id={ids.section}
          className="report-input"
          value={draft.section}
          disabled={sending}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange({ section: e.target.value })}
        >
          <option value={WHOLE_PAGE}>The whole page</option>
          {sections.map((s, i) => (
            <option key={`${i}-${s}`} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="report-field">
        <label htmlFor={ids.message} className="report-label">
          What did you see, and what should it say? <span className="report-required">(required)</span>
        </label>
        <textarea
          id={ids.message}
          className="report-input report-textarea"
          rows={5}
          value={draft.message}
          disabled={sending}
          maxLength={MESSAGE_MAX + 200}
          aria-describedby={messageDescribedBy}
          aria-invalid={problems.message ? true : undefined}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange({ message: e.target.value })}
        />
        <p id={ids.messageHint} className={`report-hint${counter.short || counter.over ? ' report-hint--warn' : ''}`}>
          {counter.text}
        </p>
        {problems.message && (
          <p id={ids.messageError} className="report-error" role="alert">
            {problems.message}
          </p>
        )}
      </div>

      <div className="report-field">
        <label htmlFor={ids.evidence} className="report-label">
          How do you know? <span className="report-optional">(optional)</span>
        </label>
        <textarea
          id={ids.evidence}
          className="report-input report-textarea"
          rows={2}
          value={draft.evidence}
          disabled={sending}
          maxLength={EVIDENCE_MAX + 200}
          aria-describedby={[ids.evidenceHint, problems.evidence ? ids.evidenceError : ''].filter(Boolean).join(' ')}
          aria-invalid={problems.evidence ? true : undefined}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange({ evidence: e.target.value })}
        />
        <p id={ids.evidenceHint} className={`report-hint${evidence.over ? ' report-hint--warn' : ''}`}>
          A game version, a file and line, or a test you ran. {evidence.text}
        </p>
        {problems.evidence && (
          <p id={ids.evidenceError} className="report-error" role="alert">
            {problems.evidence}
          </p>
        )}
      </div>

      {/* A trap for scripts: people never see it, reach it with Tab or hear it read. */}
      <div className="report-trap" aria-hidden="true">
        <label>
          Leave this field empty
          <input type="text" name="q7_trap" tabIndex={-1} autoComplete="off" value={draft.honeypot} onChange={(e) => onChange({ honeypot: e.target.value })} />
        </label>
      </div>

      <p id={ids.note} className="report-note">
        Reports are read by the wiki team. Do not include passwords or personal details. {senderLine(sender)}
      </p>

      <div id={ids.live} className="report-live" aria-live="polite">
        {sending && <p className="report-status">Sending...</p>}
        {state.phase === 'refused' && (
          <p className="report-error report-error--box" role="alert">
            {REFUSED_TEXT[state.reason]} Your text is still here.
          </p>
        )}
      </div>

      <div className="report-actions">
        <button type="button" className="report-btn report-btn--secondary" onClick={onCancel}>
          {sending ? 'Cancel sending' : 'Cancel'}
        </button>
        {/* aria-disabled, not disabled: a disabled button drops keyboard focus to the page behind the dialog. */}
        <button type="submit" className="report-btn report-btn--primary" aria-disabled={sending ? true : undefined}>
          {sending ? 'Sending...' : 'Send report'}
        </button>
      </div>
    </form>
  )
}
