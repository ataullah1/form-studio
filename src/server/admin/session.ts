import 'server-only';
import { cookies } from 'next/headers';
import { ShareError } from '../sharing';
import { adminDB } from './db';
import { adminOrigin, allowedUser, digest } from '@/lib/admin/policy';
export const SESSION_COOKIE = 'fs_admin_session';
export const FLOW_COOKIE = 'fs_admin_flow';
export class AdminError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: adminOrigin().startsWith('https:'), sameSite: 'lax' as const, path: '/api/admin', maxAge };
}
export function sessionCookieOptions(maxAge: number) { return { ...cookieOptions(maxAge), path: '/' }; }
export async function requireAdmin() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value || !/^[A-Za-z0-9_-]{43}$/.test(value)) throw new AdminError(401, 'Sign in to continue.');
  const { rows } = await adminDB().query<{ user_id: string }>('SELECT user_id FROM app.admin_sessions WHERE token_hash=$1 AND expires_at > CURRENT_TIMESTAMP', [digest(value)]);
  if (!rows[0]) throw new AdminError(401, 'Your session has expired. Sign in again.');
  if (!allowedUser(rows[0].user_id)) throw new AdminError(403, 'This account cannot access the inbox.');
  return { id: rows[0].user_id, tokenHash: digest(value) };
}
export function checkOrigin(request: Request) {
  if (request.headers.get('origin') !== adminOrigin()) throw new AdminError(403, 'Invalid request origin.');
}
export const privateHeaders = { 'Cache-Control': 'private, no-store, max-age=0', 'Referrer-Policy': 'same-origin', 'X-Robots-Tag': 'noindex, nofollow' };
export function adminFailure(error: unknown) {
  return Response.json({ error: error instanceof AdminError || error instanceof ShareError ? error.message : 'Admin service is temporarily unavailable.' }, { status: error instanceof AdminError || error instanceof ShareError ? error.status : 503, headers: privateHeaders });
}
