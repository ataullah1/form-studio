'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import type { ProductConfiguration } from '@/lib/catalog';
import { useAccountStatus } from '@/features/account/account-notice';
import { designLoginPath, rememberDesign } from '@/features/auth/design-context';
export function ShareButton({ configuration,sourcePublicId }: { configuration: ProductConfiguration;sourcePublicId?:string }) {
  const account=useAccountStatus();const signedIn=account==='signed-in';
  const payload=JSON.stringify(configuration);const requestKey=useRef<{payload:string;key:string}|null>(null);
  const [busy,setBusy]=useState(false);const [result,setResult]=useState<{payload:string;link?:string;error?:string}|null>(null);const [copied,setCopied]=useState(false);const [copyError,setCopyError]=useState(false);
  async function save(){if(busy)return;if(requestKey.current?.payload!==payload)requestKey.current={payload,key:crypto.randomUUID()};setBusy(true);setCopied(false);setCopyError(false);const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
    try{const response=await fetch('/api/configurations',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':requestKey.current.key},body:payload,signal:controller.signal});const data=await response.json();if(!response.ok)throw new Error(typeof data.error==='string'?data.error:'Save could not be confirmed. Please retry.');if(typeof data.publicId!=='string'||!/^[A-Za-z0-9_-]{32}$/.test(data.publicId))throw new Error('Save could not be confirmed. Please retry.');setResult({payload,link:`${window.location.origin}/s/${data.publicId}`});}catch(error){setResult({payload,error:error instanceof Error&&error.name!=='AbortError'?error.message:'Save could not be confirmed. Retry with your selection unchanged.'});}finally{clearTimeout(timer);setBusy(false);}}
  const current=result?.payload===payload?result:null;
  return <div className="share-control"><button type="button" className="button" disabled={busy||account==='loading'} onClick={save}>{busy?'Saving design…':signedIn?'Save design':'Share design'}<span aria-hidden="true">↗</span></button>
    <p className="save-context">{signedIn?'Keep it in My studio, with a public link you can share.':'Create a public link as a guest, or sign in first to keep this design.'}</p>
    {!signedIn&&<Link className="text-link" href={designLoginPath(sourcePublicId)} onClick={event=>{if(!rememberDesign(configuration,sourcePublicId)){event.preventDefault();setResult({payload,error:'This browser cannot keep your selection through sign-in. Create a share link first so you can return to it.'});}}}>Sign in to save <span aria-hidden="true">↗</span></Link>}
    <div aria-live="polite" role="status">{current?.error&&<p className="feedback feedback-error">{current.error}</p>}{current?.link&&<div className="save-result"><p><strong>{signedIn?'Saved to My studio.':'Your share link is ready.'}</strong> Anyone with the link can view this design.</p><label className="share-link">Share link<input value={current.link} readOnly onFocus={event=>event.target.select()}/></label><div className="inline-actions"><a className="text-link" href={current.link}>Open saved design ↗</a><button type="button" className="secondary-button" onClick={async()=>{try{await navigator.clipboard.writeText(current.link!);setCopied(true);setCopyError(false);}catch{setCopyError(true);}}}>{copied?'Link copied':'Copy link'}</button></div>{copyError&&<p>Select and copy the link above. Clipboard access is unavailable.</p>}</div>}</div>
  </div>;
}
