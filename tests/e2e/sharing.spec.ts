import { randomBytes, randomUUID } from 'node:crypto';
import { Client } from 'pg';
import { test, expect } from './fixtures';
import { defaultConfiguration } from '../../src/lib/catalog';
import { DRAFT_KEY } from '../../src/features/configurator/local-draft';

const testURL = process.env.TEST_DATABASE_URL;
test.skip(!testURL, 'Requires isolated local Postgres: see docs/SHARING.md');
async function admin<T>(work: (db: Client) => Promise<T>) {
  const url = new URL(testURL!);
  if (url.hostname !== '127.0.0.1' || url.pathname !== '/form_studio_step7') throw new Error('Database tests require the disposable local form_studio_step7 database');
  const db = new Client({ connectionString: testURL });
  await db.connect(); try { return await work(db); } finally { await db.end(); }
}
test.beforeEach(async () => { await admin(db => db.query('TRUNCATE app.rate_buckets')); });
const headers = (key = randomUUID()) => ({ 'Content-Type': 'application/json', 'Idempotency-Key': key });

test('save persists across browsers; shared source beats drafts and editing creates a local copy', async ({ page, browser }) => {
  await page.goto('/configure');
  await page.getByRole('radio', { name: 'Walnut', exact: true }).check();
  await page.getByRole('button', { name: '160 × 80 cm', exact: true }).click();
  await page.getByRole('checkbox', { name: /Desk lamp/ }).check();
  await page.getByLabel('Name', { exact: true }).fill('Fictional private visitor');
  await page.getByRole('button', { name: 'Share design', exact: true }).click();
  const link = page.getByLabel('Share link', { exact: true });
  await expect(link).toBeVisible();
  const url = await link.inputValue();
  const other = await browser.newContext(); const second = await other.newPage();
  await second.route('**/_vercel/insights/script.js', route => route.fulfill({ body: '', contentType: 'application/javascript' }));
  await second.goto('http://127.0.0.1:4173/');
  await second.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: DRAFT_KEY, value: defaultConfiguration });
  await second.goto(url);
  const summary = second.getByRole('region', { name: 'Saved design summary' });
  await expect(summary).toContainText('Walnut'); await expect(summary).toContainText('160 × 80'); await expect(summary).toContainText('Desk lamp');
  await expect(summary.locator('.detail-estimate')).toContainText('$534');
  await expect(second.getByRole('button', { name: 'Reset configuration' })).toHaveCount(0);
  expect(await second.evaluate(key => JSON.parse(localStorage.getItem(key)!), DRAFT_KEY)).toEqual(defaultConfiguration);
  await second.getByRole('link', { name: 'Edit a copy' }).click();
  await expect(second.getByRole('radio', { name: 'Walnut', exact: true })).toBeChecked();
  await expect(second.getByRole('button', { name: '160 × 80 cm', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await second.waitForTimeout(450);
  expect(await second.evaluate(key => JSON.parse(localStorage.getItem(key)!), DRAFT_KEY)).toEqual(defaultConfiguration);
  await second.getByRole('radio', { name: 'Ash', exact: true }).check();
  await expect.poll(() => second.evaluate(key => JSON.parse(localStorage.getItem(key)!).finishId, DRAFT_KEY)).toBe('ash');
  const publicResponse = await page.request.get(url.replace('/s/', '/api/configurations/'));
  const data = await publicResponse.json();
  expect(data.configuration.finishId).toBe('walnut'); expect(data.estimatedTotalCents).toBe(53400);
  expect(Object.keys(data).sort()).toEqual(['publicId', 'configuration', 'schemaVersion', 'catalogVersion', 'estimatedTotalCents', 'createdAt'].sort());
  expect(JSON.stringify(data)).not.toMatch(/Fictional|email|fingerprint|idempotency/i);
  await other.close();
});

test('concurrent identical retries create one row; conflicting payload gets 409; database rejects mutation', async ({ request }) => {
  const key = randomUUID();
  const responses = await Promise.all(Array.from({ length: 6 }, () => request.post('/api/configurations', { headers: headers(key), data: defaultConfiguration })));
  expect(responses.map(r => r.status()).filter(status => status === 201)).toHaveLength(1);
  const results = await Promise.all(responses.map(r => r.json()));
  expect(new Set(results.map(r => r.publicId)).size).toBe(1);
  const conflicting = await request.post('/api/configurations', { headers: headers(key), data: { ...defaultConfiguration, finishId: 'walnut' } });
  expect(conflicting.status()).toBe(409);
  const row = await admin(db => db.query('SELECT * FROM app.shared_configurations WHERE idempotency_key=$1', [key]));
  expect(row.rowCount).toBe(1); expect(row.rows[0].estimated_total_cents).toBe(39900);
  await expect(admin(db => db.query('UPDATE app.shared_configurations SET estimated_total_cents=1 WHERE idempotency_key=$1', [key]))).rejects.toThrow(/immutable/);
});

test('malformed, oversized, injected-price and cross-origin saves fail without public data leakage', async ({ request }) => {
  for (const input of [{ ...defaultConfiguration, estimatedTotalCents: 1 }, { ...defaultConfiguration, email: 'fictional@example.com' }, { ...defaultConfiguration, sizeId: 'bogus' }, { ...defaultConfiguration, accessoryIds: ['lamp', 'lamp'] }]) {
    expect((await request.post('/api/configurations', { headers: headers(), data: input })).status()).toBe(400);
  }
  expect((await request.post('/api/configurations', { headers: headers(), data: 'x'.repeat(5000) })).status()).toBe(413);
  expect((await request.post('/api/configurations', { headers: headers(), data: '{' })).status()).toBe(400);
  expect((await request.post('/api/configurations', { headers: { ...headers(), Origin: 'https://unrelated.example' }, data: defaultConfiguration })).status()).toBe(403);
  expect((await request.post('/api/configurations', { headers: { 'Content-Type': 'application/json' }, data: defaultConfiguration })).status()).toBe(400);
});

test('shared atomic limits cap concurrent requests and cannot be bypassed by spoofed local IP headers', async ({ request }) => {
  const responses = await Promise.all(Array.from({ length: 16 }, (_, i) => request.post('/api/configurations', { headers: { ...headers(), 'x-forwarded-for': `192.0.2.${i + 1}` }, data: defaultConfiguration })));
  expect(responses.filter(response => response.status() === 201)).toHaveLength(10);
  expect(responses.filter(response => response.status() === 429)).toHaveLength(6);
  expect(responses.find(response => response.status() === 429)!.headers()['retry-after']).toBe('60');
  await admin(async db => {
    await db.query('TRUNCATE app.rate_buckets');
    await db.query("INSERT INTO app.rate_buckets(key,window_start,count) VALUES('share:global',date_trunc('minute',CURRENT_TIMESTAMP),99)");
  });
  const globallyLimited = await Promise.all(Array.from({ length: 4 }, () => request.post('/api/configurations', { headers: headers(), data: defaultConfiguration })));
  expect(globallyLimited.filter(response => response.status() === 201)).toHaveLength(1);
  expect(globallyLimited.filter(response => response.status() === 429)).toHaveLength(3);
});

test('unknown and unsupported snapshots show friendly states and never load a local draft instead', async ({ page, request }) => {
  expect((await request.get('/api/configurations/invalid')).status()).toBe(404);
  await page.goto(`/s/${randomBytes(24).toString('base64url')}`);
  await expect(page.getByRole('heading', { name: 'Shared design not found.' })).toBeVisible();
  const id = randomBytes(24).toString('base64url');
  await admin(db => db.query('INSERT INTO app.shared_configurations(public_id,idempotency_key,fingerprint,configuration,schema_version,catalog_version,estimated_total_cents) VALUES($1,$2,$3,$4,1,$5,39900)', [id, randomUUID(), '0'.repeat(64), JSON.stringify(defaultConfiguration), 'retired']));
  expect((await request.get(`/api/configurations/${id}`)).status()).toBe(410);
  await page.goto(`/s/${id}`);
  await expect(page.getByRole('heading', { name: 'This design version is unavailable.' })).toBeVisible();
  await expect(page.getByRole('radio')).toHaveCount(0);
});

test('runtime permissions are narrow and browser Data API roles cannot read application tables', async () => {
  const result = await admin(db => db.query("SELECT has_schema_privilege('anon','app','USAGE') anon_schema, has_table_privilege('authenticated','app.shared_configurations','SELECT') auth_read, has_table_privilege('form_studio_runtime','app.shared_configurations','UPDATE') runtime_update, has_table_privilege('form_studio_runtime','app.shared_configurations','INSERT') runtime_insert"));
  expect(result.rows[0]).toEqual({ anon_schema: false, auth_read: false, runtime_update: false, runtime_insert: true });
});

test('an unconfirmed save preserves the design and retries the same key without duplicating the committed row', async ({ page }) => {
  await page.goto('/configure');
  await page.getByRole('radio', { name: 'Walnut', exact: true }).check();
  let savedId = ''; const keys: string[] = [];
  await page.route('**/api/configurations', async route => {
    keys.push(route.request().headers()['idempotency-key']);
    if (keys.length === 1) {
      const response = await route.fetch();
      expect(response.status()).toBe(201);
      savedId = (await response.json()).publicId;
      await route.fulfill({ status: 503, json: { error: 'Save confirmation unavailable. Please retry.' } });
    } else await route.continue();
  });
  await page.getByRole('button', { name: 'Share design', exact: true }).click();
  await expect(page.getByText('Save confirmation unavailable. Please retry.', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Share link', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('radio', { name: 'Walnut', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Share design', exact: true }).click();
  await expect(page.getByLabel('Share link', { exact: true })).toHaveValue(new RegExp(savedId));
  expect(keys[0]).toBe(keys[1]);
  const rows = await admin(db => db.query('SELECT COUNT(*)::int AS count FROM app.shared_configurations WHERE idempotency_key=$1', [keys[0]]));
  expect(rows.rows[0].count).toBe(1);
});
