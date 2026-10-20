'use client';
import { useRef, useState } from 'react';
import type { ProductConfiguration } from '@/lib/catalog';

export function ShareButton({ configuration }: { configuration: ProductConfiguration }) {
  const payload = JSON.stringify(configuration);
  const requestKey = useRef<{ payload: string; key: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ payload: string; link?: string; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  async function save() {
    if (busy) return;
    if (requestKey.current?.payload !== payload) requestKey.current = { payload, key: crypto.randomUUID() };
    setBusy(true); setCopied(false);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/configurations', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestKey.current.key }, body: payload, signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Save could not be confirmed. Please retry.');
      if (typeof data.publicId !== 'string' || !/^[A-Za-z0-9_-]{32}$/.test(data.publicId)) throw new Error('Save could not be confirmed. Please retry.');
      setResult({ payload, link: `${window.location.origin}/s/${data.publicId}` });
    } catch (error) { setResult({ payload, error: error instanceof Error && error.name !== 'AbortError' ? error.message : 'Save could not be confirmed. Please retry; your design is still here.' }); }
    finally { clearTimeout(timer); setBusy(false); }
  }
  const current = result?.payload === payload ? result : null;
  return <div className="share-control">
    <button type="button" className="share" disabled={busy} onClick={save}>{busy ? 'Saving design…' : 'Save & share'}</button>
    <div role="status" aria-live="polite">
      {current?.error && <p>{current.error}</p>}
      {current?.link && <>
        <p>Design saved. Anyone with this link can view this design.</p>
        <label className="share-link">Share link<input value={current.link} readOnly onFocus={event => event.target.select()} /></label>
        <a className="text-link" href={current.link}>Open saved design ↗</a>
        <button type="button" className="secondary-button" onClick={async () => { try { await navigator.clipboard.writeText(current.link!); setCopied(true); } catch { setCopied(false); } }}>{copied ? 'Link copied' : 'Copy link'}</button>
      </>}
    </div>
  </div>;
}
