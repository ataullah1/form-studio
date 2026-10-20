import { expect, it } from 'vitest';
import { quoteServiceReady } from './service-policy';
it.each([
  [undefined, undefined, undefined, false],
  ['replace-with-a-separate-random-cleanup-secret', '1', 'production', false],
  ['short', '1', 'production', false],
  ['a'.repeat(64), '1', 'preview', false],
  ['a'.repeat(64), '1', 'production', true],
  ['a'.repeat(64), undefined, undefined, true],
])('requires usable cleanup configuration and a production schedule on Vercel %#', (secret, platform, environment, expected) => {
  expect(quoteServiceReady(secret, platform, environment)).toBe(expected);
});
