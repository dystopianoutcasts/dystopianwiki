/** The admin Reports section's real calls (migration 048), over the site's Supabase client. */
import { api } from './supabase'
import { createReportsApi } from './articleReportsAdmin'

export const reportsApi = createReportsApi(async (name, args) => {
  const { data, error } = await api.getClient().rpc(name, args)
  return { data, error: error as { code?: unknown; message?: unknown; status?: unknown } | null }
})
