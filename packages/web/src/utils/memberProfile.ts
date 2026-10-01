/**
 * memberProfile - reads display data off a Supabase user, defensively.
 *
 * Discord and Google put the avatar in user_metadata.avatar_url (Google also `picture`)
 * and the name in full_name / name / custom_claims.global_name / user_name. None of it is
 * guaranteed, so every read is type-checked.
 */
import type { User, UserIdentity } from '@supabase/supabase-js';

function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function firstString(...values: unknown[]): string | null {
  for (const v of values) {
    const s = str(v);
    if (s) return s;
  }
  return null;
}

function nameFrom(data: Record<string, unknown>): string | null {
  return firstString(
    record(data.custom_claims).global_name,
    data.full_name,
    data.name,
    data.user_name,
    data.preferred_username,
    data.display_name,
  );
}

export function getDisplayName(user: User): string {
  return nameFrom(record(user.user_metadata)) ?? user.email?.split('@')[0] ?? 'Member';
}

/** Only https avatar URLs are used; anything else falls back to the initial. */
export function getAvatarUrl(user: User): string | null {
  const meta = record(user.user_metadata);
  const url = firstString(meta.avatar_url, meta.picture);
  return url && /^https:\/\//i.test(url) ? url : null;
}

export function getInitial(user: User): string {
  return getDisplayName(user).charAt(0).toUpperCase() || '?';
}

function discordIdentity(user: User | null): UserIdentity | undefined {
  return user?.identities?.find((i) => i.provider === 'discord');
}

/** The one place that answers "does this member have Discord?" */
export function hasDiscordIdentity(user: User | null): boolean {
  return discordIdentity(user) !== undefined;
}

/** The linked Discord username, or null when there is no Discord identity. */
export function getDiscordUsername(user: User | null): string | null {
  const identity = discordIdentity(user);
  if (!identity) return null;
  return nameFrom(record(identity.identity_data));
}
