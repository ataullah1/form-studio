import 'server-only';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { isIP } from 'node:net';
import { database } from './db';
import { validateConfig, calculatePrice } from '../lib/catalog/pricing';
import type { SharedConfiguration } from '../generated/prisma/client';

export const PUBLIC_ID = /^[A-Za-z0-9_-]{32}$/;
export const IDEMPOTENCY_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export class ShareError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

/** Trust IP headers only when Vercel is the ingress; other hosts share a conservative bucket. */
export function rateIdentity(headers: Headers) {
  const secret = process.env.SHARE_RATE_LIMIT_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith('replace-')) throw new ShareError(503, 'Sharing is not configured yet.');
  const forwarded = process.env.VERCEL === '1' ? headers.get('x-forwarded-for')?.split(',')[0].trim() : undefined;
  const identity = forwarded && isIP(forwarded) ? forwarded : 'untrusted-ingress';
  return createHmac('sha256', secret).update(identity).digest('hex');
}

/** Database-clock fixed windows; each counter update is atomic across all instances. */
export async function consumeShareRate(identity: string, scope: 'share' | 'quote' | 'admin-auth' = 'share') {
  try {
    await database().$transaction(async tx => {
      for (const [key, limit] of [[`${scope}:global`, scope === 'share' ? 100 : 20], [`${scope}:${identity}`, scope === 'share' ? 10 : 5]] as const) {
        const rows = await tx.$queryRaw<{ count: number }[]>`
          INSERT INTO app.rate_buckets (key, window_start, count)
          VALUES (${key}, date_trunc('minute', CURRENT_TIMESTAMP), 1)
          ON CONFLICT (key) DO UPDATE SET
            window_start = EXCLUDED.window_start,
            count = CASE WHEN app.rate_buckets.window_start < EXCLUDED.window_start THEN 1 ELSE app.rate_buckets.count + 1 END
          WHERE app.rate_buckets.window_start < EXCLUDED.window_start OR app.rate_buckets.count < ${limit}
          RETURNING count`;
        if (rows.length === 0) throw new ShareError(429, 'Too many requests. Please try again in a minute.');
      }
    });
  } catch (error) { if (error instanceof ShareError) throw error; throw new ShareError(503, scope === 'admin-auth' ? 'Admin login is temporarily unavailable. Please retry.' : 'Sharing is temporarily unavailable. Your design is still here.'); }
}

export async function saveConfiguration(input: unknown, idempotencyKey: string) {
  if (!IDEMPOTENCY_KEY.test(idempotencyKey)) throw new ShareError(400, 'A valid save request key is required.');
  const configuration = validateConfig(input);
  const fingerprint = createHash('sha256').update(JSON.stringify(configuration)).digest('hex');
  return database().$transaction(async tx => {
    // Serialize only retries of the same key, including cross-instance races.
    await tx.$queryRaw`SELECT true AS locked FROM pg_advisory_xact_lock(hashtextextended(${idempotencyKey.toLowerCase()}, 0))`;
    const existing = await tx.sharedConfiguration.findUnique({ where: { idempotencyKey } });
    if (existing) {
      if (existing.fingerprint !== fingerprint) throw new ShareError(409, 'This save key belongs to a different design.');
      return { publicId: existing.publicId, created: false };
    }
    const price = calculatePrice(configuration);
    const record = await tx.sharedConfiguration.create({ data: {
      publicId: randomBytes(24).toString('base64url'), idempotencyKey, fingerprint,
      configuration: { ...configuration, accessoryIds: [...configuration.accessoryIds] },
      schemaVersion: configuration.schemaVersion, catalogVersion: configuration.catalogVersion,
      estimatedTotalCents: price.estimatedTotalCents,
    } });
    return { publicId: record.publicId, created: true };
  });
}

/** Explicit public allowlist. Idempotency keys, fingerprints and rate identities never leave the server. */
export function publicSnapshot(row: SharedConfiguration) {
  return { publicId: row.publicId, configuration: row.configuration, schemaVersion: row.schemaVersion,
    catalogVersion: row.catalogVersion, estimatedTotalCents: row.estimatedTotalCents, createdAt: row.createdAt.toISOString() };
}
export async function readSnapshot(publicId: string) {
  if (!PUBLIC_ID.test(publicId)) return null;
  const row = await database().sharedConfiguration.findUnique({ where: { publicId } });
  return row ? publicSnapshot(row) : null;
}
