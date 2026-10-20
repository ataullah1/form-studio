import { jwtVerify, type JWTVerifyGetKey } from 'jose';
export async function verifyGoogleIdentity(idToken: string, audience: string, nonce: string, key: JWTVerifyGetKey) {
  const { payload } = await jwtVerify(idToken, key, { issuer: ['https://accounts.google.com', 'accounts.google.com'], audience, algorithms: ['RS256'], maxTokenAge: '10m', requiredClaims: ['sub', 'exp', 'iat', 'nonce'] });
  if (payload.nonce !== nonce || typeof payload.sub !== 'string' || !/^\d{1,255}$/.test(payload.sub) || (payload.azp !== undefined && payload.azp !== audience)) throw new Error('Invalid Google identity');
  return payload.sub;
}
