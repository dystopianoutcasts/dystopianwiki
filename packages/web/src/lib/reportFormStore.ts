/**
 * The "Report a problem" dialog's behavior, with no React and no DOM: what pressing Send,
 * Cancel and Escape do, where focus goes next, and how a hung request ends. ReportDialog.tsx
 * only draws the state and passes events in, so the tests drive this directly.
 *
 * Focus rules:
 * - while sending, focus stays where it is (the Send button; it is aria-disabled, not disabled);
 * - a press with a missing field focuses that field;
 * - after a refusal, focus goes to the message so the reader can fix or retry;
 * - after success, focus goes to the thanks.
 */
import {
  EMPTY_DRAFT,
  INITIAL_SEND_STATE,
  sendReducer,
  validateDraft,
  type ReportDraft,
  type ReportPage,
  type SendOutcome,
  type SendState,
} from './articleReport'

export type FormFocus = 'kind' | 'message' | 'evidence' | 'done'

export interface FormState {
  draft: ReportDraft
  send: SendState
}

export interface FormDeps {
  /** Sends the report; resolves when it is answered, times out or `signal` fires. */
  send(page: ReportPage, draft: ReportDraft, signal: AbortSignal): Promise<SendOutcome>
  page(): ReportPage
  /** Asks the view to move focus once it has drawn the new state. */
  focus(target: FormFocus): void
  /** Closes the dialog. */
  close(): void
}

export function createReportFormStore(deps: FormDeps) {
  let state: FormState = { draft: EMPTY_DRAFT, send: INITIAL_SEND_STATE }
  let inflight: AbortController | null = null
  const listeners = new Set<() => void>()
  const set = (next: FormState) => {
    state = next
    for (const l of listeners) l()
  }

  return {
    getState: (): FormState => state,
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    /** The dialog opens: a clean form, on the section the reader was reading. */
    reset(section: string): void {
      inflight?.abort()
      inflight = null
      set({ draft: { ...EMPTY_DRAFT, section }, send: INITIAL_SEND_STATE })
    },

    change(patch: Partial<ReportDraft>): void {
      set({ draft: { ...state.draft, ...patch }, send: sendReducer(state.send, { type: 'edit' }) })
    },

    async submit(): Promise<void> {
      if (state.send.phase === 'sending' || state.send.phase === 'sent') return
      const draft = state.draft
      const problems = validateDraft(draft)
      set({ draft, send: sendReducer(state.send, { type: 'submit', draft }) })
      if (Object.keys(problems).length > 0) {
        deps.focus(problems.kind ? 'kind' : problems.message ? 'message' : 'evidence')
        return
      }
      const controller = new AbortController()
      inflight = controller
      const outcome = await deps.send(deps.page(), draft, controller.signal)
      // Cancelled or closed meanwhile: the answer, if any, is not wanted.
      if (inflight !== controller || controller.signal.aborted) return
      inflight = null
      set({ draft: state.draft, send: sendReducer(state.send, { type: 'answer', outcome }) })
      deps.focus(outcome.ok ? 'done' : 'message')
    },

    /** The Cancel button: stops a request in flight and closes. */
    cancel(): void {
      inflight?.abort()
      inflight = null
      deps.close()
    },

    /** The dialog closed by Escape or the backdrop (the native dialog closes itself): stop a request in flight. */
    dialogClosed(): void {
      inflight?.abort()
      inflight = null
    },
  }
}

export type ReportFormStore = ReturnType<typeof createReportFormStore>
