import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { Configurator } from '@/features/configurator/configurator';

export const metadata: Metadata = {
  title: 'Build your desk — Form Studio',
  description: 'Explore Studio Desk 01: architectural desk geometry, responsive camera controls and a 2D dimension schematic.',
};

export default function ConfigurePage() {
  return <>
    <SiteHeader configurator />
    <main id="main-content">
      <section className="configure" aria-labelledby="configure-title">
        <div className="configure-heading"><div><p className="eyebrow">STUDIO DESK 01 / FORM STUDIES</p><h1 id="configure-title">Your desk,<br />in perspective.</h1></div><p>Explore its proportions.<br />Rotate, zoom, take a closer look.</p></div>
        <Configurator />
      </section>
    </main>
    <SiteFooter />
  </>;
}
