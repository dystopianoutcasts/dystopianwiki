// Run with: deno test packages/shared/aurora/hostkey.test.ts
import { fingerprint, hostKeyMatches, normalizePin, parsePins } from './hostkey.ts';

function assertEquals<T>(actual: T, expected: T, msg = ''): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} expected ${e} got ${a}`);
}

const ABC = new TextEncoder().encode('abc');
// SHA-256("abc") is a published test vector; base64 without padding:
const ABC_FP = 'SHA256:ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0';

Deno.test('fingerprint matches the SHA-256 test vector, unpadded', async () => {
  assertEquals(await fingerprint(ABC), ABC_FP);
});

Deno.test('hostKeyMatches accepts a listed pin and rejects everything else', async () => {
  assertEquals(await hostKeyMatches(ABC, [ABC_FP]), true);
  assertEquals(await hostKeyMatches(ABC, ['SHA256:other', ABC_FP]), true);
  assertEquals(await hostKeyMatches(ABC, ['SHA256:other']), false);
  assertEquals(await hostKeyMatches(new TextEncoder().encode('abd'), [ABC_FP]), false);
});

Deno.test('an empty pin list never matches', async () => {
  assertEquals(await hostKeyMatches(ABC, []), false);
});

Deno.test('parsePins trims, drops blanks, and normalizes prefix and padding', () => {
  assertEquals(parsePins(' SHA256:aaa= , bbb ,, '), ['SHA256:aaa', 'SHA256:bbb']);
  assertEquals(parsePins(undefined), []);
  assertEquals(normalizePin('sha256:xyz=='), 'SHA256:xyz');
});
