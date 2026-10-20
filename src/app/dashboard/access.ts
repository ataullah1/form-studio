import { redirect } from 'next/navigation';
import { AdminError, requireUser } from '@/server/admin/session';
export async function accountAccess() {
  try { await requireUser(); return null; } catch(error) { if(error instanceof AdminError && error.status===401) redirect('/login'); return 'Your dashboard is temporarily unavailable. Please retry.'; }
}
