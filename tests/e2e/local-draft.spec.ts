import { test, expect } from './fixtures';
import { defaultConfiguration } from '../../src/lib/catalog';
import { DRAFT_KEY } from '../../src/features/configurator/local-draft';

const stored = (page: import('@playwright/test').Page) => page.evaluate(key => JSON.parse(localStorage.getItem(key)!), DRAFT_KEY);

test('refresh restores validated product only, viewer preferences stay separate and reset is immediately durable', async ({ page }) => {
  await page.goto('/configure');
  await page.getByRole('radio', { name: 'Walnut', exact: true }).check();
  for (const label of ['Desk lamp', 'Monitor stand', 'Cable tray']) await page.getByRole('checkbox', { name: new RegExp(label) }).check();
  const summary = page.getByRole('region', { name: 'Configuration summary' });
  await expect(summary.locator('.total')).toContainText('$539');
  await page.getByLabel('Name', { exact: true }).fill('Fictional visitor');
  await page.getByLabel('Email', { exact: true }).fill('fictional@example.com');
  await expect.poll(() => stored(page)).toEqual({ ...defaultConfiguration, finishId: 'walnut', accessoryIds: ['lamp', 'monitor-stand', 'cable-tray'] });
  const product = await stored(page);
  await page.getByRole('button', { name: 'View desk in 3D' }).click();
  await expect(page.getByText('Walnut finish ready', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Night', exact: true }).click();
  await page.getByRole('button', { name: 'Front view', exact: true }).click();
  expect(await stored(page)).toEqual(product);
  await expect(summary.locator('.total')).toContainText('$539');
  await page.reload();
  await expect(page.getByRole('radio', { name: 'Walnut', exact: true })).toBeChecked();
  await expect(summary.locator('.total')).toContainText('$539');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByLabel('Name', { exact: true })).toBeEmpty();
  await expect(page.getByLabel('Email', { exact: true })).toBeEmpty();
  const allStorage = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  expect(allStorage).not.toContain('Fictional'); expect(allStorage).not.toContain('fictional@example.com');
  await page.getByRole('button', { name: 'Reset configuration', exact: true }).click();
  expect(await stored(page)).toEqual(defaultConfiguration);
  await page.reload();
  await expect(summary.locator('.total')).toContainText('$399');
  await expect(page.getByRole('radio', { name: 'Oak', exact: true })).toBeChecked();
  await page.getByRole('button', { name: '120 × 60 cm', exact: true }).click();
  await page.getByRole('checkbox', { name: /Cable tray/ }).check();
  await expect(summary.locator('.total')).toContainText('$369');
  await expect(page.locator('.schematic')).toContainText('120 cm');
  await expect(page.locator('.schematic')).toContainText('Cable tray');
});

test('hydration reveals the restored selection without showing the default estimate first', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: DRAFT_KEY, value: { ...defaultConfiguration, finishId: 'walnut' } });
  await page.addInitScript(() => {
    const visible: string[] = [];
    Reflect.set(window, '__draftVisibleEstimates', visible);
    new MutationObserver(() => {
      const total = document.querySelector('.total');
      if (total && getComputedStyle(total).visibility !== 'hidden') visible.push(total.textContent ?? '');
    }).observe(document, { childList: true, subtree: true, attributes: true });
  });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/configure');
  await expect(page.getByRole('radio', { name: 'Walnut', exact: true })).toBeChecked();
  await expect(page.locator('.total')).toContainText('$439');
  const estimates = await page.evaluate(() => Reflect.get(window, '__draftVisibleEstimates') as string[]);
  expect(estimates.length).toBeGreaterThan(0);
  expect(estimates.every(value => value.includes('$439'))).toBe(true);
  expect(errors).toEqual([]);
});

test('invalid, obsolete and injected-price drafts stay untouched until explicit discard', async ({ page }) => {
  await page.goto('/');
  for (const raw of ['{', JSON.stringify({ ...defaultConfiguration, catalogVersion: 'old' }), JSON.stringify({ ...defaultConfiguration, priceCents: 1 })]) {
    await page.goto('/');
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: DRAFT_KEY, raw });
    await page.goto('/configure');
    await expect(page.getByText(/This saved draft is invalid/)).toBeVisible();
    await page.getByRole('radio', { name: 'Ash', exact: true }).check();
    await page.waitForTimeout(450);
    expect(await page.evaluate(key => localStorage.getItem(key), DRAFT_KEY)).toBe(raw);
    await page.getByRole('button', { name: 'Discard saved draft', exact: true }).click();
    expect(await stored(page)).toEqual(defaultConfiguration);
    await expect(page.getByRole('radio', { name: 'Oak', exact: true })).toBeChecked();
  }
});

for (const mode of ['blocked', 'quota'] as const) {
  test(`${mode} storage keeps configuration, pricing and quote fields usable`, async ({ page }) => {
    await page.addInitScript(mode => {
      if (mode === 'blocked') Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
      else Storage.prototype.setItem = () => { throw new DOMException('Quota', 'QuotaExceededError'); };
    }, mode);
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('/configure');
    await page.getByRole('button', { name: '120 × 60 cm', exact: true }).click();
    await page.getByRole('checkbox', { name: /Cable tray/ }).check();
    await expect(page.locator('.total')).toContainText('$369');
    await expect(page.getByText(/Local saving is unavailable/)).toBeVisible();
    await page.getByLabel('Name', { exact: true }).fill('Demo visitor');
    await page.getByRole('button', { name: 'Reset configuration', exact: true }).click();
    await expect(page.locator('.total')).toContainText('$399');
    expect(errors).toEqual([]);
  });
}

test('rapid edits coalesce into one debounced write and a fast refresh flushes the latest edit', async ({ page }) => {
  await page.addInitScript(key => {
    const original = Storage.prototype.setItem;
    Reflect.set(window, '__draftWrites', 0);
    Storage.prototype.setItem = function(name, value) {
      if (name === key) Reflect.set(window, '__draftWrites', Reflect.get(window, '__draftWrites') + 1);
      return original.call(this, name, value);
    };
  }, DRAFT_KEY);
  await page.goto('/configure');
  await expect(page.getByText('Desk draft saved on this browser.', { exact: true })).toBeVisible();
  const baseline = await page.evaluate(() => Reflect.get(window, '__draftWrites') as number);
  await page.evaluate(() => {
    (document.querySelector('input[value="walnut"]') as HTMLInputElement).click();
    const size = [...document.querySelectorAll('button')].find(button => button.textContent === '120 × 60 cm')!;
    size.click();
    const tray = [...document.querySelectorAll('label')].find(label => label.textContent?.includes('Cable tray'))!;
    (tray.querySelector('input') as HTMLInputElement).click();
  });
  await page.waitForTimeout(80);
  expect(await page.evaluate(() => Reflect.get(window, '__draftWrites'))).toBe(baseline);
  await expect.poll(() => stored(page)).toEqual({ ...defaultConfiguration, sizeId: '120x60', finishId: 'walnut', accessoryIds: ['cable-tray'] });
  expect(await page.evaluate(() => Reflect.get(window, '__draftWrites'))).toBe(baseline + 1);
  await page.getByRole('radio', { name: 'Ash', exact: true }).check();
  await page.reload();
  await expect(page.getByRole('radio', { name: 'Ash', exact: true })).toBeChecked();
  await expect(page.locator('.total')).toContainText('$369');
});
