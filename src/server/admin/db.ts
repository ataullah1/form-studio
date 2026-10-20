import 'server-only';
import { Pool } from 'pg';
const globalAdmin = globalThis as unknown as { adminPool?: Pool };
export function adminDB() {
  if (!process.env.ADMIN_DATABASE_URL) throw new Error('Admin database unavailable');
  return globalAdmin.adminPool ??= new Pool({ connectionString: process.env.ADMIN_DATABASE_URL, max: 2, connectionTimeoutMillis: 15000, idleTimeoutMillis: 10000 });
}
