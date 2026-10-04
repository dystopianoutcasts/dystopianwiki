import { MASCOT_ENTRIES } from '../../data/mascotEntries'
import { roundNote } from '../../lib/mascotVoteLogic'
import type { CountResult } from '../../lib/rankedChoice'
import { FitTable, type FitColumn } from '../admin/FitTable'

const CAPTION =
  'Ballots counted for each entry in each round. A dash means the entry had already been eliminated. ' +
  'Exhausted ballots have no choice left in the race.'

/**
 * The round-by-round table (one column per round, one row per entry, plus Exhausted and
 * Total) and a note per round. Used by the public results and the admin dashboard.
 */
export function RoundTable({
  result,
  labelledBy,
  nameOf,
  winnerLabel = 'Winner',
  fit = false,
}: {
  result: CountResult
  /** id of the heading above the table */
  labelledBy: string
  nameOf: (id: string) => string
  /** The tag on the entry that wins the count; the dashboard says "Leading" while voting is open. */
  winnerLabel?: string
  /**
   * The admin dashboard's variant (T78): never wider than its panel, stacked per entry on a
   * narrow panel, no scroll region. The public page leaves it off and keeps its scrolling table.
   */
  fit?: boolean
}) {
  const notes = (
    <ol className="mascot-vote__notes">
      {result.rounds.map((r) => (
        <li key={r.round}>
          <strong>Round {r.round}.</strong> {roundNote(r, nameOf, result.winner)}
        </li>
      ))}
    </ol>
  )
  if (fit) {
    const columns: FitColumn[] = [
      { label: 'Entry', kind: 'break' },
      ...result.rounds.map((r): FitColumn => ({ label: `Round ${r.round}`, kind: 'num' })),
    ]
    const rows = [
      ...MASCOT_ENTRIES.map((entry) => ({
        key: entry.id,
        className: result.winner?.id === entry.id ? 'mascot-vote__row--winner' : undefined,
        cells: [
          <>
            {nameOf(entry.id)}
            {result.winner?.id === entry.id && <span className="mascot-vote__tag">{winnerLabel}</span>}
          </>,
          ...result.rounds.map((r) => {
            const votes = r.votes[entry.id]
            return votes === undefined ? (
              <span className="mascot-vote__cell--out">
                <span aria-hidden="true">-</span>
                <span className="sr-only">eliminated</span>
              </span>
            ) : (
              votes
            )
          }),
        ],
      })),
      { key: 'exhausted', className: 'mascot-vote__row--sum', cells: ['Exhausted', ...result.rounds.map((r) => r.exhausted)] },
      { key: 'total', className: 'mascot-vote__row--sum', cells: ['Total', ...result.rounds.map(() => result.totalBallots)] },
    ]
    return (
      <>
        <FitTable labelledBy={labelledBy} columns={columns} rows={rows} stack="narrow" caption={CAPTION} />
        {notes}
      </>
    )
  }
  return (
    <>
        <div className="mascot-vote__table-wrap" role="region" aria-labelledby={labelledBy} tabIndex={0}>
          <table className="mascot-vote__table">
            <caption className="mascot-vote__caption">{CAPTION}</caption>
            <thead>
              <tr>
                <th scope="col">Entry</th>
                {result.rounds.map((r) => (
                  <th scope="col" key={r.round}>
                    Round {r.round}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MASCOT_ENTRIES.map((entry) => (
                <tr key={entry.id} className={result.winner?.id === entry.id ? 'mascot-vote__row--winner' : undefined}>
                  <th scope="row">
                    {nameOf(entry.id)}
                    {result.winner?.id === entry.id && <span className="mascot-vote__tag">{winnerLabel}</span>}
                  </th>
                  {result.rounds.map((r) => {
                    const votes = r.votes[entry.id]
                    return votes === undefined ? (
                      <td key={r.round} className="mascot-vote__cell--out">
                        <span aria-hidden="true">-</span>
                        <span className="sr-only">eliminated</span>
                      </td>
                    ) : (
                      <td key={r.round}>{votes}</td>
                    )
                  })}
                </tr>
              ))}
              <tr className="mascot-vote__row--sum">
                <th scope="row">Exhausted</th>
                {result.rounds.map((r) => (
                  <td key={r.round}>{r.exhausted}</td>
                ))}
              </tr>
              <tr className="mascot-vote__row--sum">
                <th scope="row">Total</th>
                {result.rounds.map((r) => (
                  <td key={r.round}>{result.totalBallots}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        {notes}
    </>
  )
}
