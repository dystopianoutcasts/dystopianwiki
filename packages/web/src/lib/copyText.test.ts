import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copyText, scheduleReset, COPIED_RESET_MS, type TimerApi } from './copyText';

test('copyText: resolving clipboard writes the value and reports copied', async () => {
  const written: string[] = [];
  const out = await copyText('208.75.182.207:27130', {
    writeText: async (t) => {
      written.push(t);
    },
  });
  assert.equal(out, 'copied');
  assert.deepEqual(written, ['208.75.182.207:27130']);
});

test('copyText: rejecting clipboard falls back to select', async () => {
  const out = await copyText('x', { writeText: async () => Promise.reject(new Error('denied')) });
  assert.equal(out, 'select');
});

test('copyText: synchronous throw falls back to select', async () => {
  const out = await copyText('x', {
    writeText: () => {
      throw new Error('boom');
    },
  });
  assert.equal(out, 'select');
});

test('copyText: undefined or null clipboard falls back to select', async () => {
  assert.equal(await copyText('x', undefined), 'select');
  assert.equal(await copyText('x', null), 'select');
});

function fakeTimers() {
  const pending = new Map<number, { fn: () => void; ms: number }>();
  let next = 1;
  const api: TimerApi = {
    set: (fn, ms) => {
      pending.set(next, { fn, ms });
      return next++;
    },
    clear: (h) => {
      pending.delete(h as number);
    },
  };
  return { api, pending };
}

test('scheduleReset: arms a 2 s timer that fires the reset once', () => {
  const { api, pending } = fakeTimers();
  let resets = 0;
  scheduleReset(() => resets++, api);
  assert.equal(COPIED_RESET_MS, 2000);
  assert.equal(pending.size, 1);
  const [t] = [...pending.values()];
  assert.equal(t.ms, 2000);
  t.fn();
  assert.equal(resets, 1);
});

test('scheduleReset: cancel clears the pending timer', () => {
  const { api, pending } = fakeTimers();
  const cancel = scheduleReset(() => {}, api);
  cancel();
  assert.equal(pending.size, 0);
});
