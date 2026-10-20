import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = { title: 'Sign in — Form Studio', robots: { index:false,follow:false }, referrer:'same-origin' };
export default function LoginPage() {
  return <main id="main-content" className="admin-shell"><header className="admin-header"><Link href="/">Form Studio</Link><span>Your account</span></header><section className="admin-card"><h1>Your space, saved.</h1><p>Sign in with Google to keep your new saved designs and demo requests together.</p><form action="/api/admin/auth/google?intent=account" method="post"><button className="button" type="submit">Continue with Google</button></form><p>Each account sees only its own designs and requests. Earlier guest activity is not linked automatically.</p></section></main>;
}
