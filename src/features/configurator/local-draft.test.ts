import { describe, expect, it } from 'vitest';
import { defaultConfiguration } from '../../lib/catalog';
import { DRAFT_KEY, loadInitialConfiguration, saveDraft } from './local-draft';

function memory(raw: string | null = null) {
  let data = raw;
  return { getItem: () => data, setItem: (_key: string, value: string) => { data = value; } };
}
describe('local draft trust and shared priority', () => {
  it('round trips product state only with versions; reset can save defaults', () => {
    const store = memory(); const get = () => store;
    expect(loadInitialConfiguration(get).status).toBe('new');
    const selected = { ...defaultConfiguration, sizeId: '120x60', accessoryIds: ['cable-tray'] };
    expect(saveDraft(get, selected)).toBe(true);
    expect(loadInitialConfiguration(get)).toMatchObject({ status: 'restored', configuration: selected });
    expect(Object.keys(JSON.parse(store.getItem()!))).toEqual(Object.keys(defaultConfiguration));
    expect(saveDraft(get, defaultConfiguration)).toBe(true);
    expect(loadInitialConfiguration(get).configuration).toEqual(defaultConfiguration);
    expect(DRAFT_KEY).toBe('form-studio:product-draft');
  });
  it.each(['{', 'null', '{"schemaVersion":2}', JSON.stringify({ ...defaultConfiguration, catalogVersion: 'old' }), JSON.stringify({ ...defaultConfiguration, accessoryIds: ['lamp', 'lamp'] }), 'x'.repeat(4097)])('returns a recoverable invalid state without silently overwriting stored data %#', raw => {
    const store = memory(raw);
    expect(loadInitialConfiguration(() => store)).toEqual({ status: 'invalid', configuration: defaultConfiguration });
    expect(store.getItem()).toBe(raw);
  });
  it('works when storage access, reads or writes throw', () => {
    const blocked = () => { throw new Error('SecurityError'); };
    expect(loadInitialConfiguration(blocked).status).toBe('unavailable');
    expect(saveDraft(blocked, defaultConfiguration)).toBe(false);
    const quota = () => ({ getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } });
    expect(saveDraft(quota, defaultConfiguration)).toBe(false);
  });
  it('shared snapshot wins without reading local storage, including blocked storage', () => {
    const local = { ...defaultConfiguration, finishId: 'walnut' };
    const shared = { ...defaultConfiguration, sizeId: '120x60' };
    expect(loadInitialConfiguration(() => memory(JSON.stringify(local)), shared)).toEqual({ status: 'shared', configuration: shared });
    expect(loadInitialConfiguration(() => { throw new Error('Must not read'); }, shared).configuration).toEqual(shared);
    expect(() => loadInitialConfiguration(() => memory(JSON.stringify(local)), { ...shared, sizeId: 'unknown' })).toThrow();
  });
  it('rejects private fields and supplied totals before writing', () => {
    const store = memory();
    for (const patch of [{ email: 'fictional@example.com' }, { name: 'Demo' }, { message: 'Example' }, { price: 1 }]) expect(() => saveDraft(() => store, { ...defaultConfiguration, ...patch })).toThrow();
    expect(store.getItem()).toBeNull();
  });
});
