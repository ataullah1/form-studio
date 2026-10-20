import 'server-only';
import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { validateQuote } from '../lib/quotes/validation';
import { quoteServiceReady } from '../lib/quotes/service-policy';
import { calculatePrice } from '../lib/catalog/pricing';
import { database } from './db';
import { ShareError } from './sharing';

export class EstimateChanged extends Error {
  constructor(public offer: { catalogVersion: string; estimatedTotalCents: number }) { super('Please confirm the current estimate before sending this demo request.'); }
}
export async function submitQuote(input: unknown, key: string) {
  const payload = validateQuote(input);
  const cleanupSecret = process.env.CRON_SECRET;
  if (!quoteServiceReady(cleanupSecret, process.env.VERCEL, process.env.VERCEL_ENV)) throw new ShareError(503, 'Demo requests are temporarily unavailable.');
  const secret = process.env.SHARE_RATE_LIMIT_SECRET;
  if (!secret || secret.length < 32) throw new ShareError(503, 'Demo requests are temporarily unavailable.');
  const fingerprint = createHmac('sha256', secret).update('demo-quote:').update(JSON.stringify({ configuration: payload.configuration, contact: payload.contact, sourcePublicId: payload.sourcePublicId })).digest('hex');
  return database().$transaction(async tx => {
    await tx.$queryRaw`SELECT true AS locked FROM pg_advisory_xact_lock(hashtextextended(${'quote:' + key.toLowerCase()}, 0))`;
    const existing = await tx.quoteRequest.findUnique({ where: { idempotencyKey: key } });
    if (existing) {
      if (existing.fingerprint !== fingerprint) throw new ShareError(409, 'This request key belongs to a different demo enquiry.');
      return { reference: existing.reference, created: false, estimatedTotalCents: existing.estimatedTotalCents, catalogVersion: existing.catalogVersion };
    }
    const price = calculatePrice(payload.configuration);
    const source = payload.sourcePublicId ? await tx.sharedConfiguration.findUnique({ where: { publicId: payload.sourcePublicId } }) : null;
    if (payload.sourcePublicId && !source) throw new ShareError(400, 'The source design is unavailable. Start a new design to continue.');
    const needsConfirmation = source && (source.catalogVersion !== price.catalogVersion || source.estimatedTotalCents !== price.estimatedTotalCents);
    const confirmation = payload.priceConfirmation;
    if ((needsConfirmation || confirmation) && (!confirmation || confirmation.catalogVersion !== price.catalogVersion || confirmation.estimatedTotalCents !== price.estimatedTotalCents)) throw new EstimateChanged({ catalogVersion: price.catalogVersion, estimatedTotalCents: price.estimatedTotalCents });
    const id = randomUUID(); const reference = randomBytes(24).toString('base64url');
    // Use database defaults for both timestamps so contact expiry and creation share one clock.
    const configurationJSON = JSON.stringify(payload.configuration);
    await tx.$executeRaw`INSERT INTO app.quote_requests (id,reference,idempotency_key,fingerprint,configuration,catalog_version,estimated_total_cents,source_public_id)
      VALUES (${id}::uuid,${reference},${key}::uuid,${fingerprint},${configurationJSON}::jsonb,${price.catalogVersion},${price.estimatedTotalCents},${payload.sourcePublicId ?? null})`;
    const contact = payload.contact;
    // No SELECT permission on contact data; bind inserts explicitly without RETURNING private fields.
    await tx.$executeRaw`INSERT INTO app.quote_contacts (quote_id,name,email,company,country,message) VALUES (${id}::uuid,${contact.name},${contact.email},${contact.company},${contact.country},${contact.message})`;
    return { reference, created: true, estimatedTotalCents: price.estimatedTotalCents, catalogVersion: price.catalogVersion };
  }, { timeout: 10000 });
}
