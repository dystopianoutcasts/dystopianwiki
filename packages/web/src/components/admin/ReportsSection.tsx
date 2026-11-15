/**
 * The Reports section of the admin dashboard (migration 048, spec J2 to J4): the count of new
 * reports in its heading, a status filter (New by default), the list, and one report opened in a
 * dialog where an admin sets its status and note, or deletes it (asked by name first).
 *
 * This file only connects things: the behavior (filters, save, delete, a hung request, where
 * focus goes next) is in lib/reportsStore.ts, the words in lib/articleReportsAdmin.ts, the
 * layout in ReportsViews.tsx. The database is the gate: its functions return nothing to anyone
 * but an admin. Before migration 048 is applied the section says so.
 */
import { useEffect, useId, useMemo, useSyncExternalStore } from 'react'
import { MascotDialog } from '../mascot/MascotDialog'
import { reportsApi } from '../../lib/articleReportsClient'
import { EMPTY_TEXT, REPORTS_FAILURE_TEXT, sectionLabel, type AdminReport, type ReportsApi } from '../../lib/articleReportsAdmin'
import { createReportsStore, type AdminFocus } from '../../lib/reportsStore'
import { MarkAllView, ReportBoxView, ReportDetailView, ReportFiltersView, ReportsTable, type SaveNote } from './ReportsViews'

export function ReportsSection({
  api = reportsApi,
  onNewCount,
}: {
  api?: ReportsApi
  /** Told the count of new reports each time it is fetched, so the dashboard's Reports tab keeps it current. */
  onNewCount?: (count: number) => void
}) {
  const headingId = useId()
  const filterLabelId = useId()
  const boxLabelId = useId()
  const titleId = useId()
  const statusId = useId()
  const noteId = useId()
  const keepId = useId()
  const deleteId = useId()
  const flashId = useId()

  const store = useMemo(
    () =>
      createReportsStore(api, (target: AdminFocus) =>
        window.setTimeout(() => document.getElementById(target === 'keep' ? keepId : target === 'deleteButton' ? deleteId : flashId)?.focus(), 0),
      ),
    [api, keepId, deleteId, flashId],
  )
  const s = useSyncExternalStore(store.subscribe, store.getState)

  useEffect(() => {
    void store.reload()
  }, [store])

  useEffect(() => {
    if (s.newCount !== null) onNewCount?.(s.newCount)
  }, [s.newCount, onNewCount])

  const saveNote: SaveNote = s.saveNote?.kind === 'error' ? { kind: 'error', text: REPORTS_FAILURE_TEXT[s.saveNote.reason] } : s.saveNote

  return (
    <section className="mascot-vote__panel" aria-labelledby={headingId}>
      <h2 id={headingId} className="mascot-vote__panel-title">
        {sectionLabel(s.newCount)}
      </h2>
      <p>
        Problems readers reported on wiki pages. Open one to read it and set its status. Mark a report as read when you have looked
        at it, and archive it to put it away: an archived report is kept, and you can move it back to the inbox.
      </p>

      <p id={boxLabelId} className="mascot-vote__meta">
        Box
      </p>
      <ReportBoxView value={s.box} counts={s.counts} labelId={boxLabelId} onPick={(b) => void store.setBox(b)} />

      <p id={filterLabelId} className="mascot-vote__meta">
        Show
      </p>
      <ReportFiltersView value={s.filter} labelId={filterLabelId} onPick={(f) => void store.setFilter(f)} />

      {s.flash && (
        <p id={flashId} className="mascot-vote__hint" role="status" tabIndex={-1}>
          {s.flash}
        </p>
      )}
      {s.undo && (
        <p id={flashId} className="mascot-vote__hint" role="status" tabIndex={-1}>
          Archived. It is in Archive, not deleted.{' '}
          <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary admin__row-btn" disabled={s.acting} onClick={() => void store.undoArchive()}>
            Undo
          </button>
        </p>
      )}
      {s.actionError && s.open === null && (
        <p className="mascot-vote__notice" role="alert">
          {REPORTS_FAILURE_TEXT[s.actionError]}
        </p>
      )}
      {s.load.state === 'loading' && <p role="status">Loading reports...</p>}
      {s.load.state === 'error' && (
        <>
          <p role="alert">{REPORTS_FAILURE_TEXT[s.load.reason]}</p>
          {s.load.reason !== 'missing' && (
            <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" onClick={() => void store.reload()}>
              Try again
            </button>
          )}
        </>
      )}
      {s.load.state === 'ready' &&
        (s.load.reports.length === 0 ? (
          <p>{s.box === 'archived' ? (s.filter === 'all' ? 'The archive is empty.' : 'No archived reports match this status.') : EMPTY_TEXT[s.filter]}</p>
        ) : (
          <>
            <MarkAllView reports={s.load.reports} acting={s.acting} onMarkAll={() => void store.markAllRead()} />
            <ReportsTable
              reports={s.load.reports}
              box={s.box}
              acting={s.acting}
              onOpen={(r) => store.openReport(r)}
              onRead={(r, read) => void store.markRead(r, read)}
              onArchive={(r) => void store.archive(r)}
              onMoveBack={(r) => void store.moveBack(r)}
              labelledBy={headingId}
            />
          </>
        ))}

      <MascotDialog open={s.open !== null} onClose={() => store.close()} labelledBy={titleId} className="admin__report-dialog">
        {s.open && (
          <ReportDetailView
            report={s.open}
            ids={{ title: titleId, status: statusId, note: noteId, keep: keepId, deleteButton: deleteId }}
            status={s.status}
            note={s.note}
            saving={s.saving}
            saveNote={saveNote}
            confirming={s.confirming}
            deleting={s.deleting}
            deleteError={s.deleteError ? REPORTS_FAILURE_TEXT[s.deleteError] : null}
            acting={s.acting}
            actionError={s.actionError ? REPORTS_FAILURE_TEXT[s.actionError] : null}
            onToggleRead={() => void store.markRead(s.open as AdminReport, s.open?.readAt === null)}
            onArchive={() => void store.archive(s.open as AdminReport)}
            onMoveBack={() => void store.moveBack(s.open as AdminReport)}
            onStatus={(v) => store.setStatus(v)}
            onNote={(n) => store.setNote(n)}
            onSave={() => void store.save()}
            onClose={() => store.close()}
            onAskDelete={() => store.askDelete()}
            onKeep={() => store.keep()}
            onDelete={() => void store.remove()}
          />
        )}
      </MascotDialog>
    </section>
  )
}
