import { redirect } from 'next/navigation';
import { AdminError, requireAdmin } from '@/server/admin/session';
export async function checkAccess(returnTo='/admin/quotes') {
  try { await requireAdmin(); return null; } catch (error) {
    if (error instanceof AdminError && error.status === 401) redirect(returnTo==='/admin/quotes'?'/admin/login':'/admin/login?'+new URLSearchParams({returnTo}));
    return error instanceof AdminError ? error.message : 'The private inbox is temporarily unavailable.';
  }
}
