import type { Metadata } from 'next';
import Link from 'next/link';
import { SceneViewer } from '@/features/scene/scene-viewer';
import { ConfigurationPanel } from '@/features/configurator/configuration-panel';
import { QuoteDraft } from '@/features/quotes/quote-draft';

export const metadata: Metadata = {
  title: 'Build your desk — Form Studio',
  description: 'Studio Desk 01 configurator foundation: interactive 3D desk geometry, responsive camera controls and a usable 2D schematic.',
};

export default function ConfigurePage() {
  return <>
    <div className="plan-banner">STEP 2 / GEOMETRY PREVIEW<span>Illustrative concept · Product customization coming next</span></div>
    <header><Link className="brand" href="/">form<span>studio</span></Link><nav aria-label="Main navigation"><Link href="/" className="nav-cta">← Back to collection</Link></nav></header>
    <main id="main-content">
      <section className="configure configure-page" aria-labelledby="configure-title">
        <div className="section-heading"><div><p className="eyebrow">YOUR SPACE. YOUR COMBINATION.</p><h1 id="configure-title">Meet your next workspace.</h1></div><p>Explore the shape.<br />Make room for your everyday.</p></div>
        <div className="builder"><SceneViewer /><ConfigurationPanel /></div>
      </section>
      <QuoteDraft />
    </main>
    <footer><Link href="/" className="brand">form<span>studio</span></Link><p>An independent furniture concept by Md Ataullah.</p></footer>
  </>;
}
