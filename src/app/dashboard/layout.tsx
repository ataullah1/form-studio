import type { Metadata } from 'next';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Your dashboard — Form Studio', robots:{ index:false,follow:false },referrer:'same-origin' };
export default function AccountLayout({children}:{children:React.ReactNode}) {
  return <main id="main-content" className="admin-shell"><header className="admin-header"><Link href="/">Form Studio</Link><Link href="/configure">Build your desk ↗</Link><form action="/api/admin/logout" method="post"><button type="submit">Sign out</button></form></header>{children}</main>;
}
