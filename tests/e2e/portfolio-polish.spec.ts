import { randomBytes,randomUUID,createHash } from 'node:crypto';
import { mkdirSync,writeFileSync } from 'node:fs';
import { Client } from 'pg';
import type { BrowserContext } from '@playwright/test';
import { test,expect } from './fixtures';
import { defaultConfiguration } from '../../src/lib/catalog';
import { verifiedReturnPath } from '../../src/lib/auth/return-path';
const testURL=process.env.TEST_DATABASE_URL;test.skip(!testURL,'Requires isolated local database');
const origin='http://127.0.0.1:4173',owner='123456789012345678901',customer='111111111111111111111';
async function sql(query:string,values:unknown[]=[]){const url=new URL(testURL!);if(url.hostname!=='127.0.0.1'||url.pathname!=='/form_studio_step7')throw new Error('Isolated database required');const db=new Client({connectionString:testURL});await db.connect();try{return await db.query(query,values);}finally{await db.end();}}
async function login(context:BrowserContext,id=customer){const token=randomBytes(32).toString('base64url');await sql('INSERT INTO app.admin_sessions(token_hash,user_id,expires_at) VALUES($1,$2,CURRENT_TIMESTAMP+INTERVAL \'8 hours\')',[createHash('sha256').update(token).digest('hex'),id]);await context.addCookies([{name:'fs_admin_session',value:token,url:origin,httpOnly:true,sameSite:'Lax'}]);}
const headers=()=>({'Content-Type':'application/json','Idempotency-Key':randomUUID()});
test.beforeEach(async()=>{await sql('TRUNCATE app.rate_buckets');});

for(const shared of [false,true])test(`sign-in preserves product-only ${shared?'shared edit-copy':'local'} context and returns to a safe destination`,async({page,context,request})=>{
 let publicId:string|undefined;
 if(shared){const result=await request.post('/api/configurations',{headers:headers(),data:defaultConfiguration});expect(result.status()).toBe(201);publicId=(await result.json()).publicId;}
 await page.goto(publicId?`/s/${publicId}?edit=1`:'/configure');await page.getByRole('radio',{name:'Walnut',exact:true}).check();await page.getByRole('button',{name:'160 × 80 cm',exact:true}).click();await page.getByRole('checkbox',{name:/Desk lamp/}).check();await page.getByLabel('Name',{exact:true}).fill('Fictional unsent private text');await page.getByLabel('Email',{exact:true}).fill('unsent@example.com');
 await page.getByRole('link',{name:'Sign in to save'}).click();await expect(page).toHaveURL(/\/login\?returnTo=/);
 const storage=await page.evaluate(()=>sessionStorage.getItem('form-studio:auth-design'));expect(storage).toContain('walnut');expect(storage).not.toMatch(/unsent|fictional|contact/i);
 await page.route('https://accounts.google.com/**',route=>route.fulfill({body:'Google destination stubbed'}));const posted=page.waitForResponse(r=>r.url().includes('/api/admin/auth/google'));await page.getByRole('button',{name:'Continue with Google'}).click();expect((await posted).status()).toBe(200);
 const cookies=await context.cookies(origin+'/api/admin/auth/callback');const binding=cookies.find(c=>c.name==='fs_admin_flow')!.value;const signed=cookies.find(c=>c.name==='fs_login_return')!.value;const returnTo=verifiedReturnPath(signed,binding)!;expect(returnTo).toBe(shared?`/s/${publicId}?edit=1&resume=1`:'/configure?resume=1');
 // Provider identity/session fixtures exist only in this disposable database; no bypass route.
 await login(context);await page.goto(returnTo);await expect(page.getByRole('radio',{name:'Walnut',exact:true})).toBeChecked();await expect(page.getByRole('button',{name:'160 × 80 cm',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('checkbox',{name:/Desk lamp/})).toBeChecked();await expect(page.getByRole('button',{name:'Save design',exact:true})).toBeEnabled();await expect(page.getByLabel('Email',{exact:true})).toBeEmpty();
 if(publicId){const saved=await request.get('/api/configurations/'+publicId);expect((await saved.json()).configuration.finishId).toBe('oak');}
});

test('login displays inline failure and cancelled callback recovery without exposing provider codes',async({page})=>{
 await page.route('**/api/admin/auth/google?**',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Sign-in is temporarily unavailable. Please retry.'})}));await page.goto('/login?returnTo=%2Fconfigure');await page.getByRole('button',{name:'Continue with Google'}).click();await expect(page.locator('.auth-panel').getByRole('alert')).toContainText('temporarily unavailable');await expect(page.getByRole('button',{name:'Continue with Google'})).toBeEnabled();
 await page.goto('/api/admin/auth/callback?error=access_denied');await expect(page).toHaveURL(/\/login\?error=cancelled/);await expect(page.locator('.auth-panel').getByRole('alert')).toContainText('cancelled');
});

test('all product routes fit four widths, preserve keyboard focus and provide coherent previews',async({browser})=>{
 test.setTimeout(90000);const user=await browser.newContext(),admin=await browser.newContext(),guest=await browser.newContext();
 try{for(const context of [user,admin,guest])await context.route('**/_vercel/insights/script.js',r=>r.fulfill({body:''}));await login(user);await login(admin,owner);
 const saved=await user.request.post('/api/configurations',{headers:headers(),data:{...defaultConfiguration,finishId:'walnut',accessoryIds:['lamp','monitor-stand','cable-tray']}});expect(saved.status()).toBe(201);const {publicId}=await saved.json();
 const submitted=await user.request.post('/api/quotes',{headers:headers(),data:{configuration:{...defaultConfiguration,finishId:'walnut',accessoryIds:['lamp','monitor-stand','cable-tray']},contact:{name:'Fictional studio review',email:'portfolio-demo@example.com',company:'Example workspace',country:'',message:'Fictional enquiry for visual and interaction review.'},website:'',consent:true}});expect(submitted.status()).toBe(201);const {reference}=await submitted.json();expect((await admin.request.post(`/api/admin/quotes/${reference}/status`,{headers:{Origin:origin,'Content-Type':'application/json'},data:{status:'REVIEWING',version:0}})).status()).toBe(200);
 const routes=[{path:'/',context:guest,name:'landing'},{path:'/configure',context:guest,name:'configure'},{path:`/s/${publicId}`,context:guest,name:'shared'},{path:`/s/${publicId}?edit=1`,context:guest,name:'edit-copy'},{path:'/login',context:guest,name:'login'},{path:'/dashboard',context:user,name:'dashboard'},{path:`/dashboard/quotes/${reference}`,context:user,name:'quote-detail'},{path:'/admin/login',context:guest,name:'admin-login'},{path:'/admin/quotes',context:admin,name:'admin-inbox'},{path:`/admin/quotes/${reference}`,context:admin,name:'admin-detail'}];
 const results:unknown[]=[];mkdirSync('docs/evidence/portfolio-polish/screenshots',{recursive:true});
 for(const route of routes){const page=await route.context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));for(const width of [1440,768,390,360]){await page.setViewportSize({width,height:1000});const response=await page.goto(route.path);expect(response!.status()).toBe(200);await page.evaluate(()=>document.fonts.ready);await expect(page.locator('h1')).toHaveCount(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('canvas')).toHaveCount(0);
  results.push({route:route.name,width,status:response!.status(),overflow:false,errors:[...errors]});
  if((width===1440&&['landing','configure','dashboard','admin-inbox','admin-detail'].includes(route.name))||(width===390&&['landing','configure','login','shared','dashboard','quote-detail','admin-detail'].includes(route.name)))await page.screenshot({path:`docs/evidence/portfolio-polish/screenshots/${route.name}-${width}.png`,fullPage:true});
 }
 await page.keyboard.press('Tab');const focus=await page.evaluate(()=>{const e=document.activeElement;if(!e)return null;const style=getComputedStyle(e);return {tag:e.tagName,outline:style.outlineStyle,width:style.outlineWidth};});expect(focus?.outline).not.toBe('none');expect(errors).toEqual([]);await page.close();}
 const empty=await guest.newPage();await empty.goto('/login');await empty.getByRole('link',{name:'Continue designing'}).click();await expect(empty).toHaveURL(/\/configure$/);await expect(empty.locator('.schematic [data-accessory]')).toHaveCount(0);await empty.getByRole('checkbox',{name:/Desk lamp/}).check();await empty.getByRole('checkbox',{name:/Cable tray/}).check();await expect(empty.locator('.scene-idle [data-accessory]')).toHaveCount(2);
 const noRows=await browser.newContext();try{await login(noRows,'333333333333333333333');const p=await noRows.newPage();await p.goto('/dashboard');await expect(p.getByText('Your first design starts here.')).toBeVisible();await expect(p.getByRole('link',{name:'Build your desk'}).first()).toBeVisible();}finally{await noRows.close();}
 writeFileSync('docs/evidence/portfolio-polish/route-review.json',JSON.stringify({browser:browser.browserType().name(),checks:results,fixtures:'Fictional isolated local PostgreSQL only',screenshotCount:12},null,2));
 }finally{await user.close();await admin.close();await guest.close();}
});
