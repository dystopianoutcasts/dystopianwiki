/**
 * Playback for the three races on /metrics: one step per hour of the season, a speed, a
 * pause, a restart, and a slider. A race plays by itself once from the start, beginning the
 * first time its section scrolls into view (`viewRef` goes on the section), so a race below
 * the fold has not finished before anyone sees it. Once the visitor presses Play, Start over
 * or moves the slider, it never starts by itself again. With reduced motion it opens on
 * today and stays still until asked. `holdAfter(from, to)` may return a
 * number of milliseconds to pause on arriving at `to` (the longest-alive race holds for a
 * big death). The step is also kept in a ref so the timer never reads a stale one.
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { DEFAULT_SPEED, SPEED_MS } from '../../lib/metricsRaces'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void): () => void {
  try {
    const mql = window.matchMedia(QUERY)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  } catch {
    return () => undefined
  }
}

function snapshot(): boolean {
  try {
    return window.matchMedia(QUERY).matches
  } catch {
    return false
  }
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false)
}

/** The top of a race must be in the upper 70% of the screen; works for a race taller than the screen. */
export const START_ROOT_MARGIN = '0px 0px -30% 0px'

/**
 * When a race starts by itself: never with reduced motion; at once where the browser cannot
 * tell what is on screen (the old behavior); otherwise the first time it is seen.
 */
export function autoStartMode(reducedMotion: boolean, hasObserver: boolean): 'never' | 'now' | 'when-seen' {
  if (reducedMotion) return 'never'
  return hasObserver ? 'when-seen' : 'now'
}

export interface Playback {
  step: number
  playing: boolean
  speed: number
  msPerStep: number
  reducedMotion: boolean
  /** Put on the race's section: the race starts the first time it is seen. */
  viewRef: (el: Element | null) => void
  setSpeed: (speed: number) => void
  /** Pause, or play on (from the start when it is already at the end). */
  toggle: () => void
  restart: () => void
  /** Moving the slider pauses the race. */
  seek: (step: number) => void
}

export function useRacePlayback(lastStep: number, holdAfter?: (from: number, to: number) => number): Playback {
  const reducedMotion = usePrefersReducedMotion()
  const [step, setStepState] = useState(() => (snapshot() ? lastStep : 0))
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(DEFAULT_SPEED)
  const stepRef = useRef(step)
  const holdUntil = useRef(0)
  // Set once the race has started by itself or the visitor took over; it never starts by itself after that.
  const settled = useRef(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const viewRef = useCallback((el: Element | null) => {
    observer.current?.disconnect()
    observer.current = null
    if (!el || settled.current) return
    const mode = autoStartMode(snapshot(), typeof IntersectionObserver !== 'undefined')
    if (mode === 'never') return
    if (mode === 'now') {
      settled.current = true
      setPlaying(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        observer.current = null
        if (settled.current) return
        settled.current = true
        setPlaying(true)
      },
      { rootMargin: START_ROOT_MARGIN },
    )
    io.observe(el)
    observer.current = io
  }, [])

  const setStep = useCallback((n: number) => {
    stepRef.current = n
    setStepState(n)
  }, [])

  // The feed can be refreshed with a later last step; never sit past the end.
  useEffect(() => {
    if (stepRef.current > lastStep) setStep(lastStep)
  }, [lastStep, setStep])

  useEffect(() => {
    if (!playing) return undefined
    const id = window.setInterval(() => {
      if (Date.now() < holdUntil.current) return
      const from = stepRef.current
      if (from >= lastStep) {
        setPlaying(false)
        return
      }
      const next = from + 1
      // The hold is checked before the end, so a big death in the very last step is still watched.
      const hold = holdAfter ? holdAfter(from, next) : 0
      if (hold > 0) holdUntil.current = Date.now() + hold
      setStep(next)
    }, SPEED_MS[speed])
    return () => window.clearInterval(id)
  }, [playing, speed, lastStep, holdAfter, setStep])

  const toggle = useCallback(() => {
    settled.current = true
    if (playing) {
      setPlaying(false)
      return
    }
    if (stepRef.current >= lastStep) setStep(0)
    holdUntil.current = 0
    setPlaying(true)
  }, [playing, lastStep, setStep])

  const restart = useCallback(() => {
    settled.current = true
    holdUntil.current = 0
    setStep(0)
    setPlaying(true)
  }, [setStep])

  const seek = useCallback(
    (n: number) => {
      settled.current = true
      holdUntil.current = 0
      setStep(Math.min(lastStep, Math.max(0, n)))
      setPlaying(false)
    },
    [lastStep, setStep],
  )

  return { step, playing, speed, msPerStep: SPEED_MS[speed], reducedMotion, viewRef, setSpeed, toggle, restart, seek }
}
