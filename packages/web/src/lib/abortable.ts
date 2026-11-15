/**
 * A request that can be cancelled and that gives up on its own. Used by the report form and the
 * admin Reports section, so a hung request never traps the reader or the admin in a dialog.
 *
 * `fn` gets an AbortSignal to hand to fetch. Whether or not `fn` honors it, this settles as soon
 * as the signal fires: a result that arrives later is dropped.
 */

/** How long a report, a save or a delete may take before it counts as a network failure. */
export const REQUEST_TIMEOUT_MS = 15000

export type Abortable<T> = { aborted: false; value: T } | { aborted: true; reason: 'timeout' | 'cancelled' }

export async function runAbortable<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  outer?: AbortSignal,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
): Promise<Abortable<T>> {
  if (outer?.aborted) return { aborted: true, reason: 'cancelled' }
  const controller = new AbortController()
  let reason: 'timeout' | 'cancelled' = 'timeout'
  const onOuter = () => {
    reason = 'cancelled'
    controller.abort()
  }
  outer?.addEventListener('abort', onOuter)
  const timer = setTimeout(() => {
    reason = 'timeout'
    controller.abort()
  }, timeoutMs)
  const gaveUp = new Promise<{ aborted: true; reason: 'timeout' | 'cancelled' }>((resolve) => {
    controller.signal.addEventListener('abort', () => resolve({ aborted: true, reason }))
  })
  try {
    const run = fn(controller.signal).then((value): Abortable<T> => ({ aborted: false, value }))
    // A fetch that honors the signal rejects with an AbortError when it fires: that is a give-up, not a failure.
    const guarded = run.catch((error: unknown): Abortable<T> => {
      if (controller.signal.aborted) return { aborted: true, reason }
      throw error
    })
    return await Promise.race([guarded, gaveUp])
  } finally {
    clearTimeout(timer)
    outer?.removeEventListener('abort', onOuter)
  }
}
