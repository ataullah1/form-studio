import { optionalUser, AdminError, privateHeaders } from '@/server/admin/session';
export async function GET() {
  try { const user = await optionalUser(); return Response.json({ authenticated: !!user }, { headers: privateHeaders }); }
  catch(error) { return Response.json({ authenticated: false, error: error instanceof AdminError && error.status === 401 ? 'Session expired. Sign in again.' : 'Account status is temporarily unavailable.' }, { status: error instanceof AdminError ? error.status : 503, headers: privateHeaders }); }
}
