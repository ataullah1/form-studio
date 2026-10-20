import 'server-only';
import { createRemoteJWKSet } from 'jose';
import { verifyGoogleIdentity } from '../../lib/admin/google';
import { adminOrigin, allowedUser, digest, token } from '../../lib/admin/policy';
import { adminDB } from './db';
import { AdminError } from './session';
const keys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'), { timeoutDuration: 5000 });
function config() {
  const client = process.env.GOOGLE_CLIENT_ID; const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!client || !secret || client.startsWith('replace-') || secret.startsWith('replace-')) throw new Error('Google login unavailable');
  return { client, secret, callback: adminOrigin() + '/api/admin/auth/callback' };
}
export async function startGoogleLogin(destination: '/dashboard' | '/admin/quotes' = '/admin/quotes') {
  const { client, callback } = config();
  const state = token(); const binding = token(); const verifier = token(); const nonce = token();
  await adminDB().query('INSERT INTO app.admin_login_flows(state_hash,binding_hash,verifier,nonce,destination,expires_at) VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP + INTERVAL \'10 minutes\')', [digest(state), digest(binding), verifier, nonce, destination]);
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({ client_id: client, redirect_uri: callback, response_type: 'code', scope: 'openid', state, nonce, code_challenge_method: 'S256', code_challenge: Buffer.from(digest(verifier), 'hex').toString('base64url'), prompt: 'select_account' }).toString();
  return { url: url.toString(), binding };
}
export async function finishGoogleLogin(state: string, binding: string, code: string) {
  const { client, secret, callback } = config();
  if (!/^[A-Za-z0-9_-]{43}$/.test(state) || !/^[A-Za-z0-9_-]{43}$/.test(binding) || !code || code.length > 4096) throw new AdminError(400, 'Login expired. Please try again.');
  // Consume once before provider exchange; parallel callbacks cannot create two sessions.
  const { rows } = await adminDB().query<{ verifier: string; nonce: string; destination: string }>('DELETE FROM app.admin_login_flows WHERE state_hash=$1 AND binding_hash=$2 AND expires_at > CURRENT_TIMESTAMP RETURNING verifier,nonce,destination', [digest(state), digest(binding)]);
  if (!rows[0]) throw new AdminError(400, 'Login expired. Please try again.');
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: client, client_secret: secret, code, code_verifier: rows[0].verifier, grant_type: 'authorization_code', redirect_uri: callback }), cache: 'no-store', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new AdminError(400, 'Google login could not be verified. Please try again.');
  const result: unknown = await response.json();
  if (!result || typeof result !== 'object' || !('id_token' in result) || typeof result.id_token !== 'string') throw new AdminError(400, 'Google login could not be verified.');
  const id = await verifyGoogleIdentity(result.id_token, client, rows[0].nonce, keys);

  const session = token();
  await adminDB().query('INSERT INTO app.admin_sessions(token_hash,user_id,expires_at) VALUES($1,$2,CURRENT_TIMESTAMP + INTERVAL \'8 hours\')', [digest(session), id]);
  return { session, destination: rows[0].destination === '/admin/quotes' && allowedUser(id) ? '/admin/quotes' : '/dashboard' };
}
