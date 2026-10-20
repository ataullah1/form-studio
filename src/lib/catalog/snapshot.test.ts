import { expect, it } from 'vitest';
import { defaultConfiguration } from './index';
import { resolveSnapshot } from './snapshot';
it('resolves the retained v1 visual catalog and recomputes its current estimate', () => {
  const resolved = resolveSnapshot({ configuration: defaultConfiguration, schemaVersion: 1, catalogVersion: '1' });
  expect(resolved?.configuration).toEqual(defaultConfiguration);
  expect(resolved?.currentPrice.estimatedTotalCents).toBe(39900);
});
it('fails explicitly for unavailable catalog/schema or removed visual IDs', () => {
  expect(resolveSnapshot({ configuration: defaultConfiguration, schemaVersion: 1, catalogVersion: 'old' })).toBeNull();
  expect(resolveSnapshot({ configuration: defaultConfiguration, schemaVersion: 2, catalogVersion: '1' })).toBeNull();
  expect(resolveSnapshot({ configuration: { ...defaultConfiguration, finishId: 'discontinued' }, schemaVersion: 1, catalogVersion: '1' })).toBeNull();
});
