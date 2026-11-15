/**
 * Behavior tests for the modal dialog (dialogBehavior.ts), driven with fake dialog and element
 * objects: it opens as a modal, Escape closes it unless locked, the backdrop closes it unless
 * locked, and focus returns to the opener. Each assertion fails if the behavior is broken (see
 * the mutation notes in the tests). node:test, run with `npm test` from packages/web.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { afterClose, onBackdropClick, onCancel, syncOpen, type DialogLike } from './dialogBehavior'

function fakeDialog(): DialogLike & { log: string[] } {
  const d = {
    open: false,
    log: [] as string[],
    showModal() {
      d.open = true
      d.log.push('showModal')
    },
    close() {
      d.open = false
      d.log.push('close')
    },
  }
  return d
}

test('opening shows it as a modal (so the page behind is inert and focus is trapped), once, and remembers the opener', () => {
  const d = fakeDialog()
  const opener = { isConnected: true, focus() {} }
  let focused = 0
  const r = syncOpen(d, true, opener, () => focused++)
  assert.deepEqual(d.log, ['showModal'])
  assert.equal(r?.opener, opener)
  assert.equal(focused, 1)
  // Rendering again while open does nothing.
  assert.equal(syncOpen(d, true, opener), null)
  assert.deepEqual(d.log, ['showModal'])
})

test('closing from the owner closes the dialog; closing an already closed one does nothing', () => {
  const d = fakeDialog()
  syncOpen(d, true, null)
  assert.equal(syncOpen(d, false, null), null)
  assert.deepEqual(d.log, ['showModal', 'close'])
  syncOpen(d, false, null)
  assert.deepEqual(d.log, ['showModal', 'close'])
})

test('Escape (the cancel event) is allowed normally and refused only while locked', () => {
  let prevented = 0
  const event = { preventDefault: () => prevented++ }
  assert.equal(onCancel(false, event), false)
  assert.equal(prevented, 0, 'unlocked: Escape closes the dialog')
  assert.equal(onCancel(true, event), true)
  assert.equal(prevented, 1, 'locked: Escape is stopped')
})

test('a click on the backdrop closes it; a click inside, or while locked, does not', () => {
  const d = fakeDialog()
  d.open = true
  const inside = {}
  assert.equal(onBackdropClick(false, { target: inside, currentTarget: d }), false)
  assert.equal(d.open, true)
  assert.equal(onBackdropClick(true, { target: d, currentTarget: d }), false)
  assert.equal(d.open, true)
  assert.equal(onBackdropClick(false, { target: d, currentTarget: d }), true)
  assert.equal(d.open, false)
})

test('when it closes, focus goes back to the opener if it is still on the page, and then the owner is told', () => {
  const order: string[] = []
  const opener = { isConnected: true, focus: () => order.push('focus') }
  afterClose(opener, () => order.push('closed'))
  assert.deepEqual(order, ['focus', 'closed'])

  const gone: string[] = []
  afterClose({ isConnected: false, focus: () => gone.push('focus') }, () => gone.push('closed'))
  assert.deepEqual(gone, ['closed'], 'an opener that left the page is not focused')

  const none: string[] = []
  afterClose(null, () => none.push('closed'))
  assert.deepEqual(none, ['closed'])
})
