import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { trailingDebounce } from './debounce'

describe('trailingDebounce', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('runs once after a burst of calls', () => {
    const fn = vi.fn()
    const d = trailingDebounce(fn, 400)
    d(); d(); d()
    vi.advanceTimersByTime(399)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('a later call pushes the run back', () => {
    const fn = vi.fn()
    const d = trailingDebounce(fn, 400)
    d()
    vi.advanceTimersByTime(300)
    d()
    vi.advanceTimersByTime(300)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('cancel drops the pending run', () => {
    const fn = vi.fn()
    const d = trailingDebounce(fn, 400)
    d()
    d.cancel()
    vi.advanceTimersByTime(1000)
    expect(fn).not.toHaveBeenCalled()
  })
})
