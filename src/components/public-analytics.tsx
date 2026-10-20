'use client';
import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
function privatePath(path: string) { return path === '/login' || path === '/dashboard' || path.startsWith('/dashboard/') || path === '/admin' || path.startsWith('/admin/'); }
export function PublicAnalytics() {
  const path = usePathname();
  if (privatePath(path)) return null;
  return <Analytics beforeSend={event => privatePath(new URL(event.url).pathname) ? null : event} />;
}
