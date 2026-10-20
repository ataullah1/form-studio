import { catalogV1, defaultConfiguration, type AccessoryId, type FinishId, type FrameColourId, type ProductConfiguration, type SizeId } from '../../lib/catalog';

export type ConfigurationAction =
  | { type: 'size'; id: SizeId }
  | { type: 'finish'; id: FinishId }
  | { type: 'frame'; id: FrameColourId }
  | { type: 'accessory'; id: AccessoryId; enabled: boolean }
  | { type: 'reset' };

/** Strict external boundary; valid accessory ordering is normalized, duplicates rejected. */
export { validateConfig as normalizeConfiguration } from '../../lib/catalog/pricing';
import { validateConfig as normalizeConfiguration, calculatePrice } from '../../lib/catalog/pricing';

function hasID(options: object, id: unknown) { return typeof id === 'string' && Object.hasOwn(options, id); }

export function configurationReducer(state: ProductConfiguration, action: ConfigurationAction): ProductConfiguration {
  switch (action.type) {
    case 'size': return normalizeConfiguration({ ...state, sizeId: action.id });
    case 'finish': return normalizeConfiguration({ ...state, finishId: action.id });
    case 'frame': return normalizeConfiguration({ ...state, frameColourId: action.id });
    case 'accessory':
      if (!hasID(catalogV1.accessories, action.id) || typeof action.enabled !== 'boolean') throw new Error('Invalid accessory selection');
      return normalizeConfiguration({ ...state, accessoryIds: action.enabled ? [...new Set([...state.accessoryIds, action.id])] : state.accessoryIds.filter(id => id !== action.id) });
    case 'reset': return normalizeConfiguration(defaultConfiguration);
    default: throw new Error('Unknown configuration action');
  }
}

/** Compatibility helper; all prices now pass the same strict validation boundary. */
export function illustrativeEstimate(configuration: ProductConfiguration): number {
  return calculatePrice(configuration).estimatedTotalCents;
}
