import { catalogV1, defaultConfiguration, type AccessoryId, type ProductConfiguration } from './index';

/** Strict boundary for drafts, share payloads and estimates. Never trust supplied prices. */
export function validateConfig(input: unknown): ProductConfiguration {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid product configuration');
  const value = input as Record<string, unknown>;
  const fields = Object.keys(defaultConfiguration);
  const known = (options: object, id: unknown) => typeof id === 'string' && Object.hasOwn(options, id);
  if (!fields.every(key => Object.hasOwn(value, key)) || Object.keys(value).some(key => !fields.includes(key)) ||
    value.schemaVersion !== 1 || value.catalogVersion !== '1' || value.productId !== catalogV1.productId ||
    !known(catalogV1.sizes, value.sizeId) || !known(catalogV1.finishes, value.finishId) ||
    !known(catalogV1.frameColours, value.frameColourId) || !Array.isArray(value.accessoryIds) ||
    !Array.from(value.accessoryIds).every(id => known(catalogV1.accessories, id)) || new Set(value.accessoryIds).size !== value.accessoryIds.length) {
    throw new Error('Invalid product configuration: unknown option, duplicate accessory or version');
  }
  return {
    schemaVersion: 1, catalogVersion: '1', productId: catalogV1.productId,
    sizeId: value.sizeId as ProductConfiguration['sizeId'], finishId: value.finishId as ProductConfiguration['finishId'],
    frameColourId: value.frameColourId as ProductConfiguration['frameColourId'],
    accessoryIds: (Object.keys(catalogV1.accessories) as AccessoryId[]).filter(id => (value.accessoryIds as unknown[]).includes(id)),
  };
}

export function calculatePrice(input: unknown) {
  const configuration = validateConfig(input);
  const size = catalogV1.sizes[configuration.sizeId];
  const finish = catalogV1.finishes[configuration.finishId];
  const frame = catalogV1.frameColours[configuration.frameColourId];
  const lines = [
    { id: configuration.sizeId, label: `Desk · ${size.label}`, amountCents: size.priceCents },
    { id: configuration.finishId, label: `${finish.label} finish`, amountCents: finish.priceCents },
    { id: configuration.frameColourId, label: `${frame.label} frame`, amountCents: frame.priceCents },
    ...configuration.accessoryIds.map(id => ({ id, label: `${catalogV1.accessories[id].label} × 1`, amountCents: catalogV1.accessories[id].priceCents })),
  ];
  const productSubtotalCents = size.priceCents;
  const surchargeCents = lines.slice(1).reduce((total, line) => total + line.amountCents, 0);
  return { currency: catalogV1.currency, catalogVersion: catalogV1.catalogVersion, lines, productSubtotalCents, surchargeCents, estimatedTotalCents: productSubtotalCents + surchargeCents, taxCents: null, shippingCents: null } as const;
}
