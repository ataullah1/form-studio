import { mkdirSync, writeFileSync } from 'node:fs';
import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';
async function instrument(page: Page) {
  await page.addInitScript(() => {
    const textures = new Set<WebGLTexture>(); const geometries = new Set<WebGLBuffer>();
    const metrics = { textures: 0, buffers: 0, draws: 0, batches: [] as { calls: number; triangles: number }[], decoded: [] as number[] };
    Reflect.set(window, '__performanceAudit', metrics);
    const proto = WebGL2RenderingContext.prototype;
    const originalTexture = proto.createTexture, removeTexture = proto.deleteTexture;
    proto.createTexture = function() { const value = originalTexture.call(this); if (value) textures.add(value); metrics.textures = textures.size; return value; };
    proto.deleteTexture = function(value) { if (value) textures.delete(value); metrics.textures = textures.size; return removeTexture.call(this, value); };
    const originalBuffer = proto.createBuffer, removeBuffer = proto.deleteBuffer;
    proto.createBuffer = function() { const value = originalBuffer.call(this); if (value) geometries.add(value); metrics.buffers = geometries.size; return value; };
    proto.deleteBuffer = function(value) { if (value) geometries.delete(value); metrics.buffers = geometries.size; return removeBuffer.call(this, value); };
    let batch: { calls: number; triangles: number } | null = null;
    for (const name of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced'] as const) {
      const original = Reflect.get(proto, name);
      Reflect.set(proto, name, function(this: WebGL2RenderingContext, ...args: number[]) {
        if (!batch) { batch = { calls: 0, triangles: 0 }; setTimeout(() => { if (batch) metrics.batches.push(batch); batch = null; }, 0); }
        metrics.draws++; batch.calls++;
        const count = name.startsWith('drawElements') ? args[1] : args[2];
        const instances = name === 'drawElementsInstanced' ? args[4] : name === 'drawArraysInstanced' ? args[3] : 1;
        batch.triangles += (args[0] === 4 ? count / 3 : args[0] === 5 || args[0] === 6 ? Math.max(0, count - 2) : 0) * instances;
        return Reflect.apply(original, this, args);
      });
    }
    const decode = window.createImageBitmap.bind(window);
    window.createImageBitmap = (async (...args: Parameters<typeof createImageBitmap>) => { const value = await Reflect.apply(decode, window, args); metrics.decoded.push(value.width); return value; }) as typeof createImageBitmap;
  });
}
const audit = (page: Page) => page.evaluate(() => Reflect.get(window, '__performanceAudit') as { textures: number; buffers: number; draws: number; batches: { calls: number; triangles: number }[]; decoded: number[] });
async function ready(page: Page) { await expect(page.getByText('Oak finish ready', { exact: false })).toBeVisible(); await page.waitForTimeout(350); }

test.use({ deviceScaleFactor: 2 });

test('production budgets, low quality and repeated accessory changes preserve bounded resources', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await instrument(page);
  await page.goto('/configure');
  const initial = await page.evaluate(() => performance.getEntriesByType('resource').map(item => { const r = item as PerformanceResourceTiming; return { path: new URL(r.name).pathname, bytes: r.encodedBodySize }; }));
  expect(initial.some(r => r.path.includes('/textures/wood/'))).toBe(false);
  const summary = page.getByRole('region', { name: 'Configuration summary' }); const originalSummary = await summary.textContent();
  await page.getByRole('button', { name: 'View desk in 3D' }).click(); await ready(page);
  const balanced = await audit(page);
  const firstSceneResources = await page.evaluate(() => performance.getEntriesByType('resource').map(item => { const r = item as PerformanceResourceTiming; return { path: new URL(r.name).pathname, bytes: r.encodedBodySize }; }));
  const balancedCanvas = await page.locator('canvas').evaluate(el => { const c = el as HTMLCanvasElement; return { width: c.width, cssWidth: c.clientWidth }; });
  for (const name of ['Desk lamp', 'Monitor stand', 'Cable tray']) await page.getByRole('checkbox', { name: new RegExp(name) }).check();
  await page.locator('canvas').scrollIntoViewIfNeeded(); await page.waitForTimeout(350);
  const full = await audit(page); const resourceBaseline = { textures: full.textures, buffers: full.buffers };
  for (let i = 0; i < 12; i++) {
    for (const name of ['Desk lamp', 'Monitor stand', 'Cable tray']) await page.getByRole('checkbox', { name: new RegExp(name) }).setChecked(i % 2 !== 0);
    await page.locator('canvas').scrollIntoViewIfNeeded(); await page.waitForTimeout(100);
  }
  await page.locator('canvas').scrollIntoViewIfNeeded(); await page.waitForTimeout(350);
  const repeated = await audit(page); expect(repeated.textures).toBe(resourceBaseline.textures); expect(repeated.buffers).toBeLessThanOrEqual(resourceBaseline.buffers);
  for (const name of ['Desk lamp', 'Monitor stand', 'Cable tray']) await page.getByRole('checkbox', { name: new RegExp(name) }).uncheck();
  await page.getByRole('button', { name: 'Low', exact: true }).click(); await ready(page);
  const low = await audit(page); expect(low.decoded.slice(-3)).toEqual([512,512,512]);
  expect(await summary.textContent()).toBe(originalSummary);
  const lowCanvas = await page.locator('canvas').evaluate(el => { const canvas = el as HTMLCanvasElement; return { pixels: canvas.width * canvas.height, cssWidth: canvas.clientWidth, width: canvas.width }; }); expect(lowCanvas.width).toBeLessThanOrEqual(lowCanvas.cssWidth + 1);
  for (let i = 0; i < 4; i++) { await page.getByRole('button', { name: 'Balanced', exact: true }).click(); await ready(page); await page.getByRole('button', { name: 'Low', exact: true }).click(); await ready(page); }
  expect((await audit(page)).textures).toBeLessThanOrEqual(low.textures);
  await page.locator('canvas').scrollIntoViewIfNeeded(); await page.waitForTimeout(450); const idle = (await audit(page)).draws; await page.waitForTimeout(350); expect((await audit(page)).draws).toBe(idle);
  // Exercise real visibility events without pretending this is a physical phone lifecycle test.
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.getByRole('button', { name: 'Night', exact: true }).evaluate(el => (el as HTMLButtonElement).click()); await page.waitForTimeout(200); expect((await audit(page)).draws).toBe(idle);
  await page.evaluate(() => { delete (document as unknown as Record<string, unknown>).hidden; document.dispatchEvent(new Event('visibilitychange')); }); await expect.poll(async () => (await audit(page)).draws).toBeGreaterThan(idle);
  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(item => { const r = item as PerformanceResourceTiming; return { path: new URL(r.name).pathname, bytes: r.encodedBodySize }; }));
  const textures = resources.filter(r => r.path.includes('/textures/wood/')); const beforePaths = new Set(initial.map(r => r.path));
  const sceneTransfer = firstSceneResources.filter(r => !beforePaths.has(r.path) && (r.path.endsWith('.js') || r.path.includes('/textures/wood/'))).reduce((sum, r) => sum + r.bytes, 0);
  const peakCalls = Math.max(...full.batches.map(b => b.calls)); const peakTriangles = Math.max(...full.batches.map(b => b.triangles));
  expect(peakCalls).toBeLessThanOrEqual(100); expect(peakTriangles).toBeLessThanOrEqual(100000); expect(sceneTransfer).toBeLessThanOrEqual(5 * 1024 * 1024);
  const auditDirectory=process.env.PERFORMANCE_AUDIT_DIR??'docs/evidence/step-11';
  mkdirSync(auditDirectory, { recursive: true });
  writeFileSync(auditDirectory+'/production-audit.json', JSON.stringify({ browserName, userAgent: await page.evaluate(() => navigator.userAgent), viewport: { width:390,height:844 }, devicePixelRatio: await page.evaluate(() => devicePixelRatio), softwareWebGL: true, initialEncodedBytes: initial.reduce((sum,r)=>sum+r.bytes,0), sceneEncodedBytes: sceneTransfer, firstSceneTextureEncodedBytes: firstSceneResources.filter(r => r.path.includes('/textures/wood/')).reduce((sum,r)=>sum+r.bytes,0), totalTextureEncodedBytesIncludingQualitySwitches: textures.reduce((sum,r)=>sum+r.bytes,0), transferNote: 'encodedBodySize from localhost production HTTP responses; excludes document and not a throttled CDN benchmark', peakDrawCallsIncludingShadowPasses: peakCalls, peakSubmittedTrianglesIncludingShadowPasses: peakTriangles, batchNote: 'WebGL draws grouped per event-loop task; conservative main+shadow submission count, not unique geometry or an FPS benchmark', balancedCanvas, balanced, allAccessories: full, repeatedAccessories: repeated, low, lowCanvas, idleDrawsStopped:true, syntheticVisibilityResumePassed:true }, null, 2));
});
