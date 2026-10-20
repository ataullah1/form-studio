import { test, expect } from './fixtures';
const origin = 'https://formstudioo.vercel.app';

test('product story is usable without JavaScript and FAQ explains the demo honestly', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage(); await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Built around you.');
    await expect(page.locator('#customization')).toContainText('120 × 60 cm');
    await expect(page.locator('#customization')).toContainText('$399');
    await expect(page.locator('#details')).not.toContainText('Planned');
    await page.getByText('Can I buy this desk?', { exact: true }).click();
    await expect(page.locator('#faq details[open]')).toContainText('no furniture is offered for sale');
    await expect(page.locator('canvas')).toHaveCount(0);
    await page.getByRole('link', { name: 'Build your desk' }).first().click();
    await expect(page).toHaveURL(/\/configure$/);
    await expect(page.getByRole('region', { name: 'Configuration summary' })).toContainText('$399');
  } finally { await context.close(); }
});

test('story navigation reaches the live configurator and enquiry without starting 3D', async ({ page }) => {
  let sceneChunks = 0; page.on('request', r => { if (/three|react-three/.test(r.url())) sceneChunks++; });
  await page.goto('/');
  await page.getByRole('link', { name: 'How it works', exact: true }).click(); await expect(page).toHaveURL(/#how-it-works$/);
  await page.getByRole('link', { name: 'Request a quote' }).click(); await expect(page).toHaveURL(/\/configure#quote-draft$/);
  await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0); expect(sceneChunks).toBe(0);
});

test('public metadata and social image use the canonical production origin', async ({ page, request }) => {
  for (const path of ['/', '/configure']) {
    await page.goto(path);
    expect(new URL((await page.locator('link[rel="canonical"]').getAttribute('href'))!).href).toBe(origin + path);
    expect(new URL((await page.locator('meta[property="og:url"]').getAttribute('content'))!).href).toBe(origin + path);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    const image = await page.locator('meta[property="og:image"]').first().getAttribute('content'); expect(image).toMatch(/^https:\/\/formstudioo\.vercel\.app\/opengraph-image/);
  }
  const image = await request.get('/opengraph-image'); expect(image.status()).toBe(200); expect(image.headers()['content-type']).toContain('image/png');
  const data = await image.body(); expect(data.readUInt32BE(16)).toBe(1200); expect(data.readUInt32BE(20)).toBe(630); expect(data.length).toBeLessThan(300000);
});

test('sitemap lists only public pages and generated/admin pages stay noindex', async ({ page, request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])).toEqual([origin + '/', origin + '/configure']);
  const robots = await (await request.get('/robots.txt')).text(); expect(robots).toContain('Disallow: /admin'); expect(robots).toContain('Disallow: /api/'); expect(robots).not.toContain('Disallow: /s/');
  await page.goto('/admin/login'); await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.goto('/s/invalid'); await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
});

test('story fits desktop and mobile widths and respects reduced motion', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  for (const width of [1440, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('.story-invitation .button')).toHaveAttribute('href', '/configure');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.poster-frame').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(errors).toEqual([]);
});
