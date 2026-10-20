import { AccountRefresh } from '@/features/account/account-refresh';
import Link from 'next/link';
import { dashboard } from '@/server/account/dashboard';
import { formatUsd } from '@/lib/catalog';
import { accountAccess } from './access';
export default async function DashboardPage({searchParams}:{searchParams:Promise<{page?:string}>}) {
  const denied = await accountAccess(); if(denied) return <p role="alert">{denied}</p>;
  let data;try{data=await dashboard((await searchParams).page);}catch{return <p role="alert">Your dashboard could not be loaded. Please retry.</p>;}
  return <><div className="admin-heading"><h1>Your studio</h1><AccountRefresh /></div><p>Designs saved and requests sent while signed in appear here. Guest activity stays separate.</p>{data.admin&&<Link className="text-link" href="/admin/quotes">Open admin inbox ↗</Link>}
    <section className="admin-card" aria-labelledby="my-designs"><h2 id="my-designs">Your saved designs</h2>{data.designs.length?<ul className="admin-list">{data.designs.map(d=><li key={d.public_id}><Link prefetch={false} href={`/s/${d.public_id}`}>Studio Desk 01 · {d.configuration.sizeId} · {d.configuration.finishId}<span>{formatUsd(d.estimated_total_cents)} USD · {d.created_at.toISOString().slice(0,10)}</span></Link></li>)}</ul>:<p>No saved designs yet. Use Save &amp; share in the configurator while signed in.</p>}</section>
    <section className="admin-card" aria-labelledby="my-quotes"><h2 id="my-quotes">Your demo requests</h2>{data.quotes.length?<ul className="admin-list">{data.quotes.map(q=><li key={q.reference}><Link prefetch={false} href={`/dashboard/quotes/${q.reference}`}>Request {q.reference}<span>{q.status} · {formatUsd(q.estimated_total_cents)} USD · {q.created_at.toISOString().slice(0,10)}</span></Link></li>)}</ul>:<p>No demo requests yet. Submit one while signed in to track its status here.</p>}</section>
    <nav className="admin-pagination" aria-label="Dashboard pages">{data.page>1&&<Link prefetch={false} href={`/dashboard?page=${data.page-1}`}>Previous</Link>}<span>Page {data.page}</span>{data.hasNext&&<Link prefetch={false} href={`/dashboard?page=${data.page+1}`}>Next</Link>}</nav><details><summary>Account details</summary><p>Your Google account ID: {data.userId}</p></details></>;
}
