/** mapRebuildApi bound to the real aurora client. Not imported by tests: lib/aurora.ts reads the Vite build variables. */
import { auroraClient } from './aurora'
import { createMapRebuildApi, type MapRebuildApi } from './mapRebuildApi'

function bind(): MapRebuildApi | null {
  const client = auroraClient
  if (!client) return null
  return createMapRebuildApi((fn, args) => client.rpc(fn as never, args as never) as never)
}

/** null when the publishable key is missing; the panel then says live data is not configured. */
export const mapRebuildApi: MapRebuildApi | null = bind()
