import { NextResponse } from 'next/server';
import { adminDB } from '@/server/admin/db';
import { adminOrigin } from '@/lib/admin/policy';
import { adminFailure, checkOrigin, privateHeaders, requireAdmin, SESSION_COOKIE, sessionCookieOptions } from '@/server/admin/session';
export async function POST(request: Request) {
  try {
    checkOrigin(request); const admin = await requireAdmin();
    await adminDB().query('DELETE FROM app.admin_sessions WHERE token_hash=$1', [admin.tokenHash]);
    const response = NextResponse.redirect(adminOrigin() + '/admin/login', { status: 303, headers: privateHeaders });
    response.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0)); return response;
  } catch (error) { return adminFailure(error); }
}
