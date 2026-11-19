/**
 * The frame every race shares: title, the Eastern clock, Play / Start over / Speed / Hour,
 * the line that says what just happened, the board, and a footnote. Every control is a real
 * button or input, at least 44 px tall. The line is a polite live region only while the race
 * is paused, so a screen reader is not read a new sentence every few milliseconds.
 */
import { useId, type ReactNode } from 'react'
import { SPEED_LABELS } from '../../lib/metricsRaces'
import type { Playback } from './useRacePlayback'

export type HeadlineTone = 'normal' | 'alert' | 'big'

export function playLabel(playing: boolean, step: number, lastStep: number): string {
  if (playing) return 'Pause'
  if (step >= lastStep) return 'Play again'
  return step === 0 ? 'Play' : 'Keep playing'
}

export function RaceShell({
  title,
  badge,
  intro,
  clockDay,
  clockHour,
  clockExtra,
  playback,
  lastStep,
  headline,
  tone = 'normal',
  board,
  footnote,
  children,
}: {
  title: string
  badge: string
  intro: string
  clockDay: string
  clockHour: string
  clockExtra?: string
  playback: Playback
  lastStep: number
  headline: string
  tone?: HeadlineTone
  board: ReactNode
  footnote?: string | null
  children?: ReactNode
}) {
  const id = useId()
  const sliderId = `${id}-hour`
  return (
    <section ref={playback.viewRef} className="metrics-race" aria-labelledby={`${id}-title`}>
      <header className="metrics-race__head">
        <div className="metrics-race__titles">
          <h3 className="metrics-race__title" id={`${id}-title`}>
            {title}
          </h3>
          <span className="metrics-race__badge">{badge}</span>
          <p className="metrics-race__intro">{intro}</p>
        </div>
        <div className="metrics-race__clock">
          <span className="metrics-race__clock-day">{clockDay}</span>
          <span className="metrics-race__clock-hour">{clockHour}</span>
          {clockExtra ? <span className="metrics-race__clock-extra">{clockExtra}</span> : null}
        </div>
      </header>

      <div className="metrics-race__controls">
        <button type="button" className="metrics-btn metrics-btn--primary" onClick={playback.toggle}>
          {playLabel(playback.playing, playback.step, lastStep)}
        </button>
        <button type="button" className="metrics-btn" onClick={playback.restart}>
          Start over
        </button>
        <div className="metrics-race__speed" role="group" aria-label="Speed">
          <span className="metrics-race__speed-label">Speed</span>
          {SPEED_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={i === playback.speed ? 'metrics-btn metrics-btn--on' : 'metrics-btn'}
              aria-pressed={i === playback.speed}
              onClick={() => playback.setSpeed(i)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="metrics-race__slider-label" htmlFor={sliderId}>
          Hour
        </label>
        <input
          id={sliderId}
          className="metrics-race__slider"
          type="range"
          min={0}
          max={lastStep}
          step={1}
          value={playback.step}
          onChange={(e) => playback.seek(Number(e.target.value))}
        />
      </div>

      <p
        className={`metrics-race__headline metrics-race__headline--${tone}`}
        aria-live={playback.playing ? 'off' : 'polite'}
      >
        {headline}
      </p>

      {board}
      {children}
      {footnote ? <p className="metrics-card__note">{footnote}</p> : null}
    </section>
  )
}
