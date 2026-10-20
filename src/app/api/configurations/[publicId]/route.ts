import { readSnapshot } from '@/server/sharing';
import { resolveSnapshot } from '@/lib/catalog/snapshot';
export const runtime = 'nodejs';
export async function GET(_request: Request, { params }: { params: Promise<{ publicId: string }> }) {
  try {
    const snapshot = await readSnapshot((await params).publicId);
    if (!snapshot) return Response.json({ error: 'Shared design not found.' }, { status: 404 });
    if (!resolveSnapshot(snapshot)) return Response.json({ error: 'This design version is unavailable.' }, { status: 410 });
    return Response.json(snapshot, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: 'Shared designs are temporarily unavailable.' }, { status: 503 }); }
}
