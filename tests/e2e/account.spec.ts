import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { Client } from 'pg';
import type { BrowserContext } from '@playwright/test';
import { test, expect } from './fixtures';
import { defaultConfiguration } from '../../src/lib/catalog';
const testURL=process.env.TEST_DATABASE_URL;test.skip(!testURL,'Requires disposable local PostgreSQL');
const origin='http://127.0.0.1:4173';const userA='111111111111111111111',userB='222222222222222222222';
async function sql(query:string,values:unknown[]=[]){const u=new URL(testURL!);if(u.hostname!=='127.0.0.1'||u.pathname!=='/form_studio_step7')throw new Error('Disposable database required');const db=new Client({connectionString:testURL});await db.connect();try{return await db.query(query,values);}finally{await db.end();}}
async function signIn(context:BrowserContext,userId:string,expired=false){const token=randomBytes(32).toString('base64url');await sql('INSERT INTO app.admin_sessions(token_hash,user_id,expires_at) VALUES($1,$2,CURRENT_TIMESTAMP + $3::interval)',[createHash('sha256').update(token).digest('hex'),userId,expired?'-1 hour':'8 hours']);await context.addCookies([{name:'fs_admin_session',value:token,url:origin,httpOnly:true,sameSite:'Lax'}]);}
const headers=(key=randomUUID())=>({'Content-Type':'application/json','Idempotency-Key':key,Origin:origin});
const quote=()=>({configuration:defaultConfiguration,contact:{name:'Fictional account demo',email:'account-demo@example.com',company:'',country:'',message:''},consent:true,website:''});
test.beforeEach(async()=>{await sql('TRUNCATE app.admin_sessions,app.admin_login_flows,app.rate_buckets');});

test('two accounts see only their own saved designs and quote requests; public shares omit ownership',async({browser})=>{
 const a=await browser.newContext(),b=await browser.newContext();try{
 await signIn(a,userA);await signIn(b,userB);
 const shareA=await a.request.post('/api/configurations',{headers:headers(),data:defaultConfiguration});expect(shareA.status()).toBe(201);const designA=await shareA.json();
 const shareB=await b.request.post('/api/configurations',{headers:headers(),data:{...defaultConfiguration,finishId:'walnut'}});expect(shareB.status()).toBe(201);const designB=await shareB.json();
 const requestA=await a.request.post('/api/quotes',{headers:headers(),data:quote()});expect(requestA.status()).toBe(201);const receiptA=await requestA.json();
 const requestB=await b.request.post('/api/quotes',{headers:headers(),data:quote()});expect(requestB.status()).toBe(201);const receiptB=await requestB.json();
 const pageA=await a.newPage();const response=await pageA.goto('/dashboard');expect(response!.headers()['cache-control']).toContain('no-store');
 await expect(pageA.locator(`.design-preview[href="/s/${designA.publicId}"]`)).toBeVisible();await expect(pageA.locator(`a[href="/s/${designB.publicId}"]`)).toHaveCount(0);await expect(pageA.locator(`a[href="/dashboard/quotes/${receiptA.reference}"]`)).toBeVisible();expect(await pageA.content()).not.toContain(receiptB.reference);
 const forbidden=await pageA.goto(`/dashboard/quotes/${receiptB.reference}`);expect(forbidden!.status()).toBe(404);expect(await pageA.content()).not.toContain('account-demo@example.com');
 await pageA.goto(`/dashboard/quotes/${receiptA.reference}`);await expect(pageA.getByRole('heading',{name:'Your quote request.',exact:true})).toBeVisible();await expect(pageA.getByText('NEW',{exact:true})).toBeVisible();
 const publicShare=await a.request.get(`/api/configurations/${designA.publicId}`);const snapshot=JSON.stringify(await publicShare.json());expect(snapshot).not.toContain(userA);expect(snapshot).not.toMatch(/ownerUserId|owner_user_id/);
 const row=(await sql('SELECT owner_user_id FROM app.quote_requests WHERE reference=$1',[receiptA.reference])).rows[0];expect(row.owner_user_id).toBe(userA);
 expect((await a.request.post(`/api/admin/quotes/${receiptA.reference}/status`,{headers:headers(),data:{status:'CLOSED',version:0}})).status()).toBe(403);
 const owner=await browser.newContext();try{await signIn(owner,'123456789012345678901');expect((await owner.request.post(`/api/admin/quotes/${receiptA.reference}/status`,{headers:headers(),data:{status:'REVIEWING',version:0}})).status()).toBe(200);await pageA.getByRole('button',{name:'Refresh requests'}).click();await expect(pageA.getByText('REVIEWING',{exact:true})).toBeVisible();}finally{await owner.close();}
 }finally{await a.close();await b.close();}
});

test('guest rows are never claimed by matching contact email; ownership cannot be injected',async({browser,request})=>{
 const guest=await request.post('/api/quotes',{headers:headers(),data:quote()});expect(guest.status()).toBe(201);const receipt=await guest.json();
 const context=await browser.newContext();try{await signIn(context,userA);const page=await context.newPage();await page.goto('/dashboard');expect(await page.content()).not.toContain(receipt.reference);
 expect((await context.request.post('/api/quotes',{headers:headers(),data:{...quote(),ownerUserId:userB}})).status()).toBe(400);
 expect((await context.request.post('/api/configurations',{headers:headers(),data:{...defaultConfiguration,ownerUserId:userB}})).status()).toBe(400);
 const response=await page.goto(`/dashboard/quotes/${receipt.reference}`);expect(response!.status()).toBe(404);
 }finally{await context.close();}
});

test('idempotency keys cannot move a design or request between accounts',async({browser})=>{
 const a=await browser.newContext(),b=await browser.newContext();try{await signIn(a,userA);await signIn(b,userB);
 for(const [path,data] of [['/api/configurations',defaultConfiguration],['/api/quotes',quote()]] as const){const key=randomUUID();expect((await a.request.post(path,{headers:headers(key),data})).status()).toBe(201);expect((await a.request.post(path,{headers:headers(key),data})).status()).toBe(200);expect((await b.request.post(path,{headers:headers(key),data})).status()).toBe(409);}
 }finally{await a.close();await b.close();}
});

test('expired sessions cannot silently submit as guests and dashboard redirects to public login',async({context,page})=>{
 await signIn(context,userA,true);await page.goto('/dashboard');await expect(page).toHaveURL(/\/login$/);
 expect((await context.request.post('/api/quotes',{headers:headers(),data:quote()})).status()).toBe(401);
 expect((await context.request.post('/api/configurations',{headers:headers(),data:defaultConfiguration})).status()).toBe(401);
});

test('account login keeps fixed callback, binds dashboard intent and suppresses private analytics',async({page,context})=>{
 await page.route('https://accounts.google.com/**',route=>route.fulfill({status:200,contentType:'text/plain',body:'Provider destination stubbed'}));
 await page.goto('/login');const navigation=page.waitForRequest(r=>r.url().startsWith('https://accounts.google.com/o/oauth2/'));const posted=page.waitForResponse(r=>r.url().includes('/api/admin/auth/google'));await page.getByRole('button',{name:'Continue with Google'}).click();const response=await posted;expect(response.status()).toBe(200);const location=new URL((await navigation).url());expect(location.searchParams.get('redirect_uri')).toBe(origin+'/api/admin/auth/callback');const state=location.searchParams.get('state')!;
 expect((await sql('SELECT destination FROM app.admin_login_flows WHERE state_hash=$1',[createHash('sha256').update(state).digest('hex')])).rows[0].destination).toBe('/dashboard');
 await signIn(context,userA);let analytics=0;page.on('request',r=>{if(r.url().includes('/_vercel/insights/'))analytics++;});await page.goto('/dashboard');expect(analytics).toBe(0);await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);expect(await page.evaluate(()=>JSON.stringify({...localStorage}))).not.toContain(userA);
 expect((await context.request.post('/api/admin/logout',{headers:{Origin:origin},maxRedirects:0})).status()).toBe(303);await page.goto('/dashboard');await expect(page).toHaveURL(/\/login$/);
});
