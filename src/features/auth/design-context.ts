import { validateConfig } from '@/lib/catalog/pricing';
import type { ProductConfiguration } from '@/lib/catalog';
import { saveDraft } from '@/features/configurator/local-draft';
const key='form-studio:auth-design';
export function rememberDesign(configuration:ProductConfiguration,sourcePublicId?:string) {
  const c=validateConfig(configuration);let saved=false;
  try{window.sessionStorage.setItem(key,JSON.stringify({configuration:c,sourcePublicId:sourcePublicId??null,at:Date.now()}));saved=true;}catch{/* Caller shows an honest recovery message. */}
  saveDraft(()=>window.localStorage,c);
  return saved;
}
export function readAuthDesign(sourcePublicId?:string):ProductConfiguration|null {
  if(new URLSearchParams(window.location.search).get('resume')!=='1')return null;
  try{const raw=window.sessionStorage.getItem(key);if(!raw||raw.length>4096)return null;const value=JSON.parse(raw);if(value.sourcePublicId!==(sourcePublicId??null)||!Number.isFinite(value.at)||Date.now()-value.at<0||Date.now()-value.at>15*60*1000)return null;return validateConfig(value.configuration);}catch{return null;}
}
export function clearAuthDesign(){try{window.sessionStorage.removeItem(key);}catch{/* Storage may be unavailable. */}}
export function designLoginPath(sourcePublicId?:string){const destination=sourcePublicId?`/s/${sourcePublicId}?edit=1&resume=1`:'/configure?resume=1';return '/login?returnTo='+encodeURIComponent(destination);}
