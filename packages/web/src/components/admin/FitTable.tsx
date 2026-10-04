import type { ReactNode } from 'react'

/**
 * A table on the admin dashboard that is never wider than its panel (T78).
 *
 * On a wide panel it is an ordinary table whose cells wrap; when the panel is too narrow
 * for its columns (a container query in admin.css) each row becomes a stacked block of
 * "label: value" lines, the label taken from the column header (`data-label`).
 *
 * The stacked layout changes `display` on the table parts, which makes some browsers drop
 * the table from the accessibility tree, so every part carries its ARIA role explicitly
 * (table, rowgroup, row, columnheader, rowheader, cell). The roles match what the native
 * elements already have, so they change nothing while the table is shown as a table.
 *
 * Nothing scrolls sideways, so there is no focusable scroll region and no sticky first
 * column (the public vote page keeps both; it does not use this component).
 *
 * Hook-free, so the tests render it with ./staticMarkup.
 */

/**
 * How a column's cells wrap:
 * - text: wraps at spaces (date-times, provider lists, prose)
 * - break: may break anywhere (emails, user names, file names: one long word)
 * - short: never wraps (one-word labels: a status, a role)
 * - num: never wraps, right-aligned, tabular figures
 * - action: holds a button; the button stays whole, full width when stacked
 * - list: holds an inline list whose items stay whole
 */
export type FitColumnKind = 'text' | 'break' | 'short' | 'num' | 'action' | 'list'

export interface FitColumn {
  label: string
  kind?: FitColumnKind
}

export interface FitRow {
  key: string
  className?: string
  /** One cell per column; the first is the row header. */
  cells: ReactNode[]
}

/**
 * When the table stacks, by the width of its panel's content box (see admin.css):
 * - wide: below 740 px (six or seven columns)
 * - narrow: below 480 px (four to six short columns)
 * - never: two short columns fit at 320 px
 */
export type FitStack = 'wide' | 'narrow' | 'never'

export function columnClass(kind: FitColumnKind = 'text'): string {
  return `admin__col admin__col--${kind}`
}

export function FitTable({
  labelledBy,
  columns,
  rows,
  stack,
  caption,
}: {
  /** id of the heading that names the table */
  labelledBy: string
  columns: readonly FitColumn[]
  rows: readonly FitRow[]
  stack: FitStack
  caption?: ReactNode
}) {
  return (
    <div className="mascot-vote__table-wrap admin__table-wrap">
      <table className={`mascot-vote__table admin__table admin__table--stack-${stack}`} role="table" aria-labelledby={labelledBy}>
        {caption !== undefined && <caption className="mascot-vote__caption admin__caption">{caption}</caption>}
        <thead role="rowgroup">
          <tr role="row">
            {columns.map((c) => (
              <th key={c.label} scope="col" role="columnheader" className={columnClass(c.kind)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((row) => (
            <tr key={row.key} role="row" className={row.className}>
              {columns.map((c, i) => {
                const value = <span className="admin__cell-value">{row.cells[i]}</span>
                return i === 0 ? (
                  <th key={c.label} scope="row" role="rowheader" className={columnClass(c.kind)} data-label={c.label}>
                    {value}
                  </th>
                ) : (
                  <td key={c.label} role="cell" className={columnClass(c.kind)} data-label={c.label}>
                    {value}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
