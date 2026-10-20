import { describe, expect, it } from 'vitest';
import { catalogV1, defaultConfiguration, type AccessoryId, type FinishId, type SizeId } from './index';
import { calculatePrice, validateConfig } from './pricing';

describe('versioned validated pricing', () => {
  it.each([
    [defaultConfiguration, 39900],
    [{ ...defaultConfiguration, finishId: 'walnut', accessoryIds: ['lamp', 'monitor-stand', 'cable-tray'] }, 53900],
    [{ ...defaultConfiguration, sizeId: '120x60', accessoryIds: ['cable-tray'] }, 36900],
  ])('matches documented golden estimate %#', (configuration, cents) => {
    const price = calculatePrice(configuration);
    expect(price.estimatedTotalCents).toBe(cents);
    expect(price.productSubtotalCents + price.surchargeCents).toBe(cents);
    expect(price.taxCents).toBeNull(); expect(price.shippingCents).toBeNull();
  });
  it('keeps every catalog combination in integer cents with exact itemization', () => {
    const ids = Object.keys(catalogV1.accessories) as AccessoryId[];
    for (const sizeId of Object.keys(catalogV1.sizes) as SizeId[]) for (const finishId of Object.keys(catalogV1.finishes) as FinishId[]) for (let mask = 0; mask < 8; mask++) {
      const configuration = { ...defaultConfiguration, sizeId, finishId, accessoryIds: ids.filter((_, bit) => mask & (1 << bit)) };
      const price = calculatePrice(configuration);
      expect(Number.isSafeInteger(price.estimatedTotalCents)).toBe(true);
      expect(price.lines.reduce((sum, line) => sum + line.amountCents, 0)).toBe(price.estimatedTotalCents);
      expect(price.currency).toBe('USD'); expect(price.catalogVersion).toBe('1');
      expect(calculatePrice({ ...configuration, frameColourId: 'white' }).estimatedTotalCents).toBe(price.estimatedTotalCents);
    }
  });
  it('rejects malformed/duplicate/versioned or injected-price input instead of quoting it', () => {
    for (const input of [null, [], {}, { ...defaultConfiguration, sizeId: 'unknown' }, { ...defaultConfiguration, finishId: '__proto__' }, { ...defaultConfiguration, accessoryIds: ['lamp', 'lamp'] }, { ...defaultConfiguration, accessoryIds: Array(1) }, { ...defaultConfiguration, priceCents: 1 }, { ...defaultConfiguration, schemaVersion: 2 }, { ...defaultConfiguration, catalogVersion: '0' }, { ...defaultConfiguration, lighting: 'night' }]) {
      expect(() => calculatePrice(input)).toThrow(/Invalid product configuration/);
    }
  });
  it('returns independently owned canonical IDs without mutating input', () => {
    const input = { ...defaultConfiguration, accessoryIds: ['cable-tray', 'lamp'] };
    const result = validateConfig(input);
    expect(result.accessoryIds).toEqual(['lamp', 'cable-tray']);
    expect(input.accessoryIds).toEqual(['cable-tray', 'lamp']);
    expect(result).not.toBe(input); expect(result.accessoryIds).not.toBe(input.accessoryIds);
  });
});
