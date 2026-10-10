// What the account menu shows for a signed-in member (KB15), read defensively off a Supabase
// user. Discord and Google put the avatar in user_metadata.avatar_url (Google also `picture`)
// and the name in custom_claims.global_name / full_name / name / user_name. None of it is
// guaranteed, so every read is type-checked. Both apps use this one reading, so the wiki and
// the map can never show a member differently.

/** The part of a Supabase `User` this reads. A real `User` satisfies it. */
export interface UserLike {
  email?: string
  user_metadata?: unknown
}

export interface MemberDisplay {
  name: string
  /** One upper-case character, shown when there is no avatar or it fails to load. */
  initial: string
  /** Only an https URL, or null. */
  avatarUrl: string | null
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function firstString(...values: unknown[]): string | null {
  for (const v of values) {
    const s = str(v)
    if (s) return s
  }
  return null
}

export function displayName(user: UserLike): string {
  const meta = record(user.user_metadata)
  return (
    firstString(
      record(meta.custom_claims).global_name,
      meta.full_name,
      meta.name,
      meta.user_name,
      meta.preferred_username,
      meta.display_name,
    ) ??
    str(user.email?.split('@')[0]) ??
    'Member'
  )
}

/** Only https avatar URLs are used; anything else (http, data:, javascript:) falls back to the initial. */
export function avatarUrl(user: UserLike): string | null {
  const meta = record(user.user_metadata)
  const url = firstString(meta.avatar_url, meta.picture)
  if (!url) return null
  try {
    // Parsed without a base, so a relative or protocol-relative value ("//host/a.png") throws.
    return new URL(url).protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

export function memberDisplay(user: UserLike): MemberDisplay {
  const name = displayName(user)
  // The first code point, not the first UTF-16 unit, so a name starting outside the BMP is not cut in half.
  return { name, initial: (Array.from(name)[0] ?? '?').toUpperCase(), avatarUrl: avatarUrl(user) }
}
