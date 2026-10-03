import { useCallback, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, RefObject } from 'react'
import type { CatalogEntry } from '../data/vehicleCatalog'
import { searchCatalog } from '../data/vehicleCatalog'
import type { WatchStatus } from '../data/useWatches'

/** "Watch all shown" is offered for a typed query showing this many rows, no fewer and no more. */
export const WATCH_ALL_MIN = 2
export const WATCH_ALL_MAX = 40
/** Burnt and smashed scripts are hidden from the checklist until "Show wrecks" is checked. */
export const DEFAULT_SHOW_WRECKS = false

const LIST_ID = 'watch-cars-list'
const SEARCH_ID = 'watch-cars-search'

function onMapText(n: number): string {
  return `${n} on the map`
}

export function matchCountText(n: number): string {
  if (n === 0) return 'No cars match'
  return n === 1 ? '1 car matches' : `${n} cars match`
}

/** The text on a watched car's Show button: "Show" until it has been pressed, then the car it goes to next. */
export function showButtonText(n: number, shown: number | undefined): string {
  if (n <= 1 || shown === undefined) return 'Show'
  return `Show ${((shown + 1) % n) + 1} of ${n}`
}

/** Rows of the dropdown: the search result, wrecks left out unless asked for. */
export function shownEntries(catalog: readonly CatalogEntry[], query: string, showWrecks: boolean): CatalogEntry[] {
  return searchCatalog(query, catalog).filter((e) => showWrecks || !e.wreck)
}

export interface WatchCarsViewProps {
  status: WatchStatus
  /** The "Watching" list (vehicleCatalog.ts watchingEntries): every watched script, catalogued or not. */
  watching: CatalogEntry[]
  watchedSet: ReadonlySet<string>
  /** The dropdown rows (shownEntries). */
  shown: CatalogEntry[]
  open: boolean
  query: string
  showWrecks: boolean
  message: string | null
  /** script -> index of the match the Show button last flew to. */
  shownAt: Readonly<Record<string, number>>
  onToggleOpen: () => void
  onQuery: (q: string) => void
  onSearchEscape: () => void
  onShowWrecks: (on: boolean) => void
  onCheck: (script: string, checked: boolean) => void
  onWatchAll: (scripts: string[]) => void
  onClearAll: () => void
  onShow: (script: string) => void
  onRetry: () => void
  disclosureRef?: RefObject<HTMLButtonElement>
}

function EntryText({ e }: { e: CatalogEntry }) {
  return (
    <span className="watch-entry">
      <span className="watch-label">{e.label}</span>
      <span className="watch-detail">{e.detail}</span>
      {e.onMap > 0 ? <span className="watch-onmap">{onMapText(e.onMap)}</span> : null}
    </span>
  )
}

/**
 * T72: "Watch for a car", without state (WatchCars holds it), so tests render it directly. The
 * dropdown is a disclosure button over a search box and a filtered list of real checkboxes: the
 * accessible form of a multi-select dropdown, with no custom combobox.
 */
export function WatchCarsView(p: WatchCarsViewProps) {
  const alert = p.message ? <p className="note error" role="alert">{p.message}</p> : null

  if (p.status === 'signed-out') {
    return (
      <section className="panel watch-cars" aria-labelledby="watch-cars-h">
        <h2 id="watch-cars-h" className="watch-title">Watch for a car</h2>
        <p className="note"><a href="/login?next=/map/">Log in</a> to pick cars to watch for.</p>
      </section>
    )
  }
  if (p.status !== 'ready') {
    return (
      <section className="panel watch-cars" aria-labelledby="watch-cars-h">
        <h2 id="watch-cars-h" className="watch-title">Watch for a car</h2>
        {alert}
        {p.status === 'loading' ? <p className="note">Loading your watch list...</p> : null}
        {p.status === 'off' ? <p className="note">Watching for cars is not switched on yet.</p> : null}
        {p.status === 'error' ? (
          <>
            <p className="note error" role="alert">Could not load your watch list.</p>
            <button type="button" className="watch-small" onClick={p.onRetry}>Try again</button>
          </>
        ) : null}
      </section>
    )
  }

  const typed = p.query.trim() !== ''
  const canWatchAll = typed && p.shown.length >= WATCH_ALL_MIN && p.shown.length <= WATCH_ALL_MAX
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      p.onSearchEscape()
    }
  }

  return (
    <section className="panel watch-cars" aria-labelledby="watch-cars-h">
      <h2 id="watch-cars-h" className="watch-title">Watch for a car</h2>
      {alert}
      <h3 className="watch-sub">Watching ({p.watching.length})</h3>
      {p.watching.length === 0 ? (
        <p className="note">No cars yet. Choose cars below; a car you watch for is drawn in magenta with a pulsing ring when it is on the map.</p>
      ) : (
        <ul className="watch-list watching">
          {p.watching.map((e) => {
            const id = `watching-${e.script}`
            const text = showButtonText(e.onMap, p.shownAt[e.script])
            return (
              <li key={e.script} className="watch-row">
                <label htmlFor={id}>
                  <input id={id} type="checkbox" checked onChange={() => p.onCheck(e.script, false)} />
                  <EntryText e={e} />
                </label>
                {e.onMap > 0 ? (
                  <button type="button" className="watch-small" aria-label={`${text}: ${e.label}`} onClick={() => p.onShow(e.script)}>
                    {text}
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
      <button
        ref={p.disclosureRef}
        type="button"
        className="watch-disclosure"
        aria-expanded={p.open}
        aria-controls="watch-cars-choose"
        onClick={p.onToggleOpen}
      >
        <span className="watch-chevron" aria-hidden="true">{p.open ? '-' : '+'}</span>
        Choose cars
      </button>
      <div id="watch-cars-choose" className="watch-choose" hidden={!p.open}>
        {p.open ? (
          <>
            <label htmlFor={SEARCH_ID} className="watch-search-label">Search cars</label>
            <input
              id={SEARCH_ID}
              type="search"
              value={p.query}
              onChange={(e) => p.onQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="e.g. step van"
              autoComplete="off"
              aria-describedby="watch-cars-count"
              aria-controls={LIST_ID}
            />
            <p id="watch-cars-count" className="note" aria-live="polite">{matchCountText(p.shown.length)}</p>
            <label className="watch-wrecks">
              <input type="checkbox" checked={p.showWrecks} onChange={(e) => p.onShowWrecks(e.target.checked)} />
              Show wrecks
            </label>
            <ul id={LIST_ID} className="watch-list choose" aria-label="Cars">
              {p.shown.map((e) => {
                const id = `watch-${e.script}`
                return (
                  <li key={e.script} className="watch-row">
                    <label htmlFor={id}>
                      <input id={id} type="checkbox" checked={p.watchedSet.has(e.script)} onChange={(ev) => p.onCheck(e.script, ev.target.checked)} />
                      <EntryText e={e} />
                    </label>
                  </li>
                )
              })}
            </ul>
            <div className="watch-actions">
              {canWatchAll ? (
                <button type="button" className="watch-small" onClick={() => p.onWatchAll(p.shown.map((e) => e.script))}>
                  Watch all shown
                </button>
              ) : null}
              {p.watchedSet.size > 0 ? (
                <button type="button" className="watch-small" onClick={p.onClearAll}>
                  Clear all
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}

export interface WatchCarsProps {
  status: WatchStatus
  catalog: CatalogEntry[]
  watching: CatalogEntry[]
  watchedSet: ReadonlySet<string>
  message: string | null
  /** The matches of one script, in a stable order, for its Show button. */
  matchesOf: (script: string) => { x: number; y: number }[]
  onAdd: (scripts: string[]) => void
  onRemove: (scripts: string[]) => void
  onFly: (pos: { x: number; y: number }) => void
  onRetry: () => void
}

/** The stateful wrapper: dropdown open, query, wrecks, and where each Show button is in its cycle. */
export function WatchCars(props: WatchCarsProps) {
  const { catalog, matchesOf, onAdd, onRemove, onFly } = props
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [showWrecks, setShowWrecks] = useState(DEFAULT_SHOW_WRECKS)
  const [shownAt, setShownAt] = useState<Record<string, number>>({})
  const disclosureRef = useRef<HTMLButtonElement>(null)

  const shown = useMemo(() => shownEntries(catalog, query, showWrecks), [catalog, query, showWrecks])

  const onSearchEscape = useCallback(() => {
    setOpen(false)
    disclosureRef.current?.focus()
  }, [])
  const onCheck = useCallback((script: string, checked: boolean) => (checked ? onAdd([script]) : onRemove([script])), [onAdd, onRemove])
  const onShow = useCallback(
    (script: string) => {
      const list = matchesOf(script)
      if (list.length === 0) return
      const prev = shownAt[script]
      const next = prev === undefined ? 0 : (prev + 1) % list.length
      setShownAt((s) => ({ ...s, [script]: next }))
      onFly(list[next])
    },
    [matchesOf, onFly, shownAt],
  )

  return (
    <WatchCarsView
      status={props.status}
      watching={props.watching}
      watchedSet={props.watchedSet}
      shown={shown}
      open={open}
      query={query}
      showWrecks={showWrecks}
      message={props.message}
      shownAt={shownAt}
      onToggleOpen={() => setOpen((o) => !o)}
      onQuery={setQuery}
      onSearchEscape={onSearchEscape}
      onShowWrecks={setShowWrecks}
      onCheck={onCheck}
      onWatchAll={onAdd}
      onClearAll={() => onRemove([...props.watchedSet])}
      onShow={onShow}
      onRetry={props.onRetry}
      disclosureRef={disclosureRef}
    />
  )
}
