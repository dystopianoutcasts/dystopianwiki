/**
 * The "Report a problem" dialog (docs/planning/REPORT-FORM-SPEC.md). Native <dialog> through
 * MascotDialog: everything behind it is inert, Escape closes it, and focus goes back to the
 * button that opened it.
 *
 * This file only connects things: the behavior (Send, Cancel, Escape, a hung request, where
 * focus goes next) is in lib/reportFormStore.ts, the rules and words in lib/articleReport.ts,
 * the layout in ReportDialogView.tsx. Escape and Cancel stay available while a report is going
 * out; either one stops the request.
 */
import { useEffect, useId, useMemo, useRef, useSyncExternalStore } from 'react'
import { MascotDialog } from '../mascot/MascotDialog'
import { useAuth } from '../../context/AuthContext'
import { sectionAtLine, type ReportDraft, type ReportPage } from '../../lib/articleReport'
import { submitArticleReport } from '../../lib/articleReportApi'
import { createReportFormStore, type FormFocus } from '../../lib/reportFormStore'
import { ReportFormView, reportIds, type ReportIds } from './ReportDialogView'
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

/** Moves focus once React has drawn the state the focus belongs to. */
function focusAfterDraw(ids: ReportIds, target: FormFocus, afterRefusal: boolean): void {
  window.setTimeout(() => {
    if (target === 'done') {
      document.getElementById(ids.done)?.focus()
    } else if (target === 'kind') {
      document.getElementById(ids.kind)?.querySelector<HTMLElement>('input')?.focus()
    } else {
      // After a refusal the refusal text is scrolled into view instead, so focusing must not scroll away from it.
      document.getElementById(target === 'message' ? ids.message : ids.evidence)?.focus({ preventScroll: afterRefusal })
      if (afterRefusal) document.getElementById(ids.live)?.scrollIntoView({ block: 'nearest' })
    }
  }, 0)
}

export function ReportDialog({ open, onClose, page, sections, sectionIds }: ReportDialogProps) {
  const { user } = useAuth()
  const prefix = useId()
  const ids = useMemo(() => reportIds(prefix), [prefix])
  const pageRef = useRef(page)
  pageRef.current = page
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  const store = useMemo(
    () => {
      const s = createReportFormStore({
        send: (p, d, signal) => submitArticleReport(p, d, signal),
        page: () => pageRef.current,
        focus: (target) => focusAfterDraw(ids, target, s.getState().send.phase === 'refused'),
        close: () => closeRef.current(),
      })
      return s
    },
    [ids],
  )
  const { draft, send } = useSyncExternalStore(store.subscribe, store.getState)

  // Each time the dialog opens: a clean form, on the section the reader was reading.
  useEffect(() => {
    if (open) store.reset(readingSection(sections, sectionIds))
    // Only the opening matters; the page's headings do not change while it is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const meta = user?.user_metadata as { username?: unknown } | undefined
  const sender = user ? (typeof meta?.username === 'string' && meta.username.trim() ? meta.username.trim() : 'your account') : null

  return (
    <MascotDialog
      open={open}
      onClose={() => {
        store.dialogClosed()
        onClose()
      }}
      labelledBy={ids.title}
      className="report-dialog"
    >
      <ReportFormView
        ids={ids}
        pageTitle={page.title}
        draft={draft as ReportDraft}
        state={send}
        sections={sections}
        sender={sender}
        onChange={(patch) => store.change(patch)}
        onSubmit={() => void store.submit()}
        onCancel={() => store.cancel()}
        onClose={onClose}
      />
    </MascotDialog>
  )
}
