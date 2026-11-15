/** The admin Reports section's real calls (migration 048), over the site's Supabase client. */
import { api } from './supabase'
import { createReportsApi } from './articleReportsAdmin'

export const reportsApi = createReportsApi(async (name, args, signal) => {
  const request = api.getClient().rpc(name, args)
  const { data, error } = await (signal ? request.abortSignal(signal) : request)
  return { data, error: error as { code?: unknown; message?: unknown; status?: unknown } | null }
})
