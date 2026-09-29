import { describe, expect, it } from 'vitest'
import { adminFromRpc } from './useIsAdmin'

describe('adminFromRpc', () => {
  it('is true only for exactly { data: true, error: null }', () => {
    expect(adminFromRpc({ data: true, error: null })).toBe(true)
  })

  it('is false when the RPC returned an error, even alongside data: true', () => {
    expect(adminFromRpc({ data: true, error: { message: 'denied' } })).toBe(false)
  })

  it('is false for false, null, or a non-boolean truthy value', () => {
    expect(adminFromRpc({ data: false, error: null })).toBe(false)
    expect(adminFromRpc({ data: null, error: null })).toBe(false)
    expect(adminFromRpc({ data: 'true', error: null })).toBe(false)
    expect(adminFromRpc({ data: 1, error: null })).toBe(false)
  })
})
