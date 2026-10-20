'use client';
import Link from 'next/link';
import { createContext, useContext, useEffect, useState } from 'react';
type AccountStatus='loading'|'signed-in'|'guest'|'unavailable';
const AccountContext=createContext<AccountStatus>('loading');
export function AccountProvider({children}:{children:React.ReactNode}) {
  const [status,setStatus]=useState<AccountStatus>('loading');
  useEffect(()=>{const controller=new AbortController();fetch('/api/account/session',{cache:'no-store',signal:controller.signal}).then(async response=>{const data=await response.json();if(!controller.signal.aborted)setStatus(response.ok?(data.authenticated?'signed-in':'guest'):'unavailable');}).catch(()=>{if(!controller.signal.aborted)setStatus('unavailable');});return()=>controller.abort();},[]);
  return <AccountContext value={status}>{children}</AccountContext>;
}
export const useAccountStatus=()=>useContext(AccountContext);
export function AccountNotice(){const status=useAccountStatus();return <p className="fine">{status==='signed-in'?<>Signed in · <Link href="/dashboard">My studio</Link></>:<>Guest design · Sign in at the save action to keep it in My studio.</>}</p>;}
