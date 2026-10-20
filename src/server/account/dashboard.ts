import 'server-only';
import { adminDB } from '../admin/db';
import { AdminError, requireUser } from '../admin/session';
import { pageNumber, allowedUser } from '@/lib/admin/policy';
import type { ProductConfiguration } from '@/lib/catalog';
export type AccountDesign = { public_id: string; configuration: ProductConfiguration; estimated_total_cents: number; created_at: Date };
export type AccountQuote = { reference: string; configuration: ProductConfiguration; estimated_total_cents: number; created_at: Date; status: string; catalog_version: string };
export async function dashboard(page: string | undefined) {
  const user = await requireUser(); const current = pageNumber(page); const offset = (current - 1) * 20;
  // Identity always comes from the verified session, never URL/body/email input.
  const designs = await adminDB().query<AccountDesign>('SELECT public_id,configuration,estimated_total_cents,created_at FROM app.shared_configurations WHERE owner_user_id=$1 ORDER BY created_at DESC,public_id DESC LIMIT 21 OFFSET $2', [user.id, offset]);
  const quotes = await adminDB().query<AccountQuote>('SELECT reference,configuration,estimated_total_cents,created_at,status,catalog_version FROM app.quote_requests WHERE owner_user_id=$1 ORDER BY created_at DESC,id DESC LIMIT 21 OFFSET $2', [user.id, offset]);
  return { userId: user.id, admin: allowedUser(user.id), designs: designs.rows.slice(0,20), quotes: quotes.rows.slice(0,20), page: current, hasNext: designs.rows.length > 20 || quotes.rows.length > 20 };
}
export async function ownedQuote(reference: string) {
  const user = await requireUser();
  if (!/^[A-Za-z0-9_-]{32}$/.test(reference)) throw new AdminError(404, 'Request not found.');
  const { rows } = await adminDB().query<AccountQuote>('SELECT reference,configuration,estimated_total_cents,created_at,status,catalog_version FROM app.quote_requests WHERE reference=$1 AND owner_user_id=$2', [reference, user.id]);
  if (!rows[0]) throw new AdminError(404, 'Request not found.');
  return rows[0];
}
