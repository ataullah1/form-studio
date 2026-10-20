import Link from 'next/link';
import { notFound } from 'next/navigation';
import { quoteDetail } from '@/server/admin/inbox';
import { AdminError } from '@/server/admin/session';
import { formatUsd } from '@/lib/catalog';
import { AdminToolbar } from '@/components/product/admin-toolbar';
import { ConfigurationDetails,ProductPreview,EmptyState,FormattedDate,PageHeading,StatusBadge } from '@/components/product/product-details';
import { checkAccess } from '../access';
import { StatusControl } from './status-control';
export default async function QuotePage({params}:{params:Promise<{reference:string}>}){
 const reference=(await params).reference;
 const denied=await checkAccess('/admin/quotes/'+reference);if(denied)return <div role="alert"><EmptyState title="This request is private." action={<Link className="button" href="/dashboard">Go to My studio</Link>}>{denied}</EmptyState></div>;
 let result;try{result=await quoteDetail(reference);}catch(error){if(error instanceof AdminError&&error.status===404)notFound();return <div role="alert"><EmptyState title="Request could not be loaded." action={<Link className="secondary-button" href="/admin/quotes">Back to inbox</Link>}>Please try again. No request details have changed.</EmptyState></div>;}
 const {quote:q,history}=result;
 return <article className="admin-workspace"><AdminToolbar/><Link className="back-link" prefetch={false} href="/admin/quotes">← Quote inbox</Link><PageHeading eyebrow="PRIVATE PROJECT REVIEW" title="Quote request." description={q.name??'Contact details have expired.'}/><div className="request-detail-bar"><StatusBadge status={q.status}/><span>Received <FormattedDate value={q.created_at}/></span><span className="mono">{q.reference}</span></div>
 <div className="admin-detail-grid"><section className="surface-panel"><p className="eyebrow">01 / CONTACT</p><h2>Project details</h2>{q.name===null?<p className="feedback">Contact details have expired and are unavailable.</p>:<dl className="contact-details"><div><dt>Name</dt><dd>{q.name}</dd></div><div><dt>Email</dt><dd>{q.email}</dd></div><div><dt>Company</dt><dd>{q.company||'—'}</dd></div><div><dt>Country</dt><dd>{q.country||'—'}</dd></div><div className="contact-message"><dt>Message</dt><dd>{q.message||'No project message supplied.'}</dd></div></dl>}<div className="status-panel"><h3>Request status</h3><StatusControl reference={q.reference} status={q.status} version={q.status_version}/></div></section>
 <section className="surface-panel"><div className="detail-preview"><ProductPreview configuration={q.configuration}/></div><h2>Submitted design</h2><ConfigurationDetails configuration={q.configuration}/><div className="detail-estimate"><span>Saved estimate</span><strong>{formatUsd(q.estimated_total_cents)} <small>USD</small></strong></div><details className="technical-details"><summary>Snapshot details</summary><p>Catalog {q.catalog_version} · {q.created_at.toISOString()}</p><pre>{JSON.stringify(q.configuration,null,2)}</pre></details></section></div>
 <section className="workspace-section"><div className="section-heading"><div><p className="eyebrow">03 / RECORD</p><h2>Status history</h2></div></div>{history.length?<ol className="status-history">{history.map(h=><li key={h.version}><span>{h.from_status} <span aria-hidden="true">→</span> <strong>{h.to_status}</strong></span><time dateTime={h.created_at.toISOString()}>{h.created_at.toISOString().replace('T',' ').slice(0,16)} UTC</time><details><summary>Change details</summary><p className="fine">Admin <span className="mono">{h.actor_id}</span> · Revision {h.version}</p></details></li>)}</ol>:<p className="fine">No status changes yet.</p>}</section></article>;
}
