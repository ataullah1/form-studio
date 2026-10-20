'use client';
import Link from 'next/link';
export function WorkspaceFailure({reset,href='/dashboard'}:{reset:()=>void;href?:string}){return <section className="empty-state" role="alert"><p className="eyebrow">PLEASE TRY AGAIN</p><h1>This view could not be loaded.</h1><p>Your saved work is unchanged. Try reloading this view, or return to the workspace.</p><div className="inline-actions"><button className="button" onClick={reset}>Try again</button><Link className="secondary-button" href={href}>Back to workspace</Link></div></section>;}
