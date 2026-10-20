import { AccountRefresh } from '@/features/account/account-refresh';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ownedQuote } from '@/server/account/dashboard';
import { AdminError } from '@/server/admin/session';
import { formatUsd } from '@/lib/catalog';
import { accountAccess } from '../../access';
export default async function AccountQuotePage({params}:{params:Promise<{reference:string}>}) {
  const denied=await accountAccess();if(denied)return <p role="alert">{denied}</p>;
  let quote;try{quote=await ownedQuote((await params).reference);}catch(error){if(error instanceof AdminError&&error.status===404)notFound();return <p role="alert">Request could not be loaded.</p>;}
  return <article><Link href="/dashboard">← Your dashboard</Link><div className="admin-heading"><h1>Your demo request</h1><AccountRefresh /></div><p className="admin-reference">{quote.reference}</p><p>Status: <strong>{quote.status}</strong></p><p>Saved estimate: {formatUsd(quote.estimated_total_cents)} USD · Catalog {quote.catalog_version}</p><p>Received {quote.created_at.toISOString()}. No furniture order or email was created.</p><section className="admin-card"><h2>Your submitted design</h2><pre>{JSON.stringify(quote.configuration,null,2)}</pre></section><p>Contact details are stored temporarily for the private admin review; your request status remains available after contact cleanup.</p></article>;
}
