import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({query:vi.fn(),verify:vi.fn()}));
vi.mock('server-only',()=>({}));
vi.mock('./db',()=>({adminDB:()=>({query:mocks.query})}));
vi.mock('./session',()=>({AdminError:class extends Error {constructor(public status:number,message:string){super(message);}}}));
vi.mock('../../lib/admin/google',()=>({verifyGoogleIdentity:mocks.verify}));
import { finishGoogleLogin } from './google';
beforeEach(()=>{
 vi.clearAllMocks();vi.stubEnv('GOOGLE_CLIENT_ID','local-client');vi.stubEnv('GOOGLE_CLIENT_SECRET','local-secret');vi.stubEnv('ADMIN_ORIGIN','http://localhost:3000');vi.stubEnv('ADMIN_GOOGLE_SUB_IDS','123');
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json({id_token:'verified-by-separate-cryptographic-tests'})));
 mocks.query.mockResolvedValueOnce({rows:[{verifier:'verifier',nonce:'nonce',destination:'/admin/quotes'}]}).mockResolvedValue({rows:[]});mocks.verify.mockResolvedValue('456');
});
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
it('creates a session for a verified non-admin and redirects to their dashboard',async()=>{
 const result=await finishGoogleLogin('a'.repeat(43),'b'.repeat(43),'one-time-code');expect(result.session).toMatch(/^[A-Za-z0-9_-]{43}$/);expect(result.destination).toBe('/dashboard');expect(mocks.query.mock.calls[1][1][1]).toBe('456');expect(mocks.query.mock.calls[1][1][0]).not.toBe(result.session);
});
it('an allowed owner can still enter the admin inbox',async()=>{mocks.verify.mockResolvedValue('123');expect((await finishGoogleLogin('a'.repeat(43),'b'.repeat(43),'code')).destination).toBe('/admin/quotes');});
it('even an owner using public account login stays in the dashboard',async()=>{mocks.query.mockReset().mockResolvedValueOnce({rows:[{verifier:'verifier',nonce:'nonce',destination:'/dashboard'}]}).mockResolvedValue({rows:[]});mocks.verify.mockResolvedValue('123');expect((await finishGoogleLogin('a'.repeat(43),'b'.repeat(43),'code')).destination).toBe('/dashboard');});
it('consumed or expired flow cannot create a session',async()=>{mocks.query.mockReset().mockResolvedValue({rows:[]});await expect(finishGoogleLogin('a'.repeat(43),'b'.repeat(43),'code')).rejects.toThrow('Login expired');expect(fetch).not.toHaveBeenCalled();expect(mocks.query).toHaveBeenCalledTimes(1);});
it('failed token validation cannot create a user session',async()=>{mocks.verify.mockRejectedValue(new Error('Invalid signature'));await expect(finishGoogleLogin('a'.repeat(43),'b'.repeat(43),'code')).rejects.toThrow('Invalid signature');expect(mocks.query).toHaveBeenCalledTimes(1);});
