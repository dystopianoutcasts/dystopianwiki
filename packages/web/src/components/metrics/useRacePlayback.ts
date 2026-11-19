/**
 * Playback for the three races on /metrics: one step per hour of the season, a speed, a
 * pause, a restart, and a slider. A race plays by itself once from the start; with reduced
 * motion it opens on today and stays still until asked. `holdAfter(from, to)` may return a
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

export interface Playback {
  step: number
  playing: boolean
  speed: number
  msPerStep: number
  reducedMotion: boolean
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
  const [playing, setPlaying] = useState(() => !snapshot())
  const [speed, setSpeed] = useState(DEFAULT_SPEED)
  const stepRef = useRef(step)
  const holdUntil = useRef(0)

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
    if (playing) {
      setPlaying(false)
      return
    }
    if (stepRef.current >= lastStep) setStep(0)
    holdUntil.current = 0
    setPlaying(true)
  }, [playing, lastStep, setStep])

  const restart = useCallback(() => {
    holdUntil.current = 0
    setStep(0)
    setPlaying(true)
  }, [setStep])

  const seek = useCallback(
    (n: number) => {
      holdUntil.current = 0
      setStep(Math.min(lastStep, Math.max(0, n)))
      setPlaying(false)
    },
    [lastStep, setStep],
  )

  return { step, playing, speed, msPerStep: SPEED_MS[speed], reducedMotion, setSpeed, toggle, restart, seek }
}
