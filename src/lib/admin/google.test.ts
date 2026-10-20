import { beforeAll, describe, expect, it } from 'vitest';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTVerifyGetKey, type JWTPayload } from 'jose';
import { verifyGoogleIdentity } from './google';
let privateKey: CryptoKey; let keys: JWTVerifyGetKey;
beforeAll(async () => { const pair = await generateKeyPair('RS256'); privateKey = pair.privateKey; const publicKey = await exportJWK(pair.publicKey); keys = createLocalJWKSet({ keys: [{ ...publicKey, kid: 'test', alg: 'RS256' }] }); });
async function signed(extra: JWTPayload = {}) {
  return new SignJWT({ sub: '123456789012345678901', nonce: 'bound-nonce', ...extra }).setProtectedHeader({ alg: 'RS256', kid: 'test' }).setIssuer(String(extra.iss ?? 'https://accounts.google.com')).setAudience(String(extra.aud ?? 'client')).setIssuedAt().setExpirationTime(extra.exp ?? '5m').sign(privateKey);
}
describe('Google identity verification', () => {
  it('accepts a signed audience-bound identity with matching nonce', async () => { expect(await verifyGoogleIdentity(await signed(), 'client', 'bound-nonce', keys)).toBe('123456789012345678901'); });
  it.each([
    { iss: 'https://attacker.example' }, { aud: 'other-client' }, { exp: 1 }, { nonce: 'replayed' }, { azp: 'another-client' }, { sub: '' },
  ])('rejects invalid signed claims %j', async claims => { await expect(verifyGoogleIdentity(await signed(claims), 'client', 'bound-nonce', keys)).rejects.toThrow(); });
  it('rejects forged signatures', async () => { const jwt = await signed(); const [header,payload] = jwt.split('.'); await expect(verifyGoogleIdentity(`${header}.${payload}.${'a'.repeat(342)}`, 'client', 'bound-nonce', keys)).rejects.toThrow(); });
});
