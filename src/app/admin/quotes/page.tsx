import Link from 'next/link';
import { listQuotes } from '@/server/admin/inbox';
import { statuses } from '@/lib/admin/policy';
import { checkAccess } from './access';
export default async function InboxPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const denied = await checkAccess(); if (denied) return <p role="alert">{denied}</p>;
  const query = await searchParams;
  let result; try { result = await listQuotes(query.status, query.page); } catch { return <p role="alert">Inbox could not be loaded. Check the filter or try again.</p>; }
  const href = (page: number) => `/admin/quotes?${new URLSearchParams({ page: String(page), ...(query.status ? { status: query.status } : {}) })}`;
  return <section><div className="admin-heading"><h1>Demo enquiries</h1><form action="/api/admin/logout" method="post"><button type="submit">Sign out</button></form></div><form className="admin-filter" method="get"><label htmlFor="inbox-status">Status</label><select id="inbox-status" name="status" defaultValue={query.status ?? ''}><option value="">All statuses</option>{statuses.map(s => <option key={s}>{s}</option>)}</select><button type="submit">Filter</button></form>
    {result.rows.length ? <ul className="admin-list">{result.rows.map(q => <li key={q.reference}><Link prefetch={false} href={`/admin/quotes/${q.reference}`}><strong>{q.name ?? 'Contact expired'}</strong><span>Studio Desk 01 · {q.configuration.sizeId} · {q.configuration.finishId}</span><span>{q.status} · {q.created_at.toISOString().slice(0, 10)}</span></Link></li>)}</ul> : <p>No enquiries in this view.</p>}
    <nav className="admin-pagination" aria-label="Inbox pages">{result.page > 1 && <Link prefetch={false} href={href(result.page - 1)}>Previous</Link>}<span>Page {result.page}</span>{result.hasNext && <Link prefetch={false} href={href(result.page + 1)}>Next</Link>}</nav></section>;
}
