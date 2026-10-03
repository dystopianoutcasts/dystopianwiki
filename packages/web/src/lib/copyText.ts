// Click-to-copy logic, kept free of React and the DOM so it can be tested with an
// injected clipboard. 'copied' means the clipboard took the text; 'select' means the
// caller must select the text so the user can press Ctrl+C (no clipboard API, or it
// refused, e.g. an insecure context or a denied permission).

export type CopyOutcome = 'copied' | 'select';

export interface ClipboardLike {
  writeText(text: string): Promise<void>;
}

/** How long the button says "Copied" before it goes back to "Copy". */
export const COPIED_RESET_MS = 2000;

export async function copyText(
  value: string,
  clipboard: ClipboardLike | undefined | null,
): Promise<CopyOutcome> {
  if (!clipboard || typeof clipboard.writeText !== 'function') return 'select';
  try {
    await clipboard.writeText(value);
    return 'copied';
  } catch {
    return 'select';
  }
}

export type TimerApi = {
  set: (fn: () => void, ms: number) => unknown;
  clear: (handle: unknown) => void;
};

const realTimers: TimerApi = {
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
};

/** Runs onReset after COPIED_RESET_MS; returns a cancel function. Timers are injectable. */
export function scheduleReset(onReset: () => void, timers: TimerApi = realTimers): () => void {
  const handle = timers.set(onReset, COPIED_RESET_MS);
  return () => timers.clear(handle);
}
