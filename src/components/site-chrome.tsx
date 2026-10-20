import { SignOut } from '@/features/auth/sign-out';
import Link from 'next/link';
export function Wordmark({ large = false }: { large?: boolean }) {
  return <span className={large ? 'wordmark wordmark-large' : 'wordmark'}><span>FORM</span><span className="wordmark-studio">STUDIO</span></span>;
}
export function SiteHeader({ configurator = false }: { configurator?: boolean }) {
  return <header className={`site-header${configurator ? ' site-header-app' : ''}`}>
    <div className="brand-lockup"><Link href="/" aria-label="Form Studio home"><Wordmark /></Link><span className="product-identifier">01<span>STUDIO DESK</span></span></div>
    <nav aria-label="Main navigation">{configurator ? <><Link className="nav-return" href="/" aria-label="Back to collection">← Collection</Link><Link className="nav-account" href="/dashboard">My studio</Link></> : <><a className="nav-secondary" href="#materials">Materials</a><a className="nav-secondary" href="#details">Details</a><Link className="nav-account" href="/dashboard">My studio</Link><Link className="nav-entry" href="/configure">Build your desk <span aria-hidden="true">↗</span></Link></>}</nav>
  </header>;
}
export function SiteFooter({ compact = false }: { compact?: boolean }) {
  if (compact) return <footer className="app-footer"><Link href="/">Form Studio</Link><p>By <a href="https://ataullah.vercel.app/" target="_blank" rel="noopener noreferrer">Md Ataullah</a> · Illustrative USD estimates.</p><Link href="/configure">Build your desk ↗</Link></footer>;
  return <footer className="site-footer"><div className="footer-top"><p>Furniture. Form. Possibility.</p><nav aria-label="Footer navigation"><a href="#materials">Materials</a><a href="#how-it-works">How it works</a><a href="#faq">Questions</a><Link href="/dashboard">My studio</Link><Link className="footer-entry" href="/configure">Build your desk <span aria-hidden="true">↗</span></Link></nav></div><Link className="footer-wordmark" href="/" aria-label="Form Studio home"><Wordmark large /></Link><div className="footer-bottom"><p>An independent concept by <a href="https://ataullah.vercel.app/" target="_blank" rel="noopener noreferrer">Md Ataullah</a>.</p><p>No furniture is offered for sale. All prices are illustrative.</p><span>FS—01</span></div></footer>;
}
export function WorkspaceHeader({ admin = false }: { admin?: boolean }) {
  return <header className="workspace-header"><Link href="/" aria-label="Form Studio home"><Wordmark /></Link><span className="workspace-label">{admin ? 'Studio operations' : 'My studio'}</span><nav aria-label="Workspace navigation"><Link href="/dashboard">My studio</Link><Link href="/configure">New design <span aria-hidden="true">↗</span></Link><SignOut/></nav></header>;
}
