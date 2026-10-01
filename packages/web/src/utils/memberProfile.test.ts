/**
 * Tests for the Discord username read (memberProfile.ts). It must agree with the
 * database (migration 024, public.site_discord_identity): the username, never the
 * display name, because admins compare it against the Discord server's member list.
 *
 * node:test, run with `npm test` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { User } from '@supabase/supabase-js'
import { discordUsernameFrom, getDiscordUsername, hasDiscordIdentity } from './memberProfile'

test('the username comes from full_name, not the display name', () => {
  assert.equal(
    discordUsernameFrom({ full_name: 'admin_user', name: 'admin_user#0', custom_claims: { global_name: 'Admin Display' } }),
    'admin_user',
  )
})

test('with no full_name, name loses a "#0" suffix but keeps a real discriminator', () => {
  assert.equal(discordUsernameFrom({ name: 'legacy_user#0', custom_claims: { global_name: 'Legacy' } }), 'legacy_user')
  assert.equal(discordUsernameFrom({ name: 'oldstyle#1234' }), 'oldstyle#1234')
})

test('nothing usable gives null, never the display name', () => {
  assert.equal(discordUsernameFrom({ custom_claims: { global_name: 'Only Display' } }), null)
  assert.equal(discordUsernameFrom(null), null)
  assert.equal(discordUsernameFrom({ full_name: '   ' }), null)
})

test('getDiscordUsername reads the linked Discord identity, not the account metadata', () => {
  const user = {
    id: 'u1',
    user_metadata: { full_name: 'Google Name', custom_claims: { global_name: 'Display' } },
    identities: [
      { provider: 'google', identity_data: { full_name: 'Google Name' } },
      { provider: 'discord', identity_data: { full_name: 'disc_user', name: 'disc_user#0', custom_claims: { global_name: 'Display' } } },
    ],
  } as unknown as User
  assert.equal(hasDiscordIdentity(user), true)
  assert.equal(getDiscordUsername(user), 'disc_user')

  const googleOnly = { id: 'u2', user_metadata: {}, identities: [{ provider: 'google', identity_data: {} }] } as unknown as User
  assert.equal(hasDiscordIdentity(googleOnly), false)
  assert.equal(getDiscordUsername(googleOnly), null)
  assert.equal(getDiscordUsername(null), null)
})
