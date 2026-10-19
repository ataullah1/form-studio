import { test, expect } from './fixtures';
import { changedInteriorFraction } from './image-comparison';

async function instrumentDraws(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    Reflect.set(window, '__viewerDraws', 0);
    for (const name of ['drawElements', 'drawArrays']) {
      const original = Reflect.get(WebGL2RenderingContext.prototype, name);
      Reflect.set(WebGL2RenderingContext.prototype, name, function(this: WebGL2RenderingContext, ...args: unknown[]) {
        Reflect.set(window, '__viewerDraws', Reflect.get(window, '__viewerDraws') + 1);
        return Reflect.apply(original, this, args);
      });
    }
  });
}

test('lighting preserves configuration/camera and finite camera transitions settle on demand', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await instrumentDraws(page);
  await page.goto('/configure');
  await page.getByRole('checkbox', { name: /Desk lamp/ }).check();
  await page.getByRole('button', { name: 'View desk in 3D' }).click();
  await expect(page.getByText('Oak finish ready', { exact: false })).toBeVisible();
  const canvas = page.locator('canvas');
  const summary = page.getByRole('region', { name: 'Configuration summary' });
  const product = (await summary.textContent())!;
  await page.waitForTimeout(350);
  const day = await canvas.screenshot();
  await page.getByRole('button', { name: 'Night', exact: true }).click();
  await expect(page.getByText('Night studio · Desk lamp on', { exact: true })).toBeVisible();
  const night = await canvas.screenshot();
  expect(night.equals(day)).toBe(false);
  await expect(summary).toHaveText(product);
  await page.getByRole('button', { name: 'Day', exact: true }).click();
  expect(await changedInteriorFraction(page, day, await canvas.screenshot())).toBeLessThan(0.001);
  for (const name of ['Front view', 'Detail view', 'Reset view']) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.waitForTimeout(450);
    const draws = await page.evaluate(() => Reflect.get(window, '__viewerDraws') as number);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => Reflect.get(window, '__viewerDraws'))).toBe(draws);
  }
  expect(await changedInteriorFraction(page, day, await canvas.screenshot())).toBeLessThan(0.001);
  await expect(summary).toHaveText(product);
  // Move the viewer fully offscreen and change its lighting through the DOM.
  await page.locator('#quote-draft').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const paused = await page.evaluate(() => Reflect.get(window, '__viewerDraws') as number);
  await page.getByRole('button', { name: 'Night', exact: true }).evaluate(button => (button as HTMLButtonElement).click());
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => Reflect.get(window, '__viewerDraws'))).toBe(paused);
  await canvas.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, '__viewerDraws') as number)).toBeGreaterThan(paused);
  await page.getByRole('checkbox', { name: /Desk lamp/ }).uncheck();
  await expect(page.getByText('Night studio · Ambient light', { exact: true })).toBeVisible();
  await expect(summary.locator('.total')).toContainText('$399');
});

test.describe('emulated mobile gestures', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test('touch orbit/pinch releases controls, outside scrolling and quote draft remain usable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto('/configure');
    await page.getByRole('button', { name: 'View desk in 3D' }).click();
    await expect(page.getByText('Oak finish ready', { exact: false })).toBeVisible();
    const canvas = page.locator('canvas'); await canvas.scrollIntoViewIfNeeded();
    const initial = await canvas.screenshot();
    const box = (await canvas.boundingBox())!;
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 65, y: y + 30, id: 1 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x - 25, y, id: 1 }, { x: x + 25, y, id: 2 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 55, y, id: 1 }, { x: x + 55, y, id: 2 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    expect((await canvas.screenshot()).equals(initial)).toBe(false);
    await page.getByRole('button', { name: 'Front view', exact: true }).tap();
    await page.getByRole('button', { name: 'Detail view', exact: true }).tap();
    await page.getByRole('button', { name: 'Reset view', exact: true }).tap();
    expect(await changedInteriorFraction(page, initial, await canvas.screenshot())).toBeLessThan(0.001);
    await page.getByRole('button', { name: 'Night', exact: true }).tap();
    await expect(page.getByRole('button', { name: 'Night', exact: true })).toHaveAttribute('aria-pressed', 'true');
    // A touch scroll in the specification panel must move the document.
    await page.getByRole('heading', { name: 'Studio Desk 01', exact: true }).scrollIntoViewIfNeeded();
    const beforeScroll = await page.evaluate(() => scrollY);
    await cdp.send('Input.synthesizeScrollGesture', { x: 195, y: 650, yDistance: -220, speed: 700, gestureSourceType: 'touch' });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(beforeScroll);
    await page.getByLabel('Name', { exact: true }).fill('Demo visitor');
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Demo visitor');
    await expect(page.getByRole('region', { name: 'Configuration summary' }).locator('.total')).toContainText('$399');
    expect(errors).toEqual([]);
    await cdp.detach();
  });
});
