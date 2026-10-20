import { timingSafeEqual } from 'node:crypto';
import { database } from '@/server/db';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32 || secret.startsWith('replace-')) return Response.json({ error: 'Cleanup is not configured.' }, { status: 503, headers });
  const actual = Buffer.from(request.headers.get('authorization') ?? ''); const expected = Buffer.from(`Bearer ${secret}`);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return Response.json({ error: 'Unauthorized.' }, { status: 401, headers });
  try {
    const rows = await database().$queryRaw<{ removed: number }[]>`SELECT app.purge_expired_demo_contacts() AS removed`;
    return Response.json({ removedContacts: rows[0].removed }, { headers });
  } catch { return Response.json({ error: 'Cleanup failed. Retry and check the scheduled job.' }, { status: 503, headers }); }
}
