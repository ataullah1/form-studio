import type { Metadata } from 'next';
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Private inbox — Form Studio', robots: { index: false, follow: false }, referrer: 'same-origin' };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <main id="main-content" className="admin-shell"><header className="admin-header"><Link href="/">Form Studio</Link><span>Private demo inbox</span></header>{children}</main>;
}
