import Link from 'next/link';
import { listQuotes } from '@/server/admin/inbox';
import { statuses } from '@/lib/admin/policy';
import { formatUsd } from '@/lib/catalog';
import { EmptyState,FormattedDate,PageHeading,StatusBadge } from '@/components/product/product-details';
import { AdminToolbar } from '@/components/product/admin-toolbar';
import { checkAccess } from '../access';
export default async function InboxPage({searchParams}:{searchParams:Promise<{status?:string;page?:string}>}){
 const denied=await checkAccess();if(denied)return <div role="alert"><EmptyState title="This inbox is private." action={<Link className="button" href="/dashboard">Go to My studio</Link>}>{denied}</EmptyState></div>;
 const query=await searchParams;let result;try{result=await listQuotes(query.status,query.page);}catch{return <div role="alert"><EmptyState title="The inbox could not be loaded." action={<Link className="secondary-button" href="/admin/quotes">Retry without filters</Link>}>Please check your filter or try again in a moment.</EmptyState></div>;}
 const href=(page:number)=>`/admin/quotes?${new URLSearchParams({page:String(page),...(query.status?{status:query.status}:{})})}`;
 return <section className="admin-workspace"><AdminToolbar/><PageHeading eyebrow="STUDIO OPERATIONS" title="Quote inbox." description="Review the design, understand the project and keep its status up to date."/><form className="filter-bar" method="get"><label htmlFor="inbox-status">Status</label><select id="inbox-status" name="status" defaultValue={query.status??''}><option value="">All statuses</option>{statuses.map(s=><option key={s}>{s}</option>)}</select><button className="secondary-button" type="submit">Filter</button>{query.status&&<Link className="button-quiet" href="/admin/quotes">Clear filter</Link>}</form>
 {result.rows.length?<ul className="request-list admin-list">{result.rows.map(q=><li key={q.reference}><Link prefetch={false} href={`/admin/quotes/${q.reference}`}><div className="request-identity"><StatusBadge status={q.status}/><h3>{q.name??'Contact expired'}</h3><p>Studio Desk 01 · {q.configuration.sizeId} · {q.configuration.finishId}</p></div><div className="request-meta"><strong>{formatUsd(q.estimated_total_cents)} <small>USD</small></strong><FormattedDate value={q.created_at}/><span className="request-reference">{q.reference}</span></div><span className="request-open">Review request ↗</span></Link></li>)}</ul>:<EmptyState title="No requests in this view.">New demo requests appear here. Try another status filter to see earlier conversations.</EmptyState>}
 <nav className="pagination" aria-label="Inbox pages">{result.page>1&&<Link className="secondary-button" prefetch={false} href={href(result.page-1)}>Previous</Link>}<span>Page {result.page}</span>{result.hasNext&&<Link className="secondary-button" prefetch={false} href={href(result.page+1)}>Next</Link>}</nav></section>;
}
