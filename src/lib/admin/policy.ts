import { createHash, randomBytes } from 'node:crypto';
import { statuses, type QuoteStatus } from './statuses';
export { statuses } from './statuses';
export const isStatus = (value: unknown): value is QuoteStatus => typeof value === 'string' && statuses.includes(value as QuoteStatus);
export const token = () => randomBytes(32).toString('base64url');
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export const allowedUser = (id: string, allowlist = process.env.ADMIN_GOOGLE_SUB_IDS) => !!id && (allowlist ?? '').split(',').map(v => v.trim()).filter(Boolean).includes(id);
export function adminOrigin(value = process.env.ADMIN_ORIGIN) {
  if (!value) throw new Error('Admin login unavailable');
  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/' || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))) throw new Error('Invalid admin origin');
  return url.origin;
}
export function pageNumber(value: string | undefined) {
  return value && /^[1-9]\d{0,4}$/.test(value) ? Number(value) : 1;
}
export function statusChange(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid status change');
  const value = input as Record<string, unknown>;
  if (Object.keys(value).some(k => !['status', 'version'].includes(k)) || !isStatus(value.status) || !Number.isSafeInteger(value.version) || (value.version as number) < 0) throw new Error('Invalid status change');
  return { status: value.status, version: value.version as number };
}
