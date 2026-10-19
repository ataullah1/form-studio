import { test, expect } from './fixtures';
import { changedInteriorFraction } from './image-comparison';

const accessories = ['Desk lamp', 'Monitor stand', 'Cable tray'];
const prices = [45, 35, 20];
const sizes = [{ label: '120 × 60 cm', width: 120, depth: 60, price: 349 }, { label: '140 × 70 cm', width: 140, depth: 70, price: 399 }, { label: '160 × 80 cm', width: 160, depth: 80, price: 449 }];

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
  test(`all 24 size/accessory combinations and reset agree at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/configure');
    await page.getByRole('button', { name: 'View desk in 3D' }).click();
    await expect(page.getByText('Oak finish ready', { exact: false })).toBeVisible();
    const summary = page.getByRole('region', { name: 'Configuration summary' });
    const region = page.getByTestId('scene-region');
    const initial = await region.screenshot();
    for (const size of sizes) {
      await page.getByRole('button', { name: size.label, exact: true }).click();
      await expect(page.getByRole('button', { name: size.label, exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[aria-label^="Interactive Studio Desk"]')).toHaveAttribute('aria-label', new RegExp(`${size.width} by ${size.depth}`));
      for (let mask = 0; mask < 8; mask++) {
        let estimate = size.price;
        for (let bit = 0; bit < 3; bit++) {
          const selected = !!(mask & (1 << bit));
          const input = page.getByRole('checkbox', { name: new RegExp(accessories[bit]) });
          await input.setChecked(selected);
          if (selected) {
            estimate += prices[bit];
            await expect(summary.getByText(`${accessories[bit]} × 1`, { exact: true })).toHaveCount(1);
          } else await expect(summary.getByText(`${accessories[bit]} × 1`, { exact: true })).toHaveCount(0);
        }
        await expect(summary).toContainText(size.label);
        await expect(summary.locator('.total')).toContainText(`$${estimate}`);
        await expect(page.locator('canvas')).toHaveCount(1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
    // A real rendered all-accessory composition differs from the initial empty desk.
    expect((await region.screenshot()).equals(initial)).toBe(false);
    // Rapid user changes must leave no stale checkbox/summary selections.
    for (let i = 0; i < 12; i++) {
      await page.getByRole('checkbox', { name: /Desk lamp/ }).click();
      await page.getByRole('button', { name: sizes[i % 3].label, exact: true }).click();
    }
    await page.getByRole('radio', { name: 'Walnut', exact: true }).check();
    await page.getByRole('button', { name: 'White', exact: true }).click();
    await page.getByRole('button', { name: 'Reset configuration', exact: true }).click();
    await expect(page.getByRole('radio', { name: 'Oak', exact: true })).toBeChecked();
    await expect(page.getByRole('button', { name: 'Black', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: '140 × 70 cm', exact: true })).toHaveAttribute('aria-pressed', 'true');
    for (const name of accessories) await expect(page.getByRole('checkbox', { name: new RegExp(name) })).not.toBeChecked();
    await expect(summary.locator('.total')).toContainText('$399');
    await expect(summary).toContainText('No accessories');
    await expect(page.getByText('Oak finish ready', { exact: false })).toBeVisible();
    expect(await changedInteriorFraction(page, initial, await region.screenshot())).toBeLessThan(0.001);
    await page.getByRole('button', { name: 'Use 2D view' }).click();
    await page.getByRole('button', { name: '120 × 60 cm', exact: true }).click();
    await page.getByRole('checkbox', { name: /Monitor stand/ }).check();
    await expect(page.locator('.schematic')).toContainText('120 cm');
    await expect(page.locator('.schematic')).toContainText('Depth 60 cm');
    await expect(page.locator('.schematic')).toContainText('Selected accessories: Monitor stand');
    await expect(page.locator('.schematic desc')).toContainText('120 centimetres wide');
    await expect(summary.locator('.total')).toContainText('$384');
    expect(errors).toEqual([]);
  });
}
