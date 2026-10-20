import { AccountNotice } from '@/features/account/account-notice';
import { publicMetadata } from '@/lib/site';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { Configurator } from '@/features/configurator/configurator';

export const metadata = publicMetadata('/configure', 'Build your desk — Form Studio', 'Choose your desk size, finish, frame and accessories. Explore the 3D concept, compare USD estimates, save a share link or send a private demo enquiry.');

export default function ConfigurePage() {
  return <>
    <SiteHeader configurator />
    <main id="main-content">
      <section className="configure" aria-labelledby="configure-title">
        <div className="configure-heading"><div><p className="eyebrow">STUDIO DESK 01 / FORM STUDIES</p><h1 id="configure-title">Your desk,<br />in perspective.</h1></div><p>Choose your size, finish and details.<br />Explore in 3D, save or send a demo enquiry.</p></div>
        <AccountNotice />
        <Configurator />
      </section>
    </main>
    <SiteFooter />
  </>;
}
