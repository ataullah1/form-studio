'use client';
import { usePathname } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
export function PublicAnalytics() {
  const path = usePathname();
  if (path === '/admin' || path.startsWith('/admin/')) return null;
  return <Analytics beforeSend={event => new URL(event.url).pathname.startsWith('/admin') ? null : event} />;
}
