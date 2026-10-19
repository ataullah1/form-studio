import { catalogV1, defaultConfiguration, type AccessoryId, type FinishId, type FrameColourId, type ProductConfiguration, type SizeId } from '../../lib/catalog';

export type ConfigurationAction =
  | { type: 'size'; id: SizeId }
  | { type: 'finish'; id: FinishId }
  | { type: 'frame'; id: FrameColourId }
  | { type: 'accessory'; id: AccessoryId; enabled: boolean }
  | { type: 'reset' };

function hasID(options: object, id: unknown): boolean {
  return typeof id === 'string' && Object.hasOwn(options, id);
}

/** Reject unknown input; only deduplicate/order known accessories. No silent ID substitution. */
export function normalizeConfiguration(input: unknown): ProductConfiguration {
  if (!input || typeof input !== 'object') throw new Error('Invalid product configuration');
  const value = input as Record<string, unknown>;
  const fields = Object.keys(defaultConfiguration);
  if (!fields.every(key => Object.hasOwn(value, key)) || Object.keys(value).some(key => !fields.includes(key)) ||
      value.schemaVersion !== 1 || value.catalogVersion !== '1' || value.productId !== catalogV1.productId ||
      !hasID(catalogV1.sizes, value.sizeId) || !hasID(catalogV1.finishes, value.finishId) ||
      !hasID(catalogV1.frameColours, value.frameColourId) || !Array.isArray(value.accessoryIds) ||
      !value.accessoryIds.every(id => hasID(catalogV1.accessories, id))) {
    throw new Error('Invalid product configuration: unknown option or version');
  }
  const ids = value.accessoryIds;
  return {
    schemaVersion: 1, catalogVersion: '1', productId: catalogV1.productId,
    sizeId: value.sizeId as SizeId, finishId: value.finishId as FinishId,
    frameColourId: value.frameColourId as FrameColourId,
    accessoryIds: (Object.keys(catalogV1.accessories) as AccessoryId[]).filter(id => ids.includes(id)),
  };
}

export function configurationReducer(state: ProductConfiguration, action: ConfigurationAction): ProductConfiguration {
  switch (action.type) {
    case 'size': return normalizeConfiguration({ ...state, sizeId: action.id });
    case 'finish': return normalizeConfiguration({ ...state, finishId: action.id });
    case 'frame': return normalizeConfiguration({ ...state, frameColourId: action.id });
    case 'accessory':
      if (!hasID(catalogV1.accessories, action.id) || typeof action.enabled !== 'boolean') throw new Error('Invalid accessory selection');
      return normalizeConfiguration({ ...state, accessoryIds: action.enabled ? [...state.accessoryIds, action.id] : state.accessoryIds.filter(id => id !== action.id) });
    case 'reset': return normalizeConfiguration(defaultConfiguration);
    default: throw new Error('Unknown configuration action');
  }
}

/** Local display only; server validation and the complete pricing engine are Step 6+. */
export function illustrativeEstimate(configuration: ProductConfiguration): number {
  return catalogV1.sizes[configuration.sizeId].priceCents + catalogV1.finishes[configuration.finishId].priceCents +
    configuration.accessoryIds.reduce((total, id) => total + catalogV1.accessories[id].priceCents, 0);
}
