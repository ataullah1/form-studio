import { NextResponse } from 'next/server';
import { startGoogleLogin } from '@/server/admin/google';
import { adminFailure, checkOrigin, cookieOptions, FLOW_COOKIE, privateHeaders } from '@/server/admin/session';
import { consumeShareRate, rateIdentity } from '@/server/sharing';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await consumeShareRate(rateIdentity(request.headers), 'admin-auth');
    const flow = await startGoogleLogin();
    const response = NextResponse.redirect(flow.url, { status: 303, headers: privateHeaders });
    response.cookies.set(FLOW_COOKIE, flow.binding, cookieOptions(600));
    return response;
  } catch (error) { return adminFailure(error); }
}
