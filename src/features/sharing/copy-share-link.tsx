'use client';
import { useState, useSyncExternalStore } from 'react';
import { siteOrigin } from '@/lib/site';
const subscribe=()=>()=>{};
export function CopyShareLink({publicId}:{publicId:string}){
 const origin=useSyncExternalStore(subscribe,()=>window.location.origin,()=>siteOrigin);const [status,setStatus]=useState('');const [expanded,setExpanded]=useState(false);const link=`${origin}/s/${publicId}`;
 return <div className="public-share-actions"><button className="secondary-button" type="button" onClick={async()=>{try{await navigator.clipboard.writeText(link);setStatus('Link copied.');}catch{setExpanded(true);setStatus('Select and copy the link below.');}}}>Copy share link</button><details open={expanded} onToggle={event=>setExpanded(event.currentTarget.open)}><summary>View share link</summary><label className="share-link">Share link<input readOnly value={link} onFocus={event=>event.target.select()}/></label></details><p role="status" className="fine">{status}</p></div>;
}
