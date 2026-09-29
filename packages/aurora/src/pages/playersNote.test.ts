import { describe, expect, it } from 'vitest'
import { LINK_FEATURE_ENABLED } from '../config'
import { playersNote } from './playersNote'

const anonOn = { delayMinutes: 5, roundToCell: true, anonPositions: true }
const anonOff = { delayMinutes: 30, roundToCell: true, anonPositions: false }

describe('the link feature is dormant (T21, owner decision 2026-09-29)', () => {
  it('ships with the flag off', () => {
    expect(LINK_FEATURE_ENABLED).toBe(false)
  })
})

describe('playersNote for an anonymous visitor with nothing on the map', () => {
  it('says nobody is online when anonymous positions are on', () => {
    expect(playersNote({ signedIn: false, positionCount: 0, vis: anonOn, linkEnabled: false })).toBe('Nobody is online right now.')
  })

  it('keeps the sign-in hint only when anonymous positions are off', () => {
    expect(playersNote({ signedIn: false, positionCount: 0, vis: anonOff, linkEnabled: false })).toBe(
      'Sign in to see approximate player positions.',
    )
  })

  it('says nothing until the visibility setting has loaded', () => {
    expect(playersNote({ signedIn: false, positionCount: 0, vis: undefined, linkEnabled: false })).toBeUndefined()
  })
})

describe('playersNote when positions are shown', () => {
  it('states the delay and the rounding', () => {
    expect(playersNote({ signedIn: false, positionCount: 3, vis: anonOn, linkEnabled: false })).toBe(
      'Other players are shown about 5 minutes late and rounded to a map cell.',
    )
  })

  it('omits the rounding clause when rounding is off', () => {
    const vis = { ...anonOn, roundToCell: false }
    expect(playersNote({ signedIn: false, positionCount: 3, vis, linkEnabled: false })).toBe(
      'Other players are shown about 5 minutes late.',
    )
  })

  it('never claims live visibility while linking is dormant, signed in or not', () => {
    for (const signedIn of [false, true]) {
      const note = playersNote({ signedIn, positionCount: 2, vis: anonOn, linkEnabled: false })
      expect(note).not.toMatch(/live|your own|safehouse/i)
    }
  })

  it('restores the live sentence if linking is switched back on', () => {
    expect(playersNote({ signedIn: true, positionCount: 2, vis: anonOn, linkEnabled: true })).toBe(
      'Other players are shown about 5 minutes late and rounded to a map cell. Your own and safehouse members show live.',
    )
  })

  it('a signed-in visitor with nothing on the map gets the delay note, not the anonymous wording', () => {
    expect(playersNote({ signedIn: true, positionCount: 0, vis: anonOff, linkEnabled: false })).toBe(
      'Other players are shown about 30 minutes late and rounded to a map cell.',
    )
  })
})
