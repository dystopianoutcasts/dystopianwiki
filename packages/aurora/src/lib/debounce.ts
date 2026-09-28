/** Trailing debounce: runs once, `ms` after the last call. `cancel` drops a pending run. */
export function trailingDebounce(fn: () => void, ms: number): (() => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined
  const run = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      fn()
    }, ms)
  }
  run.cancel = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }
  return run
}
