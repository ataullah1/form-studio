import { NextRequest, NextResponse } from 'next/server';
import { finishGoogleLogin } from '@/server/admin/google';
import { adminOrigin } from '@/lib/admin/policy';
import { adminFailure, cookieOptions, FLOW_COOKIE, privateHeaders, SESSION_COOKIE, sessionCookieOptions } from '@/server/admin/session';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const session = await finishGoogleLogin(params.get('state') ?? '', request.cookies.get(FLOW_COOKIE)?.value ?? '', params.get('code') ?? '');
    const response = NextResponse.redirect(adminOrigin() + session.destination, { status: 303, headers: privateHeaders });
    response.cookies.set(FLOW_COOKIE, '', cookieOptions(0));
    response.cookies.set(SESSION_COOKIE, session.session, sessionCookieOptions(8 * 3600));
    return response;
  } catch (error) {
    const failure = adminFailure(error);
    const response = NextResponse.json(await failure.json(), { status: failure.status, headers: privateHeaders });
    try { response.cookies.set(FLOW_COOKIE, '', cookieOptions(0)); } catch { /* Missing configuration already fails closed. */ }
    return response;
  }
}
