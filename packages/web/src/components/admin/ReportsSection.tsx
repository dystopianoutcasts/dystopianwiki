/**
 * The Reports section of the admin dashboard (migration 048, spec J2 to J4): the count of new
 * reports in its heading, a status filter (New by default), the list, and one report opened in a
 * dialog where an admin sets its status and note, or deletes it (asked by name first).
 *
 * The database is the gate: the functions return nothing to anyone but an admin. Before
 * migration 048 is applied the section says so instead of showing an empty list.
 */
import { useCallback, useEffect, useId, useState } from 'react'
import { MascotDialog } from '../mascot/MascotDialog'
import { reportsApi } from '../../lib/articleReportsClient'
import {
  DEFAULT_FILTER,
  EMPTY_TEXT,
  REPORTS_FAILURE_TEXT,
  sectionLabel,
  type AdminReport,
  type ReportFilter,
  type ReportStatus,
  type ReportsApi,
  type ReportsFailure,
} from '../../lib/articleReportsAdmin'
import { ReportDetailView, ReportFiltersView, ReportsTable, type SaveNote } from './ReportsViews'

type Load = { state: 'loading' } | { state: 'error'; reason: ReportsFailure } | { state: 'ready'; reports: AdminReport[] }

export function ReportsSection({ api = reportsApi }: { api?: ReportsApi }) {
  const [filter, setFilter] = useState<ReportFilter>(DEFAULT_FILTER)
  const [load, setLoad] = useState<Load>({ state: 'loading' })
  const [newCount, setNewCount] = useState<number | null>(null)
  const [key, setKey] = useState(0)
  const [flash, setFlash] = useState<string | null>(null)
  const [open, setOpen] = useState<AdminReport | null>(null)
  const [status, setStatus] = useState<ReportStatus>('new')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveNote, setSaveNote] = useState<SaveNote>(null)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const headingId = useId()
  const filterLabelId = useId()
  const ids = { title: useId(), status: useId(), note: useId() }

  const reload = useCallback(() => setKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoad({ state: 'loading' })
    void api.fetchReports(filter).then((r) => {
      if (!cancelled) setLoad(r.ok ? { state: 'ready', reports: r.value } : { state: 'error', reason: r.reason })
    })
    void api.fetchNewCount().then((r) => {
      if (!cancelled) setNewCount(r.ok ? r.value : null)
    })
    return () => {
      cancelled = true
    }
  }, [api, filter, key])

  const openReport = (r: AdminReport) => {
    setOpen(r)
    setStatus(r.status)
    setNote(r.adminNote)
    setSaveNote(null)
    setConfirming(false)
    setDeleteError(null)
  }

  const closeReport = () => {
    if (saving || deleting) return
    setOpen(null)
    setConfirming(false)
  }

  const save = async () => {
    if (!open || saving) return
    setSaving(true)
    setSaveNote(null)
    const r = await api.updateReport(open.id, status, note)
    setSaving(false)
    if (!r.ok) {
      setSaveNote({ kind: 'error', text: REPORTS_FAILURE_TEXT[r.reason] })
      return
    }
    setSaveNote({ kind: 'saved' })
    setFlash(null)
    // The open copy follows what was saved, so "last changed" and the fields agree with the list.
    setOpen({
      ...open,
      status,
      adminNote: note.trim(),
      ...(status !== open.status ? { reviewedByName: 'you', reviewedAt: new Date().toISOString() } : {}),
    })
    reload()
  }

  const remove = async () => {
    if (!open || deleting) return
    setDeleting(true)
    setDeleteError(null)
    const r = await api.deleteReport(open.id)
    setDeleting(false)
    if (!r.ok) {
      setDeleteError(REPORTS_FAILURE_TEXT[r.reason])
      return
    }
    setOpen(null)
    setConfirming(false)
    setFlash('Report deleted.')
    reload()
  }

  return (
    <section className="mascot-vote__panel" aria-labelledby={headingId}>
      <h2 id={headingId} className="mascot-vote__panel-title">
        {sectionLabel(newCount)}
      </h2>
      <p>Problems readers reported on wiki pages. Open one to read it, set its status or delete it.</p>

      <p id={filterLabelId} className="mascot-vote__meta">
        Show
      </p>
      <ReportFiltersView
        value={filter}
        labelId={filterLabelId}
        onPick={(f) => {
          setFilter(f)
          setFlash(null)
        }}
      />

      {flash && (
        <p className="mascot-vote__hint" role="status">
          {flash}
        </p>
      )}
      {load.state === 'loading' && <p role="status">Loading reports...</p>}
      {load.state === 'error' && (
        <>
          <p role="alert">{REPORTS_FAILURE_TEXT[load.reason]}</p>
          {load.reason !== 'missing' && (
            <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" onClick={reload}>
              Try again
            </button>
          )}
        </>
      )}
      {load.state === 'ready' &&
        (load.reports.length === 0 ? (
          <p>{EMPTY_TEXT[filter]}</p>
        ) : (
          <ReportsTable reports={load.reports} onOpen={openReport} labelledBy={headingId} />
        ))}

      <MascotDialog open={open !== null} onClose={closeReport} labelledBy={ids.title} locked={saving || deleting} className="admin__report-dialog">
        {open && (
          <ReportDetailView
            report={open}
            ids={ids}
            status={status}
            note={note}
            saving={saving}
            saveNote={saveNote}
            confirming={confirming}
            deleting={deleting}
            deleteError={deleteError}
            onStatus={(s) => {
              setStatus(s)
              setSaveNote(null)
            }}
            onNote={(n) => {
              setNote(n)
              setSaveNote(null)
            }}
            onSave={() => void save()}
            onClose={closeReport}
            onAskDelete={() => {
              setDeleteError(null)
              setConfirming(true)
            }}
            onKeep={() => setConfirming(false)}
            onDelete={() => void remove()}
          />
        )}
      </MascotDialog>
    </section>
  )
}
