/** worldsApi bound to the real aurora client. Not imported by tests: lib/aurora.ts reads the Vite build variables. */
import { auroraClient } from './aurora'
import { createWorldsApi, type WorldsApi } from './worldsApi'

function bind(): WorldsApi | null {
  const client = auroraClient
  if (!client) return null
  return createWorldsApi((fn, args) => client.rpc(fn as never, args as never) as never)
}

/** null when the publishable key is missing; the panel then says live data is not configured. */
export const worldsApi: WorldsApi | null = bind()
