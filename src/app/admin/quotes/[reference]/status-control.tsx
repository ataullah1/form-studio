'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { statuses } from '@/lib/admin/statuses';
export function StatusControl({ reference, status, version }: { reference: string; status: string; version: number }) {
  const router = useRouter(); const [choice, setChoice] = useState({ version, value: status }); const selected = choice.version === version ? choice.value : status; const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  useEffect(() => { const refresh = () => { if (document.visibilityState === 'visible') router.refresh(); }; window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', refresh); return () => { window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); }; }, [router]);
  return <form className="admin-filter" onSubmit={async event => {
    event.preventDefault(); if (busy) return; setBusy(true); setMessage('');
    try { const response = await fetch(`/api/admin/quotes/${reference}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: selected, version }), signal: AbortSignal.timeout(10000) });
      if (response.ok) setMessage('Status updated.'); else if (response.status === 409) setMessage('This request changed in another tab. Current status has been refreshed.'); else setMessage('Status could not be updated. Sign in again or retry.');
      router.refresh();
    } catch { setMessage('Update could not be confirmed. Reload before retrying.'); } finally { setBusy(false); }
  }}><label htmlFor="quote-status">Status</label><select id="quote-status" value={selected} onChange={event => setChoice({ version, value: event.target.value })}>{statuses.map(s => <option key={s}>{s}</option>)}</select><button type="submit" disabled={busy || selected === status}>{busy ? 'Saving…' : 'Update status'}</button><button type="button" onClick={() => router.refresh()}>Refresh</button><p role="status">{message}</p></form>;
}
