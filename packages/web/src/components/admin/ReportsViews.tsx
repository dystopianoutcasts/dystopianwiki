/**
 * The admin dashboard's Reports section, as hook-free views (migration 048,
 * docs/planning/REPORT-FORM-SPEC.md J2 to J4). ReportsSection.tsx keeps the state and the calls.
 *
 * What a reader typed is shown as text only: React escapes it, and nothing here renders it as
 * HTML or Markdown. The page link opens the article in a new tab.
 */
import {
  REPORT_FILTERS,
  REPORT_STATUSES,
  deleteQuestion,
  formatDay,
  formatVersion,
  reporterText,
  reviewedLine,
  snippet,
  statusLabel,
  type AdminReport,
  type ReportFilter,
  type ReportStatus,
} from '../../lib/articleReportsAdmin'
import { kindLabel } from '../../lib/articleReport'
import { FitTable, type FitColumn } from './FitTable'
import { formatWhen } from './AdminTables'

export function ReportFiltersView({ value, onPick, labelId }: { value: ReportFilter; onPick: (f: ReportFilter) => void; labelId: string }) {
  return (
    <div className="admin__reports-filters" role="group" aria-labelledby={labelId}>
      {REPORT_FILTERS.map((f) => (
        <button
          key={f.value}
          type="button"
          className={`mascot-vote__btn admin__row-btn ${f.value === value ? 'mascot-vote__btn--primary' : 'mascot-vote__btn--secondary'}`}
          aria-pressed={f.value === value}
          onClick={() => onPick(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export const REPORT_COLUMNS: readonly FitColumn[] = [
  { label: 'Status', kind: 'short' },
  { label: 'What is wrong', kind: 'text' },
  { label: 'Page', kind: 'break' },
  { label: 'Part', kind: 'text' },
  { label: 'Message', kind: 'text' },
  { label: 'Sent', kind: 'text' },
  { label: 'From', kind: 'break' },
  { label: 'Open', kind: 'action' },
]

/** The link to the reported page: the site path, a new tab, and a hidden note saying so. */
export function PageLink({ report }: { report: Pick<AdminReport, 'url' | 'title'> }) {
  return (
    <a href={report.url} target="_blank" rel="noopener noreferrer">
      {report.title}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

export function ReportsTable({ reports, onOpen, labelledBy }: { reports: readonly AdminReport[]; onOpen: (r: AdminReport) => void; labelledBy: string }) {
  return (
    <FitTable
      labelledBy={labelledBy}
      columns={REPORT_COLUMNS}
      stack="wide"
      rows={reports.map((r) => ({
        key: r.id,
        cells: [
          statusLabel(r.status),
          kindLabel(r.kind),
          <PageLink key="page" report={r} />,
          r.section ?? 'Whole page',
          snippet(r.message),
          formatDay(r.createdAt),
          reporterText(r),
          <button key="open" type="button" className="mascot-vote__btn mascot-vote__btn--secondary admin__row-btn" onClick={() => onOpen(r)}>
            Open
            <span className="sr-only"> the report about {r.title}</span>
          </button>,
        ],
      }))}
    />
  )
}

export type SaveNote = { kind: 'saved' } | { kind: 'error'; text: string } | null

export interface ReportDetailProps {
  report: AdminReport
  ids: { title: string; status: string; note: string }
  status: ReportStatus
  note: string
  saving: boolean
  saveNote: SaveNote
  confirming: boolean
  deleting: boolean
  deleteError: string | null
  onStatus: (s: ReportStatus) => void
  onNote: (n: string) => void
  onSave: () => void
  onClose: () => void
  onAskDelete: () => void
  onKeep: () => void
  onDelete: () => void
}

/** One report in full: the text, the status and note to edit, and the Delete button in plain sight. */
export function ReportDetailView(p: ReportDetailProps) {
  const { report } = p
  if (p.confirming) {
    return (
      <div className="admin__report-detail">
        <h2 id={p.ids.title} className="mascot-dialog__title">
          Delete this report?
        </h2>
        <p>{deleteQuestion(report, formatDay)}</p>
        <p className="mascot-vote__hint">This cannot be undone.</p>
        {p.deleteError && (
          <p className="mascot-vote__notice" role="alert">
            {p.deleteError}
          </p>
        )}
        <div className="mascot-dialog__actions">
          <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary" disabled={p.deleting} onClick={p.onKeep}>
            Keep
          </button>
          <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" disabled={p.deleting} onClick={p.onDelete}>
            {p.deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="admin__report-detail">
      <h2 id={p.ids.title} className="mascot-dialog__title">
        Report: {kindLabel(report.kind)}
      </h2>
      <dl className="admin__report-facts">
        <dt>Page</dt>
        <dd>
          <PageLink report={report} />
          <br />
          <code>{report.url}</code>
        </dd>
        <dt>Part</dt>
        <dd>{report.section ?? 'The whole page'}</dd>
        <dt>Sent</dt>
        <dd>
          {formatWhen(report.createdAt)} by {reporterText(report)}
        </dd>
        <dt>Article version the reader saw</dt>
        <dd>{report.version ? formatVersion(report.version) : 'Not recorded'}</dd>
      </dl>

      <h3 className="admin__subtitle">What the reader wrote</h3>
      <p className="admin__report-text">{report.message}</p>
      <h3 className="admin__subtitle">How they know</h3>
      <p className="admin__report-text">{report.evidence || 'Nothing was added.'}</p>

      <h3 className="admin__subtitle">Review</h3>
      <div className="admin__filter">
        <label htmlFor={p.ids.status}>Status</label>
        <select id={p.ids.status} value={p.status} disabled={p.saving} onChange={(e) => p.onStatus(e.target.value as ReportStatus)}>
          {REPORT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="admin__filter">
        <label htmlFor={p.ids.note}>Admin note (only admins see it)</label>
        <textarea id={p.ids.note} className="admin__textarea" rows={3} maxLength={2000} value={p.note} disabled={p.saving} onChange={(e) => p.onNote(e.target.value)} />
      </div>
      <p className="mascot-vote__meta">{reviewedLine(report, formatWhen)}</p>

      <div aria-live="polite">
        {p.saveNote?.kind === 'saved' && <p className="mascot-vote__hint">Saved</p>}
        {p.saveNote?.kind === 'error' && (
          <p className="mascot-vote__notice" role="alert">
            Not saved: {p.saveNote.text}
          </p>
        )}
      </div>

      <div className="admin__report-actions">
        <button type="button" className="mascot-vote__btn mascot-vote__btn--primary" disabled={p.saving} onClick={p.onSave}>
          {p.saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary" disabled={p.saving} onClick={p.onAskDelete}>
          Delete report
        </button>
        <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary" disabled={p.saving} onClick={p.onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
