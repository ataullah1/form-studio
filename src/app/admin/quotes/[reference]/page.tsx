import Link from 'next/link';
import { notFound } from 'next/navigation';
import { quoteDetail } from '@/server/admin/inbox';
import { AdminError } from '@/server/admin/session';
import { checkAccess } from '../access';
import { StatusControl } from './status-control';
export default async function QuotePage({ params }: { params: Promise<{ reference: string }> }) {
  const denied = await checkAccess(); if (denied) return <p role="alert">{denied}</p>;
  let result; try { result = await quoteDetail((await params).reference); } catch (error) { if (error instanceof AdminError && error.status === 404) notFound(); return <p role="alert">Request could not be loaded. Please try again.</p>; }
  const { quote: q, history } = result;
  return <article><Link prefetch={false} href="/admin/quotes">← All enquiries</Link><h1>Demo request</h1><p className="admin-reference">{q.reference}</p><p>Received {q.created_at.toISOString()} · Saved estimate ${(q.estimated_total_cents / 100).toFixed(2)} USD · Catalog {q.catalog_version}</p><StatusControl reference={q.reference} status={q.status} version={q.status_version} />
    <section className="admin-card"><h2>Contact</h2>{q.name === null ? <p>Contact details have expired and are unavailable.</p> : <dl><dt>Name</dt><dd>{q.name}</dd><dt>Email</dt><dd>{q.email}</dd><dt>Company</dt><dd>{q.company || '—'}</dd><dt>Country</dt><dd>{q.country || '—'}</dd><dt>Message</dt><dd className="admin-message">{q.message || '—'}</dd></dl>}</section>
    <section className="admin-card"><h2>Original configuration</h2><pre>{JSON.stringify(q.configuration, null, 2)}</pre></section><section><h2>Status history</h2>{history.length ? <ol>{history.map(h => <li key={h.version}>{h.from_status} → {h.to_status} · {h.created_at.toISOString()} · Admin {h.actor_id}</li>)}</ol> : <p>No status changes yet.</p>}</section></article>;
}
