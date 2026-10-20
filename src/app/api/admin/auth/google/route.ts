import { safeReturnPath, signReturnPath } from '@/lib/auth/return-path';
import { NextResponse } from 'next/server';
import { startGoogleLogin } from '@/server/admin/google';
import { adminFailure, checkOrigin, cookieOptions, FLOW_COOKIE, privateHeaders } from '@/server/admin/session';
import { consumeShareRate, rateIdentity } from '@/server/sharing';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await consumeShareRate(rateIdentity(request.headers), 'admin-auth');
    const flow = await startGoogleLogin(new URL(request.url).searchParams.get('intent') === 'account' ? '/dashboard' : '/admin/quotes');
    const response = request.headers.get('accept')?.includes('application/json') ? NextResponse.json({ url: flow.url }, { headers: privateHeaders }) : NextResponse.redirect(flow.url, { status: 303, headers: privateHeaders });
    const account = new URL(request.url).searchParams.get('intent') === 'account';
    response.cookies.set('fs_login_return', signReturnPath(safeReturnPath(new URL(request.url).searchParams.get('returnTo') ?? (account?'/dashboard':'/admin/quotes'), !account), flow.binding, !account), cookieOptions(600));
    response.cookies.set(FLOW_COOKIE, flow.binding, cookieOptions(600));
    return response;
  } catch (error) { return adminFailure(error); }
}
