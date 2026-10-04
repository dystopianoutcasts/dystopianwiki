/**
 * The admin dashboard's tables (T78), as hook-free views over data the sections load.
 * Each renders through FitTable, so none is ever wider than its panel. The sections in
 * AdminDashboardPage keep the state and the handlers; these only draw.
 */
import { memberRole, type AdminBallot, type Member } from '../../lib/adminDashboard'
import { TILE_STATE_TEXT, type MapRow } from '../../lib/mapPanel'
import type { World } from '../../lib/worldsApi'
import { formatDate, originText } from '../../lib/worldsPanel'
import { FitTable, type FitColumn } from './FitTable'

export function formatWhen(iso: string | null): string {
  if (!iso) return 'Never'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export const nameOfMember = (m: Member) => m.discordUsername ?? m.email ?? 'this account'

export const WORLD_COLUMNS: readonly FitColumn[] = [
  { label: 'World', kind: 'num' },
  { label: 'Status', kind: 'short' },
  { label: 'Detected by', kind: 'text' },
  { label: 'Started', kind: 'text' },
  { label: 'Ended', kind: 'text' },
  { label: 'Note', kind: 'break' },
]

export function WorldsTable({ worlds, labelledBy }: { worlds: readonly World[]; labelledBy: string }) {
  return (
    <FitTable
      labelledBy={labelledBy}
      columns={WORLD_COLUMNS}
      stack="wide"
      rows={worlds.map((w) => ({
        key: w.worldId,
        cells: [w.seq, w.status, originText(w.detectedBy), formatDate(w.startedAt), formatDate(w.endedAt), w.note ?? '-'],
      }))}
    />
  )
}

export const TILE_COLUMNS: readonly FitColumn[] = [
  { label: 'Map', kind: 'break' },
  { label: 'Tiles', kind: 'short' },
]

export function TilesTable({ rows, tilesKnown, labelledBy }: { rows: readonly MapRow[]; tilesKnown: boolean; labelledBy: string }) {
  return (
    <FitTable
      labelledBy={labelledBy}
      columns={TILE_COLUMNS}
      stack="never"
      rows={rows.map((row) => ({ key: row.name, cells: [row.name, tilesKnown ? TILE_STATE_TEXT[row.state] : '-'] }))}
    />
  )
}

export const MEMBER_COLUMNS: readonly FitColumn[] = [
  { label: 'Discord username', kind: 'break' },
  { label: 'Email', kind: 'break' },
  { label: 'Signs in with', kind: 'text' },
  { label: 'Joined', kind: 'text' },
  { label: 'Last sign-in', kind: 'text' },
  { label: 'Role', kind: 'short' },
  { label: 'Change', kind: 'action' },
]

export function MembersTable({
  members,
  selfId,
  onAsk,
  labelledBy,
}: {
  members: readonly Member[]
  selfId: string
  onAsk: (m: Member) => void
  labelledBy: string
}) {
  return (
    <FitTable
      labelledBy={labelledBy}
      columns={MEMBER_COLUMNS}
      stack="wide"
      rows={members.map((m) => ({
        key: m.userId,
        cells: [
          m.discordUsername ?? <span className="admin__none">No Discord</span>,
          m.email ?? '-',
          m.providers.length ? m.providers.join(', ') : '-',
          formatWhen(m.joinedAt),
          formatWhen(m.lastSignInAt),
          memberRole(m),
          m.userId === selfId || m.isSuperadmin ? (
            <span className="admin__none">-</span>
          ) : (
            <button type="button" className="mascot-vote__btn mascot-vote__btn--secondary admin__row-btn" onClick={() => onAsk(m)}>
              {m.isAdmin ? 'Remove admin' : 'Make admin'}
              <span className="sr-only"> ({nameOfMember(m)})</span>
            </button>
          ),
        ],
      }))}
    />
  )
}

export const BALLOT_COLUMNS: readonly FitColumn[] = [
  { label: 'Discord username', kind: 'break' },
  { label: 'Ranking, 1st to last', kind: 'list' },
  { label: 'Cast', kind: 'text' },
  { label: 'Counted', kind: 'short' },
]

export function BallotsTable({
  ballots,
  frozen,
  pending,
  onToggle,
  labelledBy,
}: {
  ballots: readonly AdminBallot[]
  frozen: boolean
  /** The ballot whose Counted change is saving, if any. */
  pending: string | null
  onToggle: (b: AdminBallot) => void
  labelledBy: string
}) {
  return (
    <FitTable
      labelledBy={labelledBy}
      columns={BALLOT_COLUMNS}
      stack="narrow"
      rows={ballots.map((b) => {
        const who = b.discordUsername ?? `Discord id ${b.discordId}`
        return {
          key: b.ballotId,
          className: b.counted ? undefined : 'admin__row--excluded',
          cells: [
            <>
              {b.discordUsername ?? <span className="admin__none">Unknown ({b.discordId})</span>}
              {!b.counted && <span className="mascot-vote__tag">Excluded</span>}
            </>,
            <ol className="admin__ranking">
              {b.rankings.map((id, i) => (
                <li key={id}>
                  <span className="admin__rank">{i + 1}.</span> {id}
                </li>
              ))}
            </ol>,
            formatWhen(b.createdAt),
            <label className="admin__check">
              <input
                type="checkbox"
                checked={b.counted}
                disabled={frozen}
                aria-busy={pending === b.ballotId || undefined}
                onChange={() => onToggle(b)}
              />
              <span className="sr-only">Count the ballot from {who}</span>
            </label>,
          ],
        }
      })}
    />
  )
}
