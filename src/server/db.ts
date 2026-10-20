import 'server-only';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalDB = globalThis as unknown as { formStudioDB?: PrismaClient };
export function database() {
  if (!process.env.DATABASE_URL) throw new Error('Database unavailable');
  if (!globalDB.formStudioDB) globalDB.formStudioDB = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 5000, idleTimeoutMillis: 10000 }),
  });
  return globalDB.formStudioDB;
}
