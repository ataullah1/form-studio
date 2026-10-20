import { AccountRefresh } from '@/features/account/account-refresh';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ownedQuote } from '@/server/account/dashboard';
import { AdminError } from '@/server/admin/session';
import { formatUsd } from '@/lib/catalog';
import { ConfigurationDetails,ProductPreview,EmptyState,FormattedDate,PageHeading,StatusBadge } from '@/components/product/product-details';
import { accountAccess } from '../../access';
export default async function AccountQuotePage({params}:{params:Promise<{reference:string}>}){
 const reference=(await params).reference;
 const denied=await accountAccess('/dashboard/quotes/'+reference);if(denied)return <EmptyState title="Your request is unavailable." action={<Link className="secondary-button" href="/dashboard">Back to My studio</Link>}>{denied}</EmptyState>;
 let q;try{q=await ownedQuote(reference);}catch(error){if(error instanceof AdminError&&error.status===404)notFound();return <div role="alert"><EmptyState title="Request could not be loaded." action={<Link className="secondary-button" href="/dashboard">Back to My studio</Link>}>Please retry in a moment. Your request is unchanged.</EmptyState></div>;}
 return <article><Link className="back-link" href="/dashboard#quote-requests">← Quote requests</Link><PageHeading eyebrow="YOUR PROJECT" title="Your quote request." description="The design you submitted, with its recorded estimate." actions={<AccountRefresh/>}/><div className="request-detail-bar"><StatusBadge status={q.status}/><span>Submitted <FormattedDate value={q.created_at}/></span><span className="mono">{q.reference}</span></div><div className="detail-grid"><div className="detail-preview"><ProductPreview configuration={q.configuration}/></div><section className="surface-panel"><p className="eyebrow">SUBMITTED DESIGN</p><h2>Studio Desk 01</h2><ConfigurationDetails configuration={q.configuration}/><div className="detail-estimate"><span>Saved estimate</span><strong>{formatUsd(q.estimated_total_cents)} <small>USD</small></strong></div><p className="fine">Tax and shipping excluded. This is a demo request, not an order. No email was sent.</p><details className="technical-details"><summary>Reference details</summary><p>Reference: <span className="mono">{q.reference}</span></p><p>Catalog {q.catalog_version} · {q.created_at.toISOString()}</p></details></section></div><div className="feedback"><strong>{q.status==='NEW'?'Request received.':q.status==='REVIEWING'?'Your request is being reviewed.':'This request is closed.'}</strong><p>Use Refresh requests to see the latest status. Contact details are stored temporarily for private studio review.</p></div><Link className="text-link" href="/configure">Explore another design ↗</Link></article>;
}
