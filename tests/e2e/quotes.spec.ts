import { randomUUID, randomBytes } from 'node:crypto';
import { Client } from 'pg';
import { test, expect } from './fixtures';
import { defaultConfiguration } from '../../src/lib/catalog';
const testURL = process.env.TEST_DATABASE_URL;
test.skip(!testURL, 'Requires isolated local PostgreSQL');
async function admin<T>(work: (client: Client) => Promise<T>) {
  const u = new URL(testURL!); if (u.hostname !== '127.0.0.1' || u.pathname !== '/form_studio_step7') throw new Error('Disposable local database required');
  const db = new Client({ connectionString: testURL }); await db.connect(); try { return await work(db); } finally { await db.end(); }
}
test.beforeEach(async () => { await admin(db => db.query('TRUNCATE app.rate_buckets')); });
const headers = (key = randomUUID()) => ({ 'Content-Type': 'application/json', 'Idempotency-Key': key });
const body = () => ({ configuration: defaultConfiguration, contact: { name: 'Fictional Demo', email: 'fictional@example.com', company: 'Example studio', country: '', message: 'Fictional test enquiry' }, website: '', consent: true });

test('quote form uses the canonical design, stores a server-priced private request and clears confirmed contact fields', async ({ page, request }) => {
  await page.goto('/configure');
  await page.getByRole('radio', { name: 'Walnut', exact: true }).check();
  await expect(page.locator('.quote-selection')).toContainText('$439');
  await page.getByLabel('Name', { exact: true }).fill('Fictional Demo');
  await page.getByLabel('Email', { exact: true }).fill('fictional@example.com');
  await page.getByRole('checkbox', { name: /I understand this is a demo enquiry/ }).check();
  const response = page.waitForResponse(r => r.url().endsWith('/api/quotes'));
  await page.getByRole('button', { name: 'Demo quote submission', exact: true }).click();
  const result = await response; expect(result.status()).toBe(201); const receipt = await result.json();
  await expect(page.getByText('Demo request received.', { exact: false })).toBeVisible();
  expect(Object.keys(receipt).sort()).toEqual(['reference','estimatedTotalCents','catalogVersion'].sort()); expect(receipt.estimatedTotalCents).toBe(43900);
  await expect(page.getByLabel('Name', { exact: true })).toBeEmpty();
  await page.screenshot({ path: 'docs/evidence/step-8/screenshots/confirmed-request.png', fullPage: true });
  const row = await admin(db => db.query('SELECT q.estimated_total_cents,q.status,c.email,c.expires_at,q.created_at FROM app.quote_requests q JOIN app.quote_contacts c ON q.id=c.quote_id WHERE q.reference=$1',[receipt.reference]));
  expect(row.rows[0].email).toBe('fictional@example.com'); expect(row.rows[0].status).toBe('NEW');
  expect(row.rows[0].expires_at - row.rows[0].created_at).toBe(5 * 86400000);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).not.toMatch(/fictional@example|Fictional Demo/);
  expect((await request.get('/api/quotes')).status()).toBe(405);
  expect((await request.get(`/api/quotes/${receipt.reference}`)).status()).toBe(404);
});

test('concurrent retries store one request/contact and ignore a forged client total', async ({ request }) => {
  const key = randomUUID(); const input = { ...body(), clientTotalCents: 1 };
  const responses = await Promise.all(Array.from({ length: 4 }, () => request.post('/api/quotes', { headers: headers(key), data: input })));
  expect(responses.filter(r => r.status() === 201)).toHaveLength(1);
  expect(responses.filter(r => r.status() === 200)).toHaveLength(3);
  const data = await Promise.all(responses.map(r => r.json())); expect(new Set(data.map(d => d.reference)).size).toBe(1);
  expect(data[0].estimatedTotalCents).toBe(39900);
  const row = await admin(db => db.query('SELECT COUNT(*)::int AS count FROM app.quote_requests q JOIN app.quote_contacts c ON q.id=c.quote_id WHERE q.idempotency_key=$1',[key])); expect(row.rows[0].count).toBe(1);
  const conflict = await request.post('/api/quotes',{headers:headers(key),data:{...input,contact:{...input.contact,name:'Different fictional visitor'}}}); expect(conflict.status()).toBe(409);
});

test('invalid contacts, honeypots and overlong payloads are rejected without private values in responses', async ({ request }) => {
  for (const input of [{...body(),contact:{...body().contact,email:'invalid'}},{...body(),website:'https://bot.example'},{...body(),consent:false},{...body(),contact:{...body().contact,message:'x'.repeat(1001)}}]) {
    const response=await request.post('/api/quotes',{headers:headers(),data:input});expect(response.status()).toBe(400);expect(await response.text()).not.toContain('fictional@example.com');
  }
  expect((await request.post('/api/quotes',{headers:headers(),data:'x'.repeat(17000)})).status()).toBe(413);
});

test('unconfirmed writes retain inputs, retry the same key and expose no premature success', async ({ page }) => {
  await page.goto('/configure');await page.getByLabel('Name',{exact:true}).fill('Fictional Retry');await page.getByLabel('Email',{exact:true}).fill('retry@example.com');await page.getByRole('checkbox',{name:/I understand this is a demo enquiry/}).check();
  const keys: string[]=[]; let reference='';
  await page.route('**/api/quotes',async route=>{keys.push(route.request().headers()['idempotency-key']);if(keys.length===1){const result=await route.fetch();expect(result.status()).toBe(201);reference=(await result.json()).reference;await route.fulfill({status:503,json:{error:'Confirmation unavailable. Please retry.'}});}else await route.continue();});
  await page.getByRole('button',{name:'Demo quote submission',exact:true}).click();await expect(page.locator('#quote-draft').getByRole('alert')).toContainText('Confirmation unavailable');await expect(page.getByLabel('Name',{exact:true})).toHaveValue('Fictional Retry');await expect(page.getByText('Demo request received.',{exact:false})).toHaveCount(0);
  await page.getByRole('button',{name:'Demo quote submission',exact:true}).click();await expect(page.getByText(reference,{exact:true})).toBeVisible();expect(keys[0]).toBe(keys[1]);
});

test('stale source estimates require explicit confirmation of current catalog price', async ({ request }) => {
  const id=randomBytes(24).toString('base64url');await admin(db=>db.query('INSERT INTO app.shared_configurations(public_id,idempotency_key,fingerprint,configuration,schema_version,catalog_version,estimated_total_cents) VALUES($1,$2,$3,$4,1,$5,1)',[id,randomUUID(),'0'.repeat(64),JSON.stringify(defaultConfiguration),'retired']));
  const key=randomUUID();const input={...body(),sourcePublicId:id};
  const first=await request.post('/api/quotes',{headers:headers(key),data:input});expect(first.status()).toBe(409);const changed=await first.json();expect(changed.offer.estimatedTotalCents).toBe(39900);
  const second=await request.post('/api/quotes',{headers:headers(key),data:{...input,priceConfirmation:changed.offer}});expect(second.status()).toBe(201);expect((await second.json()).estimatedTotalCents).toBe(39900);
});

test('private tables deny runtime/browser reads; authenticated purge removes only expired contact rows', async ({ request }) => {
  const result=await request.post('/api/quotes',{headers:headers(),data:body()});const {reference}=await result.json();
  const id=await admin(async db=>{const row=await db.query('SELECT id FROM app.quote_requests WHERE reference=$1',[reference]);await db.query("UPDATE app.quote_contacts SET expires_at=CURRENT_TIMESTAMP-INTERVAL '1 second' WHERE quote_id=$1",[row.rows[0].id]);return row.rows[0].id;});
  const grants=await admin(db=>db.query("SELECT has_table_privilege('form_studio_runtime','app.quote_contacts','SELECT') runtime_read,has_table_privilege('anon','app.quote_contacts','SELECT') anon_read,has_table_privilege('authenticated','app.quote_requests','SELECT') browser_read"));expect(grants.rows[0]).toEqual({runtime_read:false,anon_read:false,browser_read:false});
  expect((await request.get('/api/internal/cleanup')).status()).toBe(401);
  const cleaned=await request.get('/api/internal/cleanup',{headers:{Authorization:`Bearer ${process.env.CRON_SECRET}`}});expect(cleaned.status()).toBe(200);expect((await cleaned.json()).removedContacts).toBeGreaterThanOrEqual(1);
  const remaining=await admin(db=>db.query('SELECT (SELECT COUNT(*)::int FROM app.quote_contacts WHERE quote_id=$1) contacts,(SELECT COUNT(*)::int FROM app.quote_requests WHERE id=$1) metadata',[id]));expect(remaining.rows[0]).toEqual({contacts:0,metadata:1});
});

test('atomic quote limits are separate from sharing limits',async({request})=>{
  const results=await Promise.all(Array.from({length:8},()=>request.post('/api/quotes',{headers:headers(),data:body()})));expect(results.filter(r=>r.status()===201)).toHaveLength(5);expect(results.filter(r=>r.status()===429)).toHaveLength(3);
  expect((await request.post('/api/configurations',{headers:headers(),data:defaultConfiguration})).status()).toBe(201);
});

test('copy editing requires visible current-estimate acknowledgment before writing an enquiry', async ({ page, request }) => {
  const saved = await request.post('/api/configurations', { headers: headers(), data: defaultConfiguration });
  const { publicId } = await saved.json();
  await page.goto(`/s/${publicId}?edit=1`);
  await page.getByRole('radio', { name: 'Walnut', exact: true }).check();
  await page.getByLabel('Name', { exact: true }).fill('Fictional Price Review');
  await page.getByLabel('Email', { exact: true }).fill('price-review@example.com');
  await page.getByRole('checkbox', { name: /I understand this is a demo enquiry/ }).check();
  await page.getByRole('button', { name: 'Demo quote submission', exact: true }).click();
  await expect(page.getByText('Updated estimate: $439 USD', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Demo quote submission', exact: true })).toBeDisabled();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Fictional Price Review');
  await page.getByRole('checkbox', { name: 'I confirm this current estimate.', exact: true }).check();
  await page.getByRole('button', { name: 'Demo quote submission', exact: true }).click();
  await expect(page.getByText('Recorded estimate: $439 USD', { exact: true })).toBeVisible();
});

test('a contact storage failure rolls back metadata and preserves form inputs without false success', async ({ page }) => {
  await admin(async db => {
    await db.query("CREATE FUNCTION app.test_quote_storage_failure() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Synthetic storage failure'; END $$");
    await db.query("CREATE TRIGGER test_quote_storage_failure BEFORE INSERT ON app.quote_contacts FOR EACH ROW WHEN (NEW.email = 'storage-failure@example.com') EXECUTE FUNCTION app.test_quote_storage_failure()");
  });
  try {
    await page.goto('/configure');
    await page.getByLabel('Name', { exact: true }).fill('Fictional Storage Failure');
    await page.getByLabel('Email', { exact: true }).fill('storage-failure@example.com');
    await page.getByRole('checkbox', { name: /I understand this is a demo enquiry/ }).check();
    const pending = page.waitForResponse(response => response.url().endsWith('/api/quotes'));
    await page.getByRole('button', { name: 'Demo quote submission', exact: true }).click();
    const response = await pending; expect(response.status()).toBe(503);
    const key = response.request().headers()['idempotency-key'];
    await expect(page.locator('#quote-draft').getByRole('alert')).toContainText('could not be confirmed');
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Fictional Storage Failure');
    await expect(page.getByText('Demo request received.', { exact: false })).toHaveCount(0);
    const rows = await admin(db => db.query('SELECT COUNT(*)::int AS count FROM app.quote_requests WHERE idempotency_key=$1', [key]));
    expect(rows.rows[0].count).toBe(0);
  } finally {
    await admin(async db => {
      await db.query('DROP TRIGGER IF EXISTS test_quote_storage_failure ON app.quote_contacts');
      await db.query('DROP FUNCTION IF EXISTS app.test_quote_storage_failure()');
    });
  }
});
