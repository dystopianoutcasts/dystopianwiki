/**
 * The admin Reports section's behavior, with no React and no DOM: the filter and list, opening
 * a report, saving its status and note, and deleting it behind a question. ReportsSection.tsx
 * only draws the state and passes events in; the tests drive this directly.
 *
 * Focus rules (asked of the view through `focus`, which runs after it has drawn):
 * - the delete question opens with focus on Keep;
 * - Keep returns focus to the Delete report button;
 * - after a delete, focus lands on the "Report deleted." line.
 * Read and archive: marking read is always an explicit click (opening a report never does it).
 * After one of those actions the list refreshes quietly (no "Loading" flash) and focus lands on
 * the confirming line ("Marked as read.", or "Archived. ... Undo"), so a keyboard user is not
 * dropped to the top of the page.
 * A save or a delete that takes over 15 s fails as a network error and leaves the dialog usable;
 * Close (or Escape) during one cancels it.
 */
import {
  ARCHIVE_FILTER,
  DEFAULT_FILTER,
  type AdminReport,
  type BoxCounts,
  type ReportBox,
  type ReportFilter,
  type ReportStatus,
  type ReportsApi,
  type ReportsFailure,
} from './articleReportsAdmin'

export type AdminFocus = 'keep' | 'deleteButton' | 'flash'

export type Load = { state: 'loading' } | { state: 'error'; reason: ReportsFailure } | { state: 'ready'; reports: AdminReport[] }
export type SaveNote = { kind: 'saved' } | { kind: 'error'; reason: ReportsFailure } | null

export interface ReportsState {
  box: ReportBox
  filter: ReportFilter
  load: Load
  /** Unread inbox reports: the tab badge. */
  newCount: number | null
  /** The Inbox / Archive switch's numbers; null while unknown. */
  counts: BoxCounts | null
  /** Set right after Archive, so the line "Archived. It is in Archive, not deleted." can offer Undo. */
  undo: { id: string; title: string } | null
  /** Why the last read or archive action was refused, in the section (the dialog shows it too). */
  actionError: ReportsFailure | null
  /** A read or archive call is running. */
  acting: boolean
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
    box: 'inbox',
    filter: DEFAULT_FILTER,
    load: { state: 'loading' },
    newCount: null,
    counts: null,
    undo: null,
    actionError: null,
    acting: false,
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

  /** `quiet`: keep the list on screen while it refreshes (after an action), instead of "Loading". */
  async function reload(quiet = false): Promise<void> {
    const seq = ++loadSeq
    if (!(quiet && state.load.state === 'ready')) set({ load: { state: 'loading' } })
    const [list, count, counts] = await Promise.all([api.fetchReports(state.filter, state.box), api.fetchNewCount(), api.fetchBoxCounts()])
    if (seq !== loadSeq) return
    set({
      load: list.ok ? { state: 'ready', reports: list.value } : { state: 'error', reason: list.reason },
      newCount: count.ok ? count.value : null,
      counts: counts.ok ? counts.value : null,
    })
  }

  /** One read or archive call: refuse a second while one runs, say why on a refusal, refresh quietly after. */
  async function act(call: () => Promise<{ ok: true } | { ok: false; reason: ReportsFailure }>, done: () => Partial<ReportsState>): Promise<boolean> {
    if (state.acting) return false
    set({ acting: true, actionError: null })
    const r = await call()
    if (!r.ok) {
      set({ acting: false, actionError: r.reason === 'cancelled' ? null : r.reason })
      return false
    }
    set({ acting: false, ...done() })
    await reload(true)
    focus('flash')
    return true
  }

  return {
    getState: (): ReportsState => state,
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    reload,

    setFilter(filter: ReportFilter): Promise<void> {
      set({ filter, flash: null, undo: null, actionError: null })
      return reload()
    },

    /** The Inbox / Archive switch. The inbox starts on New, the archive on All. */
    setBox(box: ReportBox): Promise<void> {
      if (box === state.box) return Promise.resolve()
      set({ box, filter: box === 'archived' ? ARCHIVE_FILTER : DEFAULT_FILTER, flash: null, undo: null, actionError: null, open: null, confirming: false })
      return reload()
    },

    /** Mark one report read or unread. Opening a report never calls this. */
    async markRead(r: AdminReport, read: boolean): Promise<void> {
      const when = now()
      await act(
        () => api.markRead(r.id, read),
        () => ({
          flash: read ? 'Marked as read.' : 'Marked as unread.',
          undo: null,
          ...(state.open?.id === r.id ? { open: { ...state.open, readAt: read ? when : null } } : {}),
        }),
      )
    },

    /** Mark every unread report now shown as read. */
    async markAllRead(): Promise<void> {
      if (state.load.state !== 'ready') return
      const ids = state.load.reports.filter((r) => r.readAt === null).map((r) => r.id)
      if (ids.length === 0) return
      await act(
        () => api.markAllRead(ids),
        () => ({ flash: ids.length === 1 ? 'Marked 1 report as read.' : `Marked ${ids.length} reports as read.`, undo: null }),
      )
    },

    /** Put a report away. It leaves the inbox at once; the section offers Undo. Never a delete. */
    async archive(r: AdminReport): Promise<void> {
      await act(
        () => api.archiveReport(r.id, true),
        () => ({ open: state.open?.id === r.id ? null : state.open, flash: null, undo: { id: r.id, title: r.title } }),
      )
    },

    /** Move a report from the archive back to the inbox. */
    async moveBack(r: AdminReport): Promise<void> {
      await act(
        () => api.archiveReport(r.id, false),
        () => ({ open: state.open?.id === r.id ? null : state.open, flash: 'Moved back to inbox.', undo: null }),
      )
    },

    /** The Undo button after Archive. */
    async undoArchive(): Promise<void> {
      const u = state.undo
      if (!u) return
      await act(
        () => api.archiveReport(u.id, false),
        () => ({ flash: 'Moved back to inbox.', undo: null }),
      )
    },

    openReport(r: AdminReport): void {
      set({ open: r, status: r.status, note: r.adminNote, saveNote: null, actionError: null, confirming: false, deleteError: null, saving: false, deleting: false })
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
      set({ open: null, confirming: false, flash: 'Report deleted.', undo: null })
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
