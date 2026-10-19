import { describe, expect, it } from 'vitest';
import { catalogV1, defaultConfiguration } from './index';

describe('catalog specification invariants', () => {
  it('resolves the documented default to the $399, 140×70, oak/black desk', () => {
    const size = catalogV1.sizes[defaultConfiguration.sizeId];
    expect([size.widthMetres, size.depthMetres, size.priceCents]).toEqual([1.4, 0.7, 39900]);
    expect(catalogV1.finishes[defaultConfiguration.finishId].priceCents).toBe(0);
    expect(catalogV1.frameColours[defaultConfiguration.frameColourId].priceCents).toBe(0);
    expect(defaultConfiguration.accessoryIds).toEqual([]);
    expect(defaultConfiguration.catalogVersion).toBe(catalogV1.catalogVersion);
    expect(defaultConfiguration.productId).toBe(catalogV1.productId);
  });
  it('keeps every published amount in nonnegative integer cents', () => {
    for (const group of [catalogV1.sizes, catalogV1.finishes, catalogV1.frameColours, catalogV1.accessories]) {
      for (const option of Object.values(group)) {
        expect(Number.isSafeInteger(option.priceCents)).toBe(true);
        expect(option.priceCents).toBeGreaterThanOrEqual(0);
      }
    }
  });
  it('preserves the published size/height/thickness constraints', () => {
    expect(Object.values(catalogV1.sizes).map(s => [s.widthMetres, s.depthMetres]))
      .toEqual([[1.2, 0.6], [1.4, 0.7], [1.6, 0.8]]);
    expect(catalogV1.heightMetres).toBe(0.74);
    expect(catalogV1.tabletopThicknessMetres).toBe(0.03);
  });
});
