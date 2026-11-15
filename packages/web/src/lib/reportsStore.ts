/**
 * The admin Reports section's behavior, with no React and no DOM: the filter and list, opening
 * a report, saving its status and note, and deleting it behind a question. ReportsSection.tsx
 * only draws the state and passes events in; the tests drive this directly.
 *
 * Focus rules (asked of the view through `focus`, which runs after it has drawn):
 * - the delete question opens with focus on Keep;
 * - Keep returns focus to the Delete report button;
 * - after a delete, focus lands on the "Report deleted." line.
 * A save or a delete that takes over 15 s fails as a network error and leaves the dialog usable;
 * Close (or Escape) during one cancels it.
 */
import {
  DEFAULT_FILTER,
  type AdminReport,
  type ReportFilter,
  type ReportStatus,
  type ReportsApi,
  type ReportsFailure,
} from './articleReportsAdmin'

export type AdminFocus = 'keep' | 'deleteButton' | 'flash'

export type Load = { state: 'loading' } | { state: 'error'; reason: ReportsFailure } | { state: 'ready'; reports: AdminReport[] }
export type SaveNote = { kind: 'saved' } | { kind: 'error'; reason: ReportsFailure } | null

export interface ReportsState {
  filter: ReportFilter
  load: Load
  newCount: number | null
  flash: string | null
  open: AdminReport | null
  status: ReportStatus
  note: string
  saving: boolean
  saveNote: SaveNote
  confirming: boolean
  deleting: boolean
  deleteError: ReportsFailure | null
}

export function createReportsStore(api: ReportsApi, focus: (target: AdminFocus) => void, now: () => string = () => new Date().toISOString()) {
  let state: ReportsState = {
    filter: DEFAULT_FILTER,
    load: { state: 'loading' },
    newCount: null,
    flash: null,
    open: null,
    status: 'new',
    note: '',
    saving: false,
    saveNote: null,
    confirming: false,
    deleting: false,
    deleteError: null,
  }
  let inflight: AbortController | null = null
  let loadSeq = 0
  const listeners = new Set<() => void>()
  const set = (patch: Partial<ReportsState>) => {
    state = { ...state, ...patch }
    for (const l of listeners) l()
  }

  async function reload(): Promise<void> {
    const seq = ++loadSeq
    set({ load: { state: 'loading' } })
    const [list, count] = await Promise.all([api.fetchReports(state.filter), api.fetchNewCount()])
    if (seq !== loadSeq) return
    set({ load: list.ok ? { state: 'ready', reports: list.value } : { state: 'error', reason: list.reason }, newCount: count.ok ? count.value : null })
  }

  return {
    getState: (): ReportsState => state,
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    reload,

    setFilter(filter: ReportFilter): Promise<void> {
      set({ filter, flash: null })
      return reload()
    },

    openReport(r: AdminReport): void {
      set({ open: r, status: r.status, note: r.adminNote, saveNote: null, confirming: false, deleteError: null, saving: false, deleting: false })
    },

    setStatus(status: ReportStatus): void {
      set({ status, saveNote: null })
    },
    setNote(note: string): void {
      set({ note, saveNote: null })
    },

    async save(): Promise<void> {
      const open = state.open
      if (!open || state.saving) return
      const status = state.status
      const note = state.note
      const controller = new AbortController()
      inflight = controller
      set({ saving: true, saveNote: null })
      const r = await api.updateReport(open.id, status, note, controller.signal)
      if (inflight !== controller) return // closed meanwhile
      inflight = null
      set({ saving: false })
      if (!r.ok) {
        if (r.reason !== 'cancelled') set({ saveNote: { kind: 'error', reason: r.reason } })
        return
      }
      const when = now()
      const statusChanged = status !== open.status
      const noteChanged = note.trim() !== open.adminNote
      set({
        saveNote: { kind: 'saved' },
        flash: null,
        open: {
          ...open,
          status,
          adminNote: note.trim(),
          ...(statusChanged ? { reviewedByName: 'you', reviewedAt: when } : {}),
          ...(noteChanged ? { noteUpdatedByName: 'you', noteUpdatedAt: when } : {}),
        },
      })
      void reload()
    },

    askDelete(): void {
      set({ confirming: true, deleteError: null })
      focus('keep')
    },

    keep(): void {
      // Keep while a delete is running cancels it.
      inflight?.abort()
      inflight = null
      set({ confirming: false, deleting: false })
      focus('deleteButton')
    },

    async remove(): Promise<void> {
      const open = state.open
      if (!open || state.deleting) return
      const controller = new AbortController()
      inflight = controller
      set({ deleting: true, deleteError: null })
      const r = await api.deleteReport(open.id, controller.signal)
      if (inflight !== controller) return
      inflight = null
      set({ deleting: false })
      if (!r.ok) {
        if (r.reason !== 'cancelled') set({ deleteError: r.reason })
        return
      }
      set({ open: null, confirming: false, flash: 'Report deleted.' })
      await reload()
      focus('flash')
    },

    /** Close, or Escape: cancels a save or delete still running. */
    close(): void {
      inflight?.abort()
      inflight = null
      set({ open: null, confirming: false, saving: false, deleting: false })
    },
  }
}

export type ReportsStore = ReturnType<typeof createReportsStore>
