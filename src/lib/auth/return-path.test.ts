import { describe, expect, it } from 'vitest';
import { safeReturnPath, signReturnPath, verifiedReturnPath, loginDestination } from './return-path';
describe('safe authentication return paths',()=>{
 it.each(['/dashboard','/configure','/configure?resume=1','/configure?resume=1#quote-draft','/s/'+ 'a'.repeat(32)+'?edit=1&resume=1','/dashboard/quotes/'+'b'.repeat(32)])('keeps allowed app destination %s',path=>{expect(safeReturnPath(path)).toBe(path);});
 it.each(['https://evil.example','//evil.example','/\\evil.example','/admin/quotes','/configure?next=evil','/configure%0d%0aLocation:evil','/s/invalid?edit=1','/dashboard?userId=other'])('rejects arbitrary destination %s',path=>{expect(safeReturnPath(path)).toBe('/dashboard');});
 it('binds a return path to its verified one-time browser flow',()=>{const binding='a'.repeat(43),value=signReturnPath('/configure?resume=1',binding);expect(verifiedReturnPath(value,binding)).toBe('/configure?resume=1');expect(verifiedReturnPath(value,'b'.repeat(43))).toBeNull();expect(verifiedReturnPath(value+'tampered',binding)).toBeNull();expect(verifiedReturnPath(undefined,binding)).toBeNull();});
});

it('allows owner return context without granting non-admins inbox access',()=>{const target='/admin/quotes/'+'a'.repeat(32);expect(safeReturnPath(target,true)).toBe(target);expect(safeReturnPath(target)).toBe('/dashboard');expect(loginDestination(target,'/dashboard')).toBe('/dashboard');expect(loginDestination(target,'/admin/quotes')).toBe(target);});
