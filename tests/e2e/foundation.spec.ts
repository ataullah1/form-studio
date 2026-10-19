import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';

function captureErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  return errors;
}

async function startScene(page: Page) {
  await page.getByRole('button', { name: 'View desk in 3D' }).click();
  await expect(page.getByText('3D desk ready.', { exact: false })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(1);
}

test('landing and initial configurator defer the Three renderer until requested', async ({ page }) => {
  const errors = captureErrors(page);
  const rendererRequests: string[] = [];
  const responses: Promise<void>[] = [];
  page.on('response', response => {
    if (response.url().includes('/_next/static/') && response.url().endsWith('.js')) {
      responses.push(response.text().then(body => {
        if (body.includes('THREE.WebGLRenderer')) rendererRequests.push(response.url());
      }));
    }
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('space to think');
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('link', { name: 'Make it yours' }).click();
  await expect(page.getByRole('button', { name: 'View desk in 3D' })).toBeVisible();
  await Promise.all(responses);
  expect(rendererRequests).toEqual([]);
  await startScene(page);
  await Promise.all(responses);
  expect(rendererRequests.length).toBeGreaterThan(0);
  await expect(page.locator('canvas')).toBeVisible();
  const drawingBufferReady = await page.locator('canvas').evaluate(canvas => {
    const gl = (canvas as HTMLCanvasElement).getContext('webgl2');
    return !!gl && gl.drawingBufferWidth > 0 && gl.drawingBufferHeight > 0;
  });
  expect(drawingBufferReady).toBe(true);
  expect(errors).toEqual([]);
});

test('without WebGL, schematic, summary and editable quote draft remain available', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return type === 'webgl' || type === 'webgl2' ? null : Reflect.apply(original, this, [type, ...args]);
      },
    });
  });
  const errors = captureErrors(page);
  await page.goto('/configure');
  await page.getByLabel('Name', { exact: true }).fill('Demo Workspace');
  await page.getByRole('button', { name: 'View desk in 3D' }).click();
  await expect(page.getByText('3D is unavailable.', { exact: false })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Studio Desk 01 — 2D dimension schematic' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Default configuration summary' })).toContainText('$399');
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Demo Workspace');
  await page.getByLabel('Email', { exact: true }).fill('demo@example.com');
  await expect(page.getByRole('button', { name: /Demo quote submission/ })).toBeDisabled();
  expect(errors).toEqual([]);
});

test('renderer context loss switches to 2D without losing draft fields', async ({ page }) => {
  await page.goto('/configure');
  await page.getByLabel('Name', { exact: true }).fill('Fictional Demo');
  await startScene(page);
  await page.locator('canvas').evaluate(canvas => {
    const gl = (canvas as HTMLCanvasElement).getContext('webgl2');
    const extension = gl?.getExtension('WEBGL_lose_context');
    if (!extension) throw new Error('Test browser does not support context-loss simulation');
    extension.loseContext();
  });
  await expect(page.getByText('3D is unavailable.', { exact: false })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Fictional Demo');
});

test('a failed lazy scene chunk is contained by the viewer boundary', async ({ page }) => {
  await page.goto('/configure');
  await expect(page.getByRole('button', { name: 'View desk in 3D' })).toBeVisible();
  await page.getByLabel('Project message', { exact: false }).fill('Fictional draft stays here.');
  await page.route('**/_next/static/**', route => route.abort());
  await page.getByRole('button', { name: 'View desk in 3D' }).click();
  await expect(page.getByText('3D is unavailable.', { exact: false })).toBeVisible({ timeout: 25000 });
  await expect(page.getByLabel('Project message', { exact: false })).toHaveValue('Fictional draft stays here.');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('workspace');
});

test('repeated navigation creates one Canvas and tears it down on exit', async ({ page }) => {
  const errors = captureErrors(page);
  for (let i = 0; i < 3; i++) {
    await page.goto('/configure');
    await startScene(page);
    await page.getByRole('link', { name: 'Back to collection' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('space to think');
    await expect(page.locator('canvas')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

for (const width of [360, 390, 768, 1440]) {
  test(`HTML shell and 3D desk fit ${width}px viewport`, async ({ page }) => {
    const errors = captureErrors(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/configure');
    await startScene(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await expect(page.getByRole('region', { name: 'Default configuration summary' })).toBeVisible();
    await expect(page.getByLabel('Name', { exact: true })).toBeEditable();
    expect(errors).toEqual([]);
  });
}

test('server HTML still exposes product facts and draft fields without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('space to think');
  await page.getByRole('link', { name: 'Make it yours' }).click();
  await expect(page.getByRole('img', { name: 'Studio Desk 01 — 2D dimension schematic' })).toBeVisible();
  await page.getByLabel('Name', { exact: true }).fill('Fictional offline draft');
  await expect(page.getByRole('region', { name: 'Default configuration summary' })).toContainText('$399');
  await context.close();
});


test('slow scene download shows a loading state while HTML remains usable', async ({ page }) => {
  await page.goto('/configure');
  await expect(page.getByRole('button', { name: 'View desk in 3D' })).toBeVisible();
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/_next/static/**', async route => { await gate; await route.continue(); });
  await page.getByRole('button', { name: 'View desk in 3D' }).click();
  try {
    await expect(page.getByText('Loading the 3D module…')).toBeVisible();
    await expect(page.getByText('Starting 3D renderer…')).toBeVisible();
    await page.getByLabel('Name', { exact: true }).fill('Fictional loading draft');
  } finally { release(); }
  await expect(page.getByText('3D desk ready.', { exact: false })).toBeVisible();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Fictional loading draft');
});

test('renderer creation failure is contained without hiding the HTML shell', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    let probes = 0;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        // Let the capability probe pass, then fail the actual Three renderer.
        if (type === 'webgl2' && ++probes > 1) return null;
        return Reflect.apply(original, this, [type, ...args]);
      },
    });
  });
  await page.goto('/configure');
  await page.getByRole('button', { name: 'View desk in 3D' }).click();
  await expect(page.getByText('3D is unavailable.', { exact: false })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Default configuration summary' })).toContainText('$399');
  await page.getByLabel('Name', { exact: true }).fill('Fictional renderer failure draft');
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Fictional renderer failure draft');
});
