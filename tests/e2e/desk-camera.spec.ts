import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { changedInteriorFraction } from './image-comparison';

async function settle(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
}

async function openDesk(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/configure');
  await page.getByRole('button', { name: 'View desk in 3D' }).click();
  await expect(page.getByText('3D desk ready.', { exact: false })).toBeVisible();
  await expect(page.getByText('Oak finish ready', { exact: false })).toBeVisible();
  await settle(page);
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`orbit, bounded zoom and reset work at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openDesk(page);
    const canvas = page.locator('canvas');
    const initial = await canvas.screenshot();
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2 + 120, { steps: 12 });
    await page.mouse.up();
    await settle(page);
    expect((await canvas.screenshot()).equals(initial)).toBe(false);
    await page.getByRole('button', { name: 'Reset view' }).click();
    await settle(page);
    expect((await canvas.screenshot()).equals(initial)).toBe(true);

    for (let i = 0; i < 14; i++) await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await settle(page);
    const closest = await canvas.screenshot();
    expect(closest.equals(initial)).toBe(false);
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    await settle(page);
    expect((await canvas.screenshot()).equals(closest)).toBe(true);

    for (let i = 0; i < 18; i++) await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
    await settle(page);
    const furthest = await canvas.screenshot();
    expect(furthest.equals(closest)).toBe(false);
    await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
    await settle(page);
    expect((await canvas.screenshot()).equals(furthest)).toBe(true);
    await page.getByRole('button', { name: 'Reset view' }).click();
    await settle(page);
    expect((await canvas.screenshot()).equals(initial)).toBe(true);
  });
}

test('portrait/landscape changes reframe a previously orbited and zoomed desk', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openDesk(page);
  const canvas = page.locator('canvas');
  const portrait = await canvas.screenshot();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 80, box.y + box.height / 2 - 40, { steps: 8 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await page.setViewportSize({ width: 844, height: 390 });
  await settle(page);
  const landscapeFit = await canvas.screenshot();
  await page.getByRole('button', { name: 'Reset view' }).click();
  await settle(page);
  expect(await changedInteriorFraction(page, landscapeFit, await canvas.screenshot())).toBeLessThan(0.001);
  await expect(canvas).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(844);
  await page.setViewportSize({ width: 390, height: 844 });
  await settle(page);
  // Last action was reset: the resize must fit the original portrait composition.
  const returned = await canvas.screenshot();
  const interiorChange = await changedInteriorFraction(page, portrait, returned);
  console.log(JSON.stringify({ orientationInteriorChangedFraction: interiorChange, beforeSize: [portrait.readUInt32BE(16), portrait.readUInt32BE(20)], afterSize: [returned.readUInt32BE(16), returned.readUInt32BE(20)] }));
  // Ignore only clipped screenshot edges; a framing regression changes the product interior.
  expect(interiorChange).toBeLessThan(0.001);
  await expect(page.locator('canvas')).toHaveCount(1);
});

test('resting desk stops drawing and navigation releases its WebGL context', async ({ page }) => {
  await page.addInitScript(() => {
    const metrics = { draws: 0, activeContexts: 0 };
    Reflect.set(window, '__deskCameraTestMetrics', metrics);
    const original = HTMLCanvasElement.prototype.getContext;
    const seen = new WeakSet<HTMLCanvasElement>();
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        const result = Reflect.apply(original, this, [type, ...args]);
        if (result && type === 'webgl2' && !seen.has(this)) {
          seen.add(this);
          metrics.activeContexts++;
          this.addEventListener('webglcontextlost', () => { metrics.activeContexts--; }, { once: true });
        }
        return result;
      },
    });
    for (const name of ['drawArrays', 'drawElements']) {
      const originalDraw = Reflect.get(WebGL2RenderingContext.prototype, name);
      Object.defineProperty(WebGL2RenderingContext.prototype, name, {
        value: function(this: WebGL2RenderingContext, ...args: unknown[]) {
          metrics.draws++;
          return Reflect.apply(originalDraw, this, args);
        },
      });
    }
  });
  await openDesk(page);
  const metrics = () => page.evaluate(() => Reflect.get(window, '__deskCameraTestMetrics') as { draws: number; activeContexts: number });
  await expect.poll(async () => (await metrics()).activeContexts).toBe(1);
  // Sampling windows measure actual draw calls; this is not an FPS benchmark.
  await page.waitForTimeout(300);
  const resting = await metrics();
  expect(resting.draws).toBeGreaterThan(0);
  await page.waitForTimeout(500);
  expect((await metrics()).draws).toBe(resting.draws);
  await page.getByRole('link', { name: 'Back to collection' }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect.poll(async () => (await metrics()).activeContexts).toBe(0);
  const exited = await metrics();
  await page.waitForTimeout(300);
  expect((await metrics()).draws).toBe(exited.draws);
});
