import { AdminError, optionalUser } from '@/server/admin/session';
import { QuoteValidationError, validateQuote } from '@/lib/quotes/validation';
import { submitQuote, EstimateChanged } from '@/server/quotes';
import { IDEMPOTENCY_KEY, ShareError, rateIdentity, consumeShareRate } from '@/server/sharing';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin) {
      let parsed; try { parsed = new URL(origin); } catch { return Response.json({ error: 'Invalid origin.' }, { status: 403, headers }); }
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.host !== (request.headers.get('host') ?? new URL(request.url).host)) return Response.json({ error: 'Cross-origin requests are not allowed.' }, { status: 403, headers });
    }
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return Response.json({ error: 'Use the demo request form.' }, { status: 415, headers });
    const key = request.headers.get('idempotency-key') ?? '';
    if (!IDEMPOTENCY_KEY.test(key)) return Response.json({ error: 'A valid request key is required.' }, { status: 400, headers });
    const max = 16384;
    if (Number(request.headers.get('content-length')) > max) return Response.json({ error: 'Request is too large.' }, { status: 413, headers });
    const reader = request.body?.getReader(); if (!reader) return Response.json({ error: 'Request is empty.' }, { status: 400, headers });
    const chunks: Uint8Array[] = []; let bytes = 0;
    try { while (true) { const { done, value } = await reader.read(); if (done) break; bytes += value.length;
      if (bytes > max) { await reader.cancel(); return Response.json({ error: 'Request is too large.' }, { status: 413, headers }); } chunks.push(value);
    } } finally { reader.releaseLock(); }
    let input; try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return Response.json({ error: 'Invalid request body.' }, { status: 400, headers }); }
    validateQuote(input);
    await consumeShareRate(rateIdentity(request.headers), 'quote');
    const user = await optionalUser();
    const result = await submitQuote(input, key, user?.id ?? null);
    return Response.json({ reference: result.reference, estimatedTotalCents: result.estimatedTotalCents, catalogVersion: result.catalogVersion }, { status: result.created ? 201 : 200, headers });
  } catch (error) {
    if (error instanceof AdminError) return Response.json({ error: error.status === 401 ? 'Your session expired. Sign in again before saving or submitting.' : error.message }, { status: error.status, headers });
    if (error instanceof QuoteValidationError) return Response.json({ error: error.message, fields: error.fields }, { status: 400, headers });
    if (error instanceof EstimateChanged) return Response.json({ error: error.message, offer: error.offer }, { status: 409, headers });
    const status = error instanceof ShareError ? error.status : 503;
    return Response.json({ error: error instanceof ShareError && status !== 503 ? error.message : 'Demo request could not be confirmed. Your fields are still here; please retry.' }, { status, headers: { ...headers, ...(status === 429 ? { 'Retry-After': '60' } : {}) } });
  }
}
