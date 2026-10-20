import { createHmac, timingSafeEqual } from 'node:crypto';
export function safeReturnPath(input:unknown,owner=false):string {
  if(typeof input!=='string'||input.length>200)return '/dashboard';
  if(/^\/configure(?:\?resume=1)?(?:#quote-draft)?$/.test(input)||/^\/s\/[A-Za-z0-9_-]{32}\?edit=1(?:&resume=1)?$/.test(input)||/^\/dashboard(?:\/quotes\/[A-Za-z0-9_-]{32})?$/.test(input))return input;
  if(owner&&/^\/admin\/quotes(?:\/[A-Za-z0-9_-]{32})?$/.test(input))return input;
  return '/dashboard';
}
export function signReturnPath(path:unknown,binding:string,owner=false){const encoded=Buffer.from(safeReturnPath(path,owner)).toString('base64url');return encoded+'.'+createHmac('sha256',binding).update(encoded).digest('base64url');}
export function verifiedReturnPath(value:string|undefined,binding:string):string|null {
  if(!value||value.length>400||!/^[A-Za-z0-9_-]{43}$/.test(binding))return null;
  const [encoded,signature,...extra]=value.split('.');if(!encoded||!signature||extra.length)return null;
  const expected=createHmac('sha256',binding).update(encoded).digest('base64url');if(signature.length!==expected.length||!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return null;
  return safeReturnPath(Buffer.from(encoded,'base64url').toString('utf8'),true);
}

export function loginDestination(requested:string|null,fallback:string){return requested?.startsWith('/admin/')&&fallback!=='/admin/quotes'?fallback:requested??fallback;}
