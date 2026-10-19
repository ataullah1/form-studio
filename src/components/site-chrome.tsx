import Link from 'next/link';

function Wordmark({ large = false }: { large?: boolean }) {
  return <span className={large ? 'wordmark wordmark-large' : 'wordmark'}>
    <span>FORM</span><span className="wordmark-studio">STUDIO</span>
  </span>;
}

export function SiteHeader({ configurator = false }: { configurator?: boolean }) {
  return <header className="site-header">
    <div className="brand-lockup">
      <Link href="/" aria-label="Form Studio home"><Wordmark /></Link>
      <span className="product-identifier">01<span>STUDIO DESK</span></span>
    </div>
    <nav aria-label="Main navigation">
      {configurator ? <Link className="nav-return" href="/">← Back to collection</Link> : <>
        <a className="nav-secondary" href="#materials">Materials</a>
        <a className="nav-secondary" href="#details">Specifications</a>
        <Link className="nav-entry" href="/configure">Build your desk <span aria-hidden="true">↗</span></Link>
      </>}
    </nav>
  </header>;
}

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-top"><p>Furniture. Form. Possibility.</p><Link className="footer-entry" href="/configure">Build your desk <span aria-hidden="true">↗</span></Link></div>
    <Link className="footer-wordmark" href="/" aria-label="Form Studio home"><Wordmark large /></Link>
    <div className="footer-bottom"><p>An independent concept by Md Ataullah.</p><p>No furniture is offered for sale. All prices are illustrative.</p><span>FS—01</span></div>
  </footer>;
}
