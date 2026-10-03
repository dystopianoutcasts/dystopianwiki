import { useCallback, useMemo, useState } from 'react'
import type { Vehicle } from '../data/types'
import { spottedGroups, spottedText } from '../data/sightings'
import type { SpottedGroup } from '../data/sightings'
import { showButtonText } from './WatchCars'

/**
 * T72: the "Spotted" notice, the stand-in for a notification. Drawn ON the map (map/MapView.tsx's
 * overlay host, above the map key), because on a phone the side panel is a closed sheet. The live
 * region is always mounted while the viewer is signed in, so a sighting that fills it is announced;
 * it holds nothing visible until there is one.
 */
export function WatchNoticeView({ groups, shownAt, onShow, onDismiss }: {
  groups: SpottedGroup[]
  /** Index of the car Show last flew to, across all groups; undefined before the first press. */
  shownAt: number | undefined
  onShow: () => void
  onDismiss: () => void
}) {
  const total = groups.reduce((n, g) => n + g.cars.length, 0)
  const showText = showButtonText(total, shownAt)
  return (
    <div className="watch-notice-live" role="status" aria-live="polite">
      {total > 0 ? (
        <div className="watch-notice">
          <span className="watch-notice-mark" aria-hidden="true" />
          <p className="watch-notice-text">{spottedText(groups)}</p>
          <div className="watch-notice-actions">
            <button type="button" onClick={onShow} aria-label={total > 1 ? `${showText}: spotted cars` : 'Show the spotted car'}>
              {showText}
            </button>
            <button type="button" onClick={onDismiss}>Dismiss</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** Holds where Show is in its cycle; the cars come from useSightings (pending) and the current matches. */
export function WatchNotice({ pending, matches, names, onFly, onDismiss }: {
  pending: readonly string[]
  matches: readonly Vehicle[]
  names: ReadonlyMap<string, string>
  onFly: (pos: { x: number; y: number }) => void
  onDismiss: () => void
}) {
  const [shownAt, setShownAt] = useState<number | undefined>(undefined)
  const groups = useMemo(() => spottedGroups(pending, matches, names), [pending, matches, names])
  const cars = useMemo(() => groups.flatMap((g) => g.cars), [groups])
  const onShow = useCallback(() => {
    if (cars.length === 0) return
    const next = shownAt === undefined ? 0 : (shownAt + 1) % cars.length
    setShownAt(next)
    onFly({ x: cars[next].x, y: cars[next].y })
  }, [cars, shownAt, onFly])
  const dismiss = useCallback(() => {
    setShownAt(undefined)
    onDismiss()
  }, [onDismiss])
  return <WatchNoticeView groups={groups} shownAt={cars.length > 0 ? shownAt : undefined} onShow={onShow} onDismiss={dismiss} />
}
