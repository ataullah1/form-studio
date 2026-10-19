/** Catalog v1. Immutable product facts, not camera/lighting state or submitted prices. */
export const catalogV1 = {
  schemaVersion: 1,
  catalogVersion: '1',
  productId: 'studio-desk-01',
  label: 'Studio Desk 01',
  currency: 'USD',
  heightMetres: 0.74,
  tabletopThicknessMetres: 0.03,
  sizes: {
    '120x60': { label: '120 × 60 cm', widthMetres: 1.2, depthMetres: 0.6, priceCents: 34900 },
    '140x70': { label: '140 × 70 cm', widthMetres: 1.4, depthMetres: 0.7, priceCents: 39900 },
    '160x80': { label: '160 × 80 cm', widthMetres: 1.6, depthMetres: 0.8, priceCents: 44900 },
  },
  finishes: {
    oak: { label: 'Oak', priceCents: 0 },
    walnut: { label: 'Walnut', priceCents: 4000 },
    ash: { label: 'Ash', priceCents: 0 },
  },
  frameColours: {
    black: { label: 'Black', priceCents: 0 },
    white: { label: 'White', priceCents: 0 },
  },
  accessories: {
    lamp: { label: 'Desk lamp', priceCents: 4500 },
    'monitor-stand': { label: 'Monitor stand', priceCents: 3500 },
    'cable-tray': { label: 'Cable tray', priceCents: 2000 },
  },
} as const;

export type SizeId = keyof typeof catalogV1.sizes;
export type FinishId = keyof typeof catalogV1.finishes;
export type FrameColourId = keyof typeof catalogV1.frameColours;
export type AccessoryId = keyof typeof catalogV1.accessories;

export interface ProductConfiguration {
  readonly schemaVersion: 1;
  readonly catalogVersion: '1';
  readonly productId: typeof catalogV1.productId;
  readonly sizeId: SizeId;
  readonly finishId: FinishId;
  readonly frameColourId: FrameColourId;
  readonly accessoryIds: readonly AccessoryId[];
}

export const defaultConfiguration: ProductConfiguration = {
  schemaVersion: 1,
  catalogVersion: '1',
  productId: 'studio-desk-01',
  sizeId: '140x70',
  finishId: 'oak',
  frameColourId: 'black',
  accessoryIds: [],
};

/** Display helper only. Authoritative validation/pricing comes in later steps. */
export function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(cents / 100);
}
