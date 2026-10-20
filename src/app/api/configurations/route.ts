import { AdminError, optionalUser } from '@/server/admin/session';
import { ShareError, IDEMPOTENCY_KEY, rateIdentity, consumeShareRate, saveConfiguration } from '@/server/sharing';
import { validateConfig } from '@/lib/catalog/pricing';
export const runtime = 'nodejs';
const MAX_BYTES = 4096;
const headers = { 'Cache-Control': 'no-store' };
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin) {
      let originURL;
      try { originURL = new URL(origin); } catch { return Response.json({ error: 'Invalid request origin.' }, { status: 403, headers }); }
      // Next may use an internal localhost URL; Host is the incoming public authority.
      const authority = request.headers.get('host') ?? new URL(request.url).host;
      if (!['http:', 'https:'].includes(originURL.protocol) || originURL.host !== authority) return Response.json({ error: 'Cross-origin saving is not allowed.' }, { status: 403, headers });
    }
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return Response.json({ error: 'Use JSON for this save.' }, { status: 415, headers });
    const key = request.headers.get('idempotency-key') ?? '';
    if (!IDEMPOTENCY_KEY.test(key)) return Response.json({ error: 'A valid save request key is required.' }, { status: 400, headers });
    if (Number(request.headers.get('content-length')) > MAX_BYTES) return Response.json({ error: 'Design payload is too large.' }, { status: 413, headers });
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: 'Design payload is required.' }, { status: 400, headers });
    const chunks: Uint8Array[] = []; let length = 0;
    try {
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        length += value.byteLength;
        if (length > MAX_BYTES) { await reader.cancel(); return Response.json({ error: 'Design payload is too large.' }, { status: 413, headers }); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    let configuration;
    try { configuration = validateConfig(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
    catch { return Response.json({ error: 'This design contains invalid options or an unsupported version.' }, { status: 400, headers }); }
    await consumeShareRate(rateIdentity(request.headers));
    const user = await optionalUser();
    const result = await saveConfiguration(configuration, key, user?.id ?? null);
    return Response.json({ publicId: result.publicId, path: `/s/${result.publicId}` }, { status: result.created ? 201 : 200, headers });
  } catch (error) {
    if (error instanceof AdminError) return Response.json({ error: error.status === 401 ? 'Your session expired. Sign in again before saving or submitting.' : error.message }, { status: error.status, headers });
    if (!(error instanceof ShareError)) console.error('[configuration-save] Database operation failed', { code: error && typeof error === 'object' && 'code' in error ? String(error.code) : 'unknown' });
    const status = error instanceof ShareError ? error.status : 503;
    return Response.json({ error: error instanceof ShareError ? error.message : 'Sharing is temporarily unavailable. Your design is still here.' }, { status, headers: { ...headers, ...(status === 429 ? { 'Retry-After': '60' } : {}) } });
  }
}
