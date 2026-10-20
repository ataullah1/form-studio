import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { Client } from 'pg';
import type { BrowserContext } from '@playwright/test';
import { test, expect } from './fixtures';
import { defaultConfiguration } from '../../src/lib/catalog';
const testURL = process.env.TEST_DATABASE_URL;
test.skip(!testURL, 'Requires isolated local PostgreSQL');
const origin = 'http://127.0.0.1:4173'; const ownerId = '123456789012345678901';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
async function sql(query: string, values: unknown[] = []) {
  const url = new URL(testURL!); if (url.hostname !== '127.0.0.1' || url.pathname !== '/form_studio_step7') throw new Error('Disposable database required');
  const db = new Client({ connectionString: testURL }); await db.connect(); try { return await db.query(query, values); } finally { await db.end(); }
}
async function seed(expired = false) {
  const id = randomUUID(); const reference = randomBytes(24).toString('base64url');
  await sql('INSERT INTO app.quote_requests(id,reference,idempotency_key,fingerprint,configuration,catalog_version,estimated_total_cents) VALUES($1,$2,$3,$4,$5,\'1\',39900)', [id, reference, randomUUID(), 'f'.repeat(64), JSON.stringify(defaultConfiguration)]);
  await sql('INSERT INTO app.quote_contacts(quote_id,name,email,company,country,message,expires_at) VALUES($1,\'Fictional Owner Demo\',\'fictional-admin@example.com\',\'Example\',\'\',\'<script>plain text</script>\',CURRENT_TIMESTAMP + $2::interval)', [id, expired ? '-1 day' : '5 days']);
  return { id, reference };
}
async function signIn(context: BrowserContext, id = ownerId, expired = false) {
  const token = randomBytes(32).toString('base64url');
  await sql('INSERT INTO app.admin_sessions(token_hash,user_id,expires_at) VALUES($1,$2,CURRENT_TIMESTAMP + $3::interval)', [hash(token), id, expired ? '-1 hour' : '8 hours']);
  await context.addCookies([{ name: 'fs_admin_session', value: token, url: origin, httpOnly: true, sameSite: 'Lax' }]); return token;
}
test.beforeEach(async () => { await sql('TRUNCATE app.admin_sessions,app.admin_login_flows,app.rate_buckets'); });
const changeHeaders = { Origin: origin, 'Content-Type': 'application/json' };

test('logged-out, expired and non-allowlisted sessions receive no private quote data', async ({ page, context, request }) => {
  const q = await seed();
  await page.goto(`/admin/quotes/${q.reference}`); await expect(page).toHaveURL(/\/admin\/login(?:\?|$)/); expect(await page.content()).not.toContain('fictional-admin@example.com');
  expect((await request.post(`/api/admin/quotes/${q.reference}/status`, { headers: changeHeaders, data: { status: 'CLOSED', version: 0 } })).status()).toBe(401);
  await signIn(context, '999999999999999999999'); await page.goto(`/admin/quotes/${q.reference}`); await expect(page.locator('main').getByRole('alert')).toContainText('cannot access'); expect(await page.content()).not.toContain('fictional-admin@example.com');
  expect((await context.request.post(`/api/admin/quotes/${q.reference}/status`, { headers: changeHeaders, data: { status: 'CLOSED', version: 0 } })).status()).toBe(403);
  await context.clearCookies(); await signIn(context, ownerId, true); await page.goto(`/admin/quotes/${q.reference}`); await expect(page).toHaveURL(/\/admin\/login(?:\?|$)/); expect(await page.content()).not.toContain('fictional-admin@example.com');
});

test('owner can read original details and paginated status-filtered list with private cache policy', async ({ page, context }) => {
  for (let i = 0; i < 21; i++) await seed();
  const q = await seed(); await signIn(context);
  const response = await page.goto('/admin/quotes?status=NEW');
  expect(response!.headers()['cache-control']).toContain('no-store'); expect(response!.headers()['x-robots-tag']).toContain('noindex');
  await expect(page.locator('.admin-list li')).toHaveCount(20); await page.getByRole('link', { name: 'Next', exact: true }).click(); await expect(page.getByText('Page 2', { exact: true })).toBeVisible();
  let analytics = 0; page.on('request', request => { if (request.url().includes('/_vercel/insights/')) analytics++; });
  await page.goto(`/admin/quotes/${q.reference}`); await expect(page.getByText('fictional-admin@example.com', { exact: true })).toBeVisible(); await expect(page.getByText('<script>plain text</script>', { exact: true })).toBeVisible(); await expect(page.locator('.detail-estimate')).toContainText('$399'); expect(analytics).toBe(0);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).not.toContain('fictional-admin');
});

test('concurrent stale changes produce one transactional history row and reject replay', async ({ context }) => {
  const q = await seed(); await signIn(context);
  const responses = await Promise.all(['REVIEWING', 'CLOSED'].map(status => context.request.post(`/api/admin/quotes/${q.reference}/status`, { headers: changeHeaders, data: { status, version: 0 } })));
  expect(responses.map(r => r.status()).sort()).toEqual([200,409]);
  const history = await sql('SELECT actor_id,version FROM app.quote_status_history WHERE quote_id=$1', [q.id]); expect(history.rows).toEqual([{ actor_id: ownerId, version: 1 }]);
  expect((await context.request.post(`/api/admin/quotes/${q.reference}/status`, { headers: changeHeaders, data: { status: 'CLOSED', version: 0 } })).status()).toBe(409);
});

test('cross-tab stale form refreshes current status instead of overwriting it', async ({ page, context }) => {
  const q = await seed(); await signIn(context); await page.goto(`/admin/quotes/${q.reference}`);
  await page.getByLabel('Status', { exact: true }).selectOption('CLOSED');
  expect((await context.request.post(`/api/admin/quotes/${q.reference}/status`, { headers: changeHeaders, data: { status: 'REVIEWING', version: 0 } })).status()).toBe(200);
  await page.getByRole('button', { name: 'Update status', exact: true }).click(); await expect(page.getByRole('status')).toContainText('another tab'); await expect(page.getByLabel('Status', { exact: true })).toHaveValue('REVIEWING');
});

test('origin checks and logout prevent forged and replayed status updates', async ({ context }) => {
  const q = await seed(); const session = await signIn(context);
  for (const requestOrigin of ['https://evil.example', '']) expect((await context.request.post(`/api/admin/quotes/${q.reference}/status`, { headers: { ...changeHeaders, Origin: requestOrigin }, data: { status: 'CLOSED', version: 0 } })).status()).toBe(403);
  expect((await context.request.post('/api/admin/logout', { headers: { Origin: origin }, maxRedirects: 0 })).status()).toBe(303);
  await context.addCookies([{ name: 'fs_admin_session', value: session, url: origin }]);
  expect((await context.request.post(`/api/admin/quotes/${q.reference}/status`, { headers: changeHeaders, data: { status: 'CLOSED', version: 0 } })).status()).toBe(401);
});

test('Google login binds PKCE, nonce and state to one browser; invalid callback is denied', async ({ page }) => {
  await page.route('https://accounts.google.com/**', route => route.fulfill({ status: 200, contentType: 'text/plain', body: 'Google redirect reached; no provider login in tests.' }));
  await page.goto('/admin/login');
  const navigation=page.waitForRequest(r=>r.url().startsWith('https://accounts.google.com/o/oauth2/'));
  const posted = page.waitForResponse(response => response.url().endsWith('/api/admin/auth/google'));
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  const response = await posted; expect(response.status()).toBe(200);
  expect(response.request().headers().origin).toBe(origin);
  const location = new URL((await navigation).url()); expect(location.origin).toBe('https://accounts.google.com'); expect(location.searchParams.get('scope')).toBe('openid'); expect(location.searchParams.get('code_challenge_method')).toBe('S256'); expect(location.searchParams.get('redirect_uri')).toBe(origin + '/api/admin/auth/callback');
  const state = location.searchParams.get('state')!; const row = (await sql('SELECT * FROM app.admin_login_flows WHERE state_hash=$1', [hash(state)])).rows[0];
  expect(location.searchParams.get('code_challenge')).toBe(Buffer.from(hash(row.verifier), 'hex').toString('base64url')); expect(location.searchParams.get('nonce')).toBe(row.nonce);
  await page.context().clearCookies(); const callback = await page.context().request.get(`/api/admin/auth/callback?code=fake&state=${state}`); expect(callback.status()).toBe(400); expect(await callback.text()).not.toContain('verifier');
});

test('expired contacts are hidden by admin RLS and runtime cannot access admin auth or history', async ({ page, context }) => {
  const q = await seed(true); await signIn(context); await page.goto(`/admin/quotes/${q.reference}`); await expect(page.getByText('Contact details have expired and are unavailable.')).toBeVisible(); expect(await page.content()).not.toContain('fictional-admin@example.com');
  const grants = (await sql("SELECT has_table_privilege('form_studio_runtime','app.admin_sessions','SELECT') AS sessions,has_table_privilege('form_studio_runtime','app.quote_status_history','SELECT') AS history,has_table_privilege('form_studio_admin_web','app.quote_contacts','INSERT') AS contact_insert")).rows[0]; expect(grants).toEqual({ sessions: false, history: false, contact_insert: false });
});

test('history persistence failure rolls back the status mutation', async ({ context }) => {
  const q = await seed(); await signIn(context);
  await sql(`CREATE FUNCTION app.test_history_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic history failure'; END $$`);
  await sql('CREATE TRIGGER test_history_failure BEFORE INSERT ON app.quote_status_history FOR EACH ROW EXECUTE FUNCTION app.test_history_failure()');
  try {
    expect((await context.request.post(`/api/admin/quotes/${q.reference}/status`, { headers: changeHeaders, data: { status: 'CLOSED', version: 0 } })).status()).toBe(503);
    expect((await sql('SELECT status,status_version FROM app.quote_requests WHERE id=$1', [q.id])).rows).toEqual([{ status: 'NEW', status_version: 0 }]);
    expect((await sql('SELECT * FROM app.quote_status_history WHERE quote_id=$1', [q.id])).rowCount).toBe(0);
  } finally { await sql('DROP TRIGGER test_history_failure ON app.quote_status_history'); await sql('DROP FUNCTION app.test_history_failure()'); }
});
