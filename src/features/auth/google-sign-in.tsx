'use client';
import { useState } from 'react';
export function GoogleSignIn({ owner=false,returnTo='/dashboard' }: {owner?:boolean;returnTo?:string}) {
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const action='/api/admin/auth/google'+(owner?(returnTo.startsWith('/admin/quotes/')?'?'+new URLSearchParams({returnTo}):''):'?'+new URLSearchParams({intent:'account',returnTo}));
  return <form action={action} method="post" className="google-form" onSubmit={async event=>{event.preventDefault();if(busy)return;setBusy(true);setError('');try{const response=await fetch(action,{method:'POST',headers:{Accept:'application/json'},signal:AbortSignal.timeout(25000)});const data=await response.json();if(!response.ok||typeof data.url!=='string')throw new Error(data.error??'Sign-in could not start. Please try again.');const url=new URL(data.url);if(url.origin!=='https://accounts.google.com')throw new Error('Sign-in could not start. Please retry.');window.location.assign(url.toString());}catch(cause){setBusy(false);setError(cause instanceof Error&&cause.name!=='TimeoutError'?cause.message:'Sign-in took too long. Please try again.');}}}>
    <button className="button google-button" type="submit" disabled={busy}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2.2H12v4.1h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4ZM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22ZM6.4 14a6 6 0 0 1 0-4V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14ZM12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.9 5.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z"/></svg>{busy?'Connecting to Google…':'Continue with Google'}</button>
    {busy&&<p role="status" className="fine">Opening secure sign-in…</p>}{error&&<p className="feedback feedback-error" role="alert">{error}</p>}
  </form>;
}
