import { useCallback, useState } from 'react'
import { browserStorage, readHidden, writeHidden } from './codeReferences'

export interface CodeReferences {
  hidden: boolean
  toggle: () => void
}

/** Whether code references are hidden, and a toggle that remembers the choice. */
export function useCodeReferences(): CodeReferences {
  const [hidden, setHidden] = useState(() => readHidden(browserStorage()))
  const toggle = useCallback(() => {
    const next = !hidden
    writeHidden(browserStorage(), next)
    setHidden(next)
  }, [hidden])
  return { hidden, toggle }
}
