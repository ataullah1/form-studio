import { changeStatus } from '@/server/admin/inbox';
import { AdminError, adminFailure, checkOrigin, privateHeaders, requireAdmin } from '@/server/admin/session';
export async function POST(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    checkOrigin(request); await requireAdmin();
    if (request.headers.get('content-type')?.split(';')[0] !== 'application/json') throw new AdminError(415, 'JSON is required.');
    const reader = request.body?.getReader(); if (!reader) throw new AdminError(400, 'Request body required.');
    let text = ''; const decoder = new TextDecoder(); let bytes = 0;
    try { while (true) { const { value, done } = await reader.read(); if (done) break; bytes += value.length; if (bytes > 1024) { await reader.cancel(); throw new AdminError(413, 'Request too large.'); } text += decoder.decode(value, { stream: true }); } text += decoder.decode(); } finally { reader.releaseLock(); }
    let input; try { input = JSON.parse(text); } catch { throw new AdminError(400, 'Invalid JSON.'); }
    return Response.json(await changeStatus((await params).reference, input), { headers: privateHeaders });
  } catch (error) { return adminFailure(error); }
}
