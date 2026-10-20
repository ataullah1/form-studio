import { publicMetadata } from '@/lib/site';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { Configurator } from '@/features/configurator/configurator';

export const metadata = publicMetadata('/configure', 'Build your desk — Form Studio', 'Choose your desk size, finish, frame and accessories. Explore the 3D concept, compare USD estimates, save a share link or send a private demo enquiry.');

export default function ConfigurePage() {
  return <>
    <SiteHeader configurator />
    <main id="main-content">
      <section className="configure workspace-configure" aria-labelledby="configure-title">
        <div className="configure-heading"><div><p className="eyebrow">STUDIO DESK 01</p><h1 id="configure-title">Build your desk.</h1></div><div><p>Choose your details. See the whole picture.</p><a className="workspace-jump" href="#configuration-actions">Estimate &amp; save ↓</a></div></div>
        <Configurator />
      </section>
    </main>
    <SiteFooter compact />
  </>;
}
