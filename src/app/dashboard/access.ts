import { redirect } from 'next/navigation';
import { AdminError, requireUser } from '@/server/admin/session';
export async function accountAccess(returnTo='/dashboard') {
  try { await requireUser(); return null; } catch(error) { if(error instanceof AdminError && error.status===401) redirect(returnTo==='/dashboard'?'/login':'/login?'+new URLSearchParams({returnTo})); return 'Your dashboard is temporarily unavailable. Please retry.'; }
}
