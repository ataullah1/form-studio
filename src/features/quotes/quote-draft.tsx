'use client';
import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { calculatePrice } from '@/lib/catalog/pricing';
import { catalogV1, formatUsd, type ProductConfiguration } from '@/lib/catalog';

const empty = { name: '', email: '', company: '', country: '', message: '' };
interface Offer { catalogVersion: string; estimatedTotalCents: number }
export function QuoteDraft({ configuration, active = true, sourcePublicId }: { configuration: ProductConfiguration; active?: boolean; sourcePublicId?: string }) {
  const [contact, setContact] = useState(empty);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [offer, setOffer] = useState<{ configuration: string; value: Offer } | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [receipt, setReceipt] = useState<{ reference: string; estimatedTotalCents: number } | null>(null);
  const pending = useRef<{ body: string; key: string } | null>(null);
  const configurationJSON = JSON.stringify(configuration);
  const currentOffer = offer?.configuration === configurationJSON ? offer.value : null;
  const price = calculatePrice(configuration);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || !active) return;
    const body = { configuration, contact, website, consent, ...(sourcePublicId ? { sourcePublicId } : {}) };
    const identity = JSON.stringify(body);
    if (pending.current?.body !== identity) pending.current = { body: identity, key: crypto.randomUUID() };
    setBusy(true); setErrors({}); setReceipt(null);
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/api/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': pending.current.key }, signal: controller.signal,
        body: JSON.stringify({ ...body, ...(currentOffer && accepted ? { priceConfirmation: currentOffer } : {}) }),
      });
      const result = await response.json();
      if (response.status === 409 && result.offer && typeof result.offer.catalogVersion === 'string' && Number.isSafeInteger(result.offer.estimatedTotalCents)) {
        setOffer({ configuration: configurationJSON, value: result.offer }); setAccepted(false);
        setErrors({ form: 'The current estimate needs your confirmation. Review it below and submit again.' }); return;
      }
      if (!response.ok) { setErrors(result.fields && typeof result.fields === 'object' ? { ...result.fields, form: result.error } : { form: result.error ?? 'Request could not be confirmed. Please retry.' }); return; }
      if (!/^[A-Za-z0-9_-]{32}$/.test(result.reference) || !Number.isSafeInteger(result.estimatedTotalCents)) throw new Error('Unconfirmed response');
      setReceipt({ reference: result.reference, estimatedTotalCents: result.estimatedTotalCents });
      setContact(empty); setConsent(false); setWebsite(''); setOffer(null); setAccepted(false); pending.current = null;
    } catch { setErrors({ form: 'Demo request could not be confirmed. Your fields are still here; please retry.' }); }
    finally { clearTimeout(timer); setBusy(false); }
  }
  return <section id="quote-draft" className="quote-draft" aria-labelledby="quote-title">
    <div><p className="eyebrow">NEXT / YOUR PROJECT</p><h2 id="quote-title">Request a quote.</h2>
      <p>Tell us a little about your workspace. This concept demo stores your request privately; no order is placed or email sent. Please use fictional contact details.</p>
      <div className="quote-selection" style={{ visibility: active ? 'visible' : 'hidden' }} aria-label="Quote design summary"><p>{catalogV1.sizes[configuration.sizeId].label} · {catalogV1.finishes[configuration.finishId].label} · {catalogV1.frameColours[configuration.frameColourId].label} frame</p>
        <p>{configuration.accessoryIds.length ? configuration.accessoryIds.map(id => catalogV1.accessories[id].label).join(', ') : 'No accessories'}</p>
        <p>Your selected design · <strong>{formatUsd(price.estimatedTotalCents)} USD</strong>. Tax and shipping excluded.</p>
      </div>
    </div>
    <form action="/api/quotes" method="post" onSubmit={submit} aria-label="Demo quote request" autoComplete="off">
      {receipt && <div className="quote-success" role="status"><p>Demo request received. Your design and estimate are saved. No email was sent and no furniture order was placed.</p><p>Reference: <strong>{receipt.reference}</strong></p><p>If signed in, track the status in <Link href="/dashboard">your dashboard</Link>.</p><p>Recorded estimate: {formatUsd(receipt.estimatedTotalCents)} USD</p></div>}
      <fieldset className="quote-fields" disabled={busy} aria-describedby="quote-draft-note"><legend className="sr-only">Quote request details</legend>
        {(['name', 'email', 'company', 'country', 'message'] as const).map(key => <label key={key} className={key === 'message' ? 'full-width' : ''}>
          {key === 'message' ? 'Project message' : key[0].toUpperCase() + key.slice(1)}{key !== 'name' && key !== 'email' && <span>(optional)</span>}
          {key === 'message' ? <textarea name={key} value={contact[key]} onChange={event => setContact(previous => ({ ...previous, [key]: event.target.value }))} maxLength={1000} rows={4} placeholder="Tell us about your workspace concept" aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `quote-error-${key}` : undefined} /> :
            <input name={key} type={key === 'email' ? 'email' : 'text'} value={contact[key]} onChange={event => setContact(previous => ({ ...previous, [key]: event.target.value }))} autoComplete="off" required={key === 'name' || key === 'email'} maxLength={{ name: 100, email: 254, company: 120, country: 100 }[key]} placeholder={key === 'name' ? 'Use fictional demo details' : key === 'email' ? 'hello@example.com' : undefined} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `quote-error-${key}` : undefined} />}
          {errors[key] && <span id={`quote-error-${key}`} className="field-error">{errors[key]}</span>}
        </label>)}
        <div className="quote-trap" aria-hidden="true"><label>Website<input name="website" value={website} onChange={event => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" maxLength={200} /></label></div>
        <label className="quote-consent full-width"><input name="consent" type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} required />I understand this is a demo enquiry and my contact details will be stored temporarily.</label>
        {currentOffer && <div className="full-width quote-price-review"><p>Updated estimate: {formatUsd(currentOffer.estimatedTotalCents)} USD · Catalog {currentOffer.catalogVersion}. Tax and shipping excluded.</p><label className="quote-consent"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} required />I confirm this current estimate.</label></div>}
        <p className="full-width fine">Sign in before submitting to track your request in My studio. Guest requests stay separate.</p>
        <p id="quote-draft-note" className="full-width">Contact details are scheduled for deletion within seven days. They never appear in public design links.</p>
        {Object.keys(errors).length > 0 && <div className="full-width quote-error" role="alert">{errors.form ?? errors.configuration ?? errors.consent ?? 'Check the highlighted fields.'}</div>}
        <button type="submit" className="button full-width" disabled={!active || busy || !consent || (!!currentOffer && !accepted)}>{busy ? 'Sending demo request…' : 'Send demo request'}</button>
        {!active && <p className="full-width">Enable JavaScript to submit this demo enquiry.</p>}
      </fieldset>
    </form>
  </section>;
}
