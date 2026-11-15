/**
 * The reader's call to submit_article_report (migration 048). Nothing here throws: the answer
 * comes back as a SendOutcome (articleReport.ts decides what each database answer means).
 */
import { api } from './supabase'
import { sendReport, type ReportDraft, type ReportPage, type RpcCall, type SendOutcome } from './articleReport'

const call: RpcCall = async (name, args) => {
  const { data, error } = await api.getClient().rpc(name, args)
  return { data, error: error as { code?: unknown; message?: unknown; status?: unknown } | null }
}

export function submitArticleReport(page: ReportPage, draft: ReportDraft): Promise<SendOutcome> {
  return sendReport(call, page, draft)
}
