'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
export function AccountNotice() {
  const [status,setStatus]=useState<'loading'|'signed-in'|'guest'|'unavailable'>('loading');
  useEffect(()=>{const controller=new AbortController();fetch('/api/account/session',{cache:'no-store',signal:controller.signal}).then(async response=>{const data=await response.json();if(!controller.signal.aborted)setStatus(response.ok?(data.authenticated?'signed-in':'guest'):'unavailable');}).catch(()=>{if(!controller.signal.aborted)setStatus('unavailable');});return()=>controller.abort();},[]);
  return <p className="draft-notice">{status==='signed-in'?<>Signed in. New saved designs and demo requests will appear in <Link href="/dashboard">your dashboard</Link>.</>:status==='guest'?<><Link href="/login">Sign in with Google</Link> before saving or submitting to keep new activity in your dashboard. You can also continue as a guest.</>:status==='loading'?'Checking your account…':<><Link href="/login">Sign in again</Link> if your session expired before saving or submitting.</>}</p>;
}
