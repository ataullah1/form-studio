import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

async function openMaterials(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/configure');
  await page.getByRole('button', { name: 'View desk in 3D' }).click();
  await expect(page.getByText('Oak finish ready', { exact: false })).toBeVisible();
}

async function selectFinish(page: Page, label: string) {
  await page.getByRole('radio', { name: label, exact: true }).check();
  await expect(page.getByText(`${label} finish ready`, { exact: false })).toBeVisible();
}

test('all six finish/frame combinations agree with the summary and preserve future disabled controls', async ({ page }) => {
  await openMaterials(page);
  for (const finish of ['Oak', 'Walnut', 'Ash']) {
    await selectFinish(page, finish);
    for (const frame of ['White', 'Black']) {
      await page.getByRole('button', { name: frame, exact: true }).click();
      await expect(page.getByRole('button', { name: frame, exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('radio', { name: finish, exact: true })).toBeChecked();
      const summary = page.getByRole('region', { name: 'Configuration summary' });
      await expect(summary).toContainText(`${finish} finish`);
      await expect(summary).toContainText(`${frame} frame`);
      await expect(summary.locator('.total')).toContainText(finish === 'Walnut' ? '$439' : '$399');
    }
  }
  await expect(page.getByRole('button', { name: '120 × 60 cm', exact: true })).toBeEnabled();
  await expect(page.getByRole('checkbox', { name: /Desk lamp/ })).toBeEnabled();
  await expect(page.getByRole('button', { name: /Share design/ })).toBeEnabled();
  await expect(page.getByRole('button', { name: /Send demo request/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Use 2D view' }).click();
  await page.getByRole('radio', { name: 'Oak', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Walnut', exact: true })).toBeChecked();
  await expect(page.locator('.schematic')).toContainText('Walnut / Black');
  await expect(page.getByRole('region', { name: 'Configuration summary' })).toContainText('$439');
});

test('failed material maps show a neutral surface and can be retried without losing the selection', async ({ page }) => {
  await openMaterials(page);
  await page.route('**/textures/wood/walnut/normal.webp*', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.getByRole('radio', { name: 'Walnut', exact: true }).check();
  await expect(page.getByText('Walnut texture unavailable.', { exact: false })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.getByRole('region', { name: 'Configuration summary' })).toContainText('$439');
  await page.getByRole('button', { name: 'White', exact: true }).click();
  await page.unroute('**/textures/wood/walnut/normal.webp*');
  await page.getByRole('button', { name: 'Retry finish' }).click();
  await expect(page.getByText('Walnut finish ready · White frame')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Walnut', exact: true })).toBeChecked();
  await expect(page.getByRole('button', { name: 'Retry finish' })).toHaveCount(0);
});

test('a slow previous selection cannot replace the last requested finish', async ({ page }) => {
  await openMaterials(page);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/textures/wood/walnut/**', async route => { await gate; await route.continue(); });
  await page.getByRole('radio', { name: 'Walnut', exact: true }).check();
  await expect(page.getByText('Loading Walnut finish', { exact: false })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Configuration summary' })).toContainText('$439');
  try {
    await selectFinish(page, 'Ash');
    await expect(page.getByRole('region', { name: 'Configuration summary' })).toContainText('$399');
  } finally { release(); }
  await expect(page.getByText('Ash finish ready', { exact: false })).toBeVisible();
  await selectFinish(page, 'Walnut');
  await expect(page.getByRole('region', { name: 'Configuration summary' })).toContainText('$439');
});

test('thirty finish changes reuse a bounded GPU texture set and never redownload successful maps', async ({ page }) => {
  await page.addInitScript(() => {
    const active = new Set<WebGLTexture>();
    const metrics = { created: 0, deleted: 0, live: 0 };
    Reflect.set(window, '__woodTextureTestMetrics', metrics);
    const create = WebGL2RenderingContext.prototype.createTexture;
    const remove = WebGL2RenderingContext.prototype.deleteTexture;
    WebGL2RenderingContext.prototype.createTexture = function() {
      const texture = create.call(this);
      if (texture) { active.add(texture); metrics.created++; metrics.live = active.size; }
      return texture;
    };
    WebGL2RenderingContext.prototype.deleteTexture = function(texture) {
      if (texture && active.delete(texture)) { metrics.deleted++; metrics.live = active.size; }
      return remove.call(this, texture);
    };
  });
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', request => { if (request.url().includes('/textures/wood/')) requests.push(request.url()); });
  page.on('pageerror', error => errors.push(error.message));
  await openMaterials(page);
  for (const name of ['Walnut', 'Ash', 'Oak']) await selectFinish(page, name);
  const metrics = () => page.evaluate(() => Reflect.get(window, '__woodTextureTestMetrics') as { created: number; live: number });
  await expect.poll(async () => (await metrics()).live).toBeGreaterThanOrEqual(9);
  const before = await metrics();
  const requestsAfterWarmup = requests.length;
  for (let i = 0; i < 30; i++) {
    await selectFinish(page, ['Walnut', 'Ash', 'Oak'][i % 3]);
    await page.getByRole('button', { name: i % 2 ? 'Black' : 'White', exact: true }).click();
  }
  expect(await metrics()).toEqual(before);
  expect(requests).toHaveLength(requestsAfterWarmup);
  expect(new Set(requests).size).toBe(9);
  expect(errors).toEqual([]);
});
