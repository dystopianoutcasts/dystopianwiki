/**
 * The executive role's and the EYES ONLY area's calls to the database (migration 041).
 * Every answer is validated by eyesOnly.ts. Nothing here throws: failures come back as
 * values, in the same shape as adminApi.ts.
 *
 * The database is the gate. Each function refuses a caller without the right flag, so a
 * page that shows something to the wrong person still gets no data.
 */
import { reasonOf, rpc, type ApiResult } from './adminApi'
import {
  parseDocument,
  parseDocumentList,
  parseExecutiveMembers,
  parsePutResult,
  type EyesOnlyDocument,
  type EyesOnlyListItem,
  type ExecutiveMember,
  type UploadDraft,
} from './eyesOnly'

/** public.site_is_executive(). Fails closed: anything but an exact `true` is false. */
export async function fetchIsExecutive(): Promise<boolean> {
  const { data, error } = await rpc('site_is_executive')
  return error === null && data === true
}

export async function fetchEyesOnlyList(): Promise<ApiResult<EyesOnlyListItem[]>> {
  const { data, error } = await rpc('eyes_only_list')
  if (error) return { ok: false, reason: reasonOf(error) }
  const parsed = parseDocumentList(data)
  return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, reason: 'malformed' }
}

export async function fetchEyesOnlyDocument(slug: string): Promise<ApiResult<EyesOnlyDocument>> {
  const { data, error } = await rpc('eyes_only_get', { p_slug: slug })
  if (error) return { ok: false, reason: reasonOf(error) }
  const parsed = parseDocument(data)
  return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, reason: 'malformed' }
}

/** Admins and the superadmin: every account, with the executive flag. */
export async function fetchAdminMembers(): Promise<ApiResult<ExecutiveMember[]>> {
  const { data, error } = await rpc('site_admin_members')
  if (error) return { ok: false, reason: reasonOf(error) }
  const parsed = parseExecutiveMembers(data)
  return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, reason: 'malformed' }
}

export async function setExecutive(userId: string, executive: boolean): Promise<ApiResult<null>> {
  const { error } = await rpc('site_admin_set_executive', { p_user: userId, p_executive: executive })
  return error ? { ok: false, reason: reasonOf(error) } : { ok: true, value: null }
}

/** Superadmin only. Resolves to the sha256 the database computed over the stored HTML. */
export async function putEyesOnly(draft: UploadDraft): Promise<ApiResult<string>> {
  const { data, error } = await rpc('site_superadmin_put_eyes_only', {
    p_slug: draft.slug,
    p_title: draft.title.trim(),
    p_summary: draft.summary.trim(),
    p_html: draft.html,
  })
  if (error) return { ok: false, reason: reasonOf(error) }
  const parsed = parsePutResult(data)
  return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, reason: 'malformed' }
}

/** Superadmin only. */
export async function deleteEyesOnly(slug: string): Promise<ApiResult<null>> {
  const { error } = await rpc('site_superadmin_delete_eyes_only', { p_slug: slug })
  return error ? { ok: false, reason: reasonOf(error) } : { ok: true, value: null }
}
