/**
 * memberProfile - reads a member's Discord identity off a Supabase user, defensively.
 *
 * The name, initial and avatar the site header shows are read by the shared
 * packages/shared/site-header/profile.ts (KB15), one reading for the wiki and the map.
 * None of the identity data is guaranteed, so every read is type-checked.
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

function discordIdentity(user: User | null): UserIdentity | undefined {
  return user?.identities?.find((i) => i.provider === 'discord');
}

/** The one place that answers "does this member have Discord?" */
export function hasDiscordIdentity(user: User | null): boolean {
  return discordIdentity(user) !== undefined;
}

/**
 * The Discord username (not the display name) from a Discord identity's data, the same
 * field the database copies onto a ballot (migration 024, public.site_discord_identity):
 * Supabase stores the username as `full_name`, the username with its discriminator as
 * `name` ("user#0"), and the display name as `custom_claims.global_name`.
 */
export function discordUsernameFrom(identityData: unknown): string | null {
  const data = record(identityData);
  const legacy = str(data.name);
  return firstString(data.full_name, legacy ? legacy.replace(/#0$/, '') : null, data.user_name, data.preferred_username);
}

/** The linked Discord username, or null when there is no Discord identity. */
export function getDiscordUsername(user: User | null): string | null {
  const identity = discordIdentity(user);
  if (!identity) return null;
  return discordUsernameFrom(identity.identity_data);
}
