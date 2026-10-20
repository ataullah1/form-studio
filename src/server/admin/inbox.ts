import 'server-only';
import { randomUUID } from 'node:crypto';
import type { ProductConfiguration } from '@/lib/catalog';
import { isStatus, pageNumber, statusChange } from '@/lib/admin/policy';
import { adminDB } from './db';
import { AdminError, requireAdmin } from './session';
export type InboxQuote = { reference: string; status: string; status_version: number; created_at: Date; configuration: ProductConfiguration; estimated_total_cents: number; catalog_version: string; name: string | null };
export async function listQuotes(status: string | undefined, page: string | undefined) {
  await requireAdmin();
  if (status && !isStatus(status)) throw new AdminError(400, 'Invalid status filter.');
  const currentPage = pageNumber(page); const size = 20;
  const { rows } = await adminDB().query<InboxQuote>(`SELECT q.reference,q.status,q.status_version,q.created_at,q.configuration,q.estimated_total_cents,q.catalog_version,c.name
    FROM app.quote_requests q LEFT JOIN app.quote_contacts c ON c.quote_id=q.id
    WHERE ($1::text IS NULL OR q.status=$1) ORDER BY q.created_at DESC,q.id DESC LIMIT $2 OFFSET $3`, [status || null, size + 1, (currentPage - 1) * size]);
  return { rows: rows.slice(0, size), hasNext: rows.length > size, page: currentPage };
}
export async function quoteDetail(reference: string) {
  await requireAdmin();
  if (!/^[A-Za-z0-9_-]{32}$/.test(reference)) throw new AdminError(404, 'Request not found.');
  const { rows } = await adminDB().query<InboxQuote & { id: string; email: string | null; company: string | null; country: string | null; message: string | null }>(`SELECT q.id,q.reference,q.status,q.status_version,q.created_at,q.configuration,q.estimated_total_cents,q.catalog_version,c.name,c.email,c.company,c.country,c.message
    FROM app.quote_requests q LEFT JOIN app.quote_contacts c ON c.quote_id=q.id WHERE q.reference=$1`, [reference]);
  if (!rows[0]) throw new AdminError(404, 'Request not found.');
  const history = await adminDB().query<{ from_status: string; to_status: string; actor_id: string; created_at: Date; version: number }>('SELECT from_status,to_status,actor_id,created_at,version FROM app.quote_status_history WHERE quote_id=$1 ORDER BY version', [rows[0].id]);
  return { quote: rows[0], history: history.rows };
}
export async function changeStatus(reference: string, input: unknown) {
  const actor = await requireAdmin();
  if (!/^[A-Za-z0-9_-]{32}$/.test(reference)) throw new AdminError(404, 'Request not found.');
  let change; try { change = statusChange(input); } catch { throw new AdminError(400, 'Invalid status change.'); }
  const client = await adminDB().connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query<{ id: string; status: string; status_version: number }>('SELECT id,status,status_version FROM app.quote_requests WHERE reference=$1 FOR UPDATE', [reference]);
    const row = rows[0];
    if (!row) throw new AdminError(404, 'Request not found.');
    if (row.status_version !== change.version || row.status === change.status) throw new AdminError(409, 'This request has changed. Reload to see its current status.');
    await client.query('UPDATE app.quote_requests SET status=$1,status_version=status_version+1 WHERE id=$2', [change.status, row.id]);
    await client.query('INSERT INTO app.quote_status_history(id,quote_id,actor_id,from_status,to_status,version) VALUES($1,$2,$3,$4,$5,$6)', [randomUUID(), row.id, actor.id, row.status, change.status, row.status_version + 1]);
    await client.query('COMMIT');
    return { status: change.status, version: row.status_version + 1 };
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
}
