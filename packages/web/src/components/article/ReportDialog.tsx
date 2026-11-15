/**
 * The "Report a problem" dialog (docs/planning/REPORT-FORM-SPEC.md). Native <dialog> through
 * MascotDialog: everything behind it is inert, Escape closes it (not while sending), and focus
 * goes back to the button that opened it.
 *
 * State lives here so Escape and the backdrop can be locked while a report is going out. The
 * words and layout are in ReportDialogView.tsx; the rules and the state machine are in
 * lib/articleReport.ts.
 */
import { useCallback, useEffect, useId, useReducer, useState } from 'react'
import { MascotDialog } from '../mascot/MascotDialog'
import { useAuth } from '../../context/AuthContext'
import {
  EMPTY_DRAFT,
  INITIAL_SEND_STATE,
  sectionAtLine,
  sendReducer,
  validateDraft,
  type ReportDraft,
  type ReportPage,
} from '../../lib/articleReport'
import { submitArticleReport } from '../../lib/articleReportApi'
import { ReportFormView, reportIds } from './ReportDialogView'
import '../../styles/components/report-dialog.css'

interface ReportDialogProps {
  open: boolean
  onClose: () => void
  page: ReportPage
  /** The article's section headings, in page order, as text. */
  sections: readonly string[]
  /** Heading element ids in the same order, to find where the reader is. */
  sectionIds: readonly string[]
}

/** The heading the reader is in right now, or the whole page when none has been passed. */
function readingSection(sections: readonly string[], sectionIds: readonly string[]): string {
  if (typeof document === 'undefined') return ''
  const tops = sections.flatMap((text, i) => {
    const el = document.getElementById(sectionIds[i] ?? '')
    return el ? [{ text, top: el.getBoundingClientRect().top }] : []
  })
  return sectionAtLine(tops, 120)
}

export function ReportDialog({ open, onClose, page, sections, sectionIds }: ReportDialogProps) {
  const { user } = useAuth()
  const ids = reportIds(useId())
  const [draft, setDraft] = useState<ReportDraft>(EMPTY_DRAFT)
  const [state, dispatch] = useReducer(sendReducer, INITIAL_SEND_STATE)

  // Each time the dialog opens: a clean form, on the section the reader was reading.
  useEffect(() => {
    if (!open) return
    setDraft({ ...EMPTY_DRAFT, section: readingSection(sections, sectionIds) })
    dispatch({ type: 'reset' })
    // Only the opening matters; the page's headings do not change while it is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // After a send, focus moves to the thanks, because the form it was on has gone.
  useEffect(() => {
    if (state.phase === 'sent') document.getElementById(ids.done)?.focus()
  }, [state.phase, ids.done])

  // A refusal is said right above the buttons; on a small screen make sure it is in view.
  useEffect(() => {
    if (state.phase === 'refused') document.getElementById(ids.live)?.scrollIntoView({ block: 'nearest' })
  }, [state.phase, ids.live])

  const change = useCallback((patch: Partial<ReportDraft>) => {
    setDraft((d) => ({ ...d, ...patch }))
    dispatch({ type: 'edit' })
  }, [])

  const submit = async () => {
    if (state.phase === 'sending') return
    const problems = validateDraft(draft)
    dispatch({ type: 'submit', draft })
    if (Object.keys(problems).length > 0) {
      // Focus the first refused field so a keyboard or screen reader user lands on it.
      const target = problems.kind ? ids.kind : problems.message ? ids.message : ids.evidence
      window.setTimeout(() => {
        const el = document.getElementById(target)
        const focusable = el?.matches('fieldset') ? el.querySelector<HTMLElement>('input') : el
        focusable?.focus()
      }, 0)
      return
    }
    const outcome = await submitArticleReport(page, draft)
    dispatch({ type: 'answer', outcome })
  }

  const meta = user?.user_metadata as { username?: unknown } | undefined
  const sender = user ? (typeof meta?.username === 'string' && meta.username.trim() ? meta.username.trim() : 'your account') : null

  return (
    <MascotDialog open={open} onClose={onClose} labelledBy={ids.title} locked={state.phase === 'sending'} className="report-dialog">
      <ReportFormView
        ids={ids}
        pageTitle={page.title}
        draft={draft}
        state={state}
        sections={sections}
        sender={sender}
        onChange={change}
        onSubmit={() => void submit()}
        onCancel={onClose}
        onClose={onClose}
      />
    </MascotDialog>
  )
}
