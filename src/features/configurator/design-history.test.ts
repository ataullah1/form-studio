import { expect, it } from 'vitest';
import { defaultConfiguration } from '../../lib/catalog';
import { calculatePrice, validateConfig } from '../../lib/catalog/pricing';
import { createDesignHistory, designHistoryReducer as reduce, designPresets } from './design-history';

it('undoes and redoes a complete template, retaining the original price and accessories', () => {
  const original = { ...defaultConfiguration, accessoryIds: ['cable-tray'] as const };
  const initial = createDesignHistory(original);
  const chosen = reduce(initial, { type: 'template', configuration: designPresets[1].configuration });
  expect(chosen.present.finishId).toBe('walnut');
  const undone = reduce(chosen, { type: 'undo' });
  expect(undone.present).toEqual(original);
  expect(calculatePrice(undone.present)).toEqual(calculatePrice(original));
  expect(reduce(undone, { type: 'redo' }).present).toEqual(chosen.present);
});
it('clears the redo branch after an edit and does not record no-op selections', () => {
  const initial = createDesignHistory(defaultConfiguration);
  expect(reduce(initial, { type: 'finish', id: 'oak' })).toBe(initial);
  const changed = reduce(initial, { type: 'finish', id: 'walnut' });
  const branched = reduce(reduce(changed, { type: 'undo' }), { type: 'frame', id: 'white' });
  expect(branched.future).toEqual([]);
  expect(reduce(branched, { type: 'redo' })).toBe(branched);
});
it('bounds history and accepts only catalogue-valid templates', () => {
  let state = createDesignHistory(defaultConfiguration);
  for (let i = 0; i < 70; i++) state = reduce(state, { type: 'finish', id: i % 2 ? 'oak' : 'walnut' });
  expect(state.past).toHaveLength(50);
  for (const preset of designPresets) expect(validateConfig(preset.configuration)).toEqual(preset.configuration);
  expect(() => reduce(state, { type: 'template', configuration: { ...defaultConfiguration, sizeId: '999x999' } as never })).toThrow();
});
