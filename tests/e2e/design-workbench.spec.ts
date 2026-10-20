import { readFile } from 'node:fs/promises';
import { test, expect } from './fixtures';

async function openDesk(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'View desk in 3D' }).click();
  await expect(page.getByText('Oak finish ready', { exact: false })).toBeVisible();
}

test('starting setups and undo/redo preserve a valid product-only draft without loading 3D', async ({ page }) => {
  await page.goto('/configure');
  await page.getByRole('button', { name: 'Warm workspace', exact: false }).click();
  await expect(page.getByRole('radio', { name: 'Walnut', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Desk lamp', exact: false })).toBeChecked();
  await page.getByRole('button', { name: 'Undo', exact: false }).click();
  await expect(page.getByRole('radio', { name: 'Oak', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Redo', exact: false }).click();
  await expect(page.getByRole('radio', { name: 'Walnut', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Redo', exact: false }).press('Control+z');
  await expect(page.getByRole('radio', { name: 'Oak', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Redo', exact: false }).press('Control+Shift+z');
  await expect(page.getByRole('radio', { name: 'Walnut', exact: true })).toBeChecked();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('form-studio:product-draft') ?? 'null')?.finishId)).toBe('walnut');
  await page.reload();
  await expect(page.getByRole('radio', { name: 'Walnut', exact: true })).toBeChecked();
  await expect(page.getByRole('button', { name: 'Undo', exact: false })).toBeDisabled();
});

test('room, dimensions, camera, lamp, comparison and PNG export keep product selections isolated', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/configure'); await openDesk(page);
  await page.getByRole('button', { name: 'Room', exact: true }).click();
  await page.getByRole('combobox', { name: 'Room floor' }).selectOption('stone');
  await page.getByRole('button', { name: 'Dimensions', exact: true }).click();
  await expect(page.locator('.dimension-label').filter({ hasText: 'W 140 cm' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep for comparison', exact: true }).click();
  await page.getByRole('button', { name: '160 × 80 cm', exact: true }).click();
  await expect(page.locator('.dimension-label').filter({ hasText: 'W 160 cm' })).toBeVisible();
  await page.getByRole('button', { name: 'View comparison', exact: true }).click();
  await expect(page.locator('.dimension-label').filter({ hasText: 'W 140 cm' })).toBeVisible();
  await expect(page.getByRole('button', { name: '160 × 80 cm', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'View current design', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Desk lamp', exact: false }).check();
  await page.getByRole('button', { name: 'Night', exact: true }).click();
  await page.getByRole('button', { name: 'Desk lamp on', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Desk lamp off', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Tabletop', exact: true }).click();
  await page.getByRole('button', { name: 'Rear & accessories', exact: true }).click();
  const downloadReady = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download preview', exact: true }).click();
  const download = await downloadReady;
  expect(download.suggestedFilename()).toBe('form-studio-160x80-oak.png');
  const bytes = await readFile((await download.path())!);
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a'); expect(bytes.length).toBeGreaterThan(2000);
  await page.getByRole('button', { name: 'Expand preview', exact: true }).click();
  await expect(page.locator('.scene-viewer')).toHaveClass(/is-expanded/);
  await page.getByRole('button', { name: 'Compact preview', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('form-studio:product-draft')!)).sort())).toEqual(['accessoryIds', 'catalogVersion', 'finishId', 'frameColourId', 'productId', 'schemaVersion', 'sizeId']);
  expect(errors).toEqual([]);
});

test('workbench remains usable at small widths and without WebGL', async ({ page }) => {
  await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) { if (type.startsWith('webgl')) return null; return Reflect.apply(original, this, [type, ...args]); } as typeof original; });
  await page.goto('/configure');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole('button', { name: 'View desk in 3D' }).click();
  await expect(page.getByText('3D is unavailable.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Focus station', exact: false }).click();
  await expect(page.getByRole('button', { name: '160 × 80 cm', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('canvas')).toHaveCount(0);
});
