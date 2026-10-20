import { describe, expect, it } from 'vitest';
import { defaultConfiguration, type AccessoryId, type SizeId } from '../../lib/catalog';
import { configurationReducer, illustrativeEstimate, normalizeConfiguration, type ConfigurationAction } from './configuration-state';

describe('canonical configuration', () => {
  it('updates independent choices and restores an independent default on reset', () => {
    const initial = normalizeConfiguration(defaultConfiguration);
    const actions: ConfigurationAction[] = [{ type: 'finish', id: 'walnut' }, { type: 'frame', id: 'white' }, { type: 'size', id: '160x80' }, { type: 'accessory', id: 'lamp', enabled: true }];
    const selected = actions.reduce(configurationReducer, initial);
    expect(selected).toMatchObject({ finishId: 'walnut', frameColourId: 'white', sizeId: '160x80', accessoryIds: ['lamp'] });
    expect(illustrativeEstimate(selected)).toBe(53400);
    const reset = configurationReducer(selected, { type: 'reset' });
    expect(reset).toEqual(defaultConfiguration);
    expect(reset).not.toBe(defaultConfiguration);
    expect(reset.accessoryIds).not.toBe(defaultConfiguration.accessoryIds);
    expect(initial).toEqual(defaultConfiguration);
  });

  it('has set semantics, stable order and no duplicate quantities through rapid changes', () => {
    let state = defaultConfiguration;
    for (let i = 0; i < 100; i++) {
      state = configurationReducer(state, { type: 'accessory', id: 'lamp', enabled: true });
      state = configurationReducer(state, { type: 'size', id: i % 2 ? '120x60' : '160x80' });
      state = configurationReducer(state, { type: 'accessory', id: 'cable-tray', enabled: i % 2 === 0 });
    }
    expect(state.accessoryIds).toEqual(['lamp']);
    expect(normalizeConfiguration({ ...state, accessoryIds: ['cable-tray', 'lamp', 'monitor-stand'] }).accessoryIds).toEqual(['lamp', 'monitor-stand', 'cable-tray']);
    expect(() => normalizeConfiguration({ ...state, accessoryIds: ['lamp', 'lamp'] })).toThrow();
  });

  it('rejects unknown IDs, prototype names, versions and extra payload fields', () => {
    for (const patch of [{ sizeId: 'bogus' }, { finishId: 'toString' }, { frameColourId: '__proto__' }, { accessoryIds: ['unknown'] }, { accessoryIds: null }, { schemaVersion: 2 }, { catalogVersion: '2' }, { productId: 'other' }, { quantity: 2 }]) {
      expect(() => normalizeConfiguration({ ...defaultConfiguration, ...patch })).toThrow(/Invalid product configuration/);
    }
    expect(() => configurationReducer(defaultConfiguration, { type: 'size', id: 'bad' as SizeId })).toThrow();
    expect(() => configurationReducer(defaultConfiguration, { type: 'accessory', id: 'bad' as AccessoryId, enabled: false })).toThrow();
  });
});
