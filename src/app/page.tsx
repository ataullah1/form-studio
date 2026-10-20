import Image from 'next/image';
import { HeroDesk } from '@/components/product/hero-desk';
import Link from 'next/link';
import { catalogV1, defaultConfiguration, formatUsd, type AccessoryId } from '@/lib/catalog';
import { AccessoryPreview } from '@/components/product/accessory-preview';
import { DeskSchematic } from '@/features/scene/desk-schematic';
import { publicMetadata } from '@/lib/site';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

export const metadata = publicMetadata('/', 'Form Studio — Build your Studio Desk 01');

const materials = [
  { id: 'oak', number: '01', label: 'Oak', description: 'Open grain. Golden undertones.', price: catalogV1.finishes.oak.priceCents ? '+' + formatUsd(catalogV1.finishes.oak.priceCents) : 'Included' },
  { id: 'walnut', number: '02', label: 'Walnut', description: 'Deep colour. Expressive grain.', price: '+' + formatUsd(catalogV1.finishes.walnut.priceCents) },
  { id: 'ash', number: '03', label: 'Ash', description: 'Pale tone. Linear character.', price: 'Included' },
];

export default function HomePage() {
  return <>
    <SiteHeader />
    <main id="main-content">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-stage">
          <div className="hero-copy">
            <p className="eyebrow hero-identity">THE WORKSPACE COLLECTION <span>STUDIO DESK 01</span></p>
            <h1 id="hero-title">Your desk.{' '}<br />Built around{' '}<br />you.</h1>
            <p className="intro">A little more room to be you. Natural finishes, considered details. A desk shaped around the way you work.</p>
            <Link className="button hero-cta" href="/configure">Build your desk <span aria-hidden="true">↗</span></Link>
            <p className="hero-price">From <strong>{formatUsd(Math.min(...Object.values(catalogV1.sizes).map(size => size.priceCents)))}</strong> <span>USD · Illustrative estimate</span></p>
          </div>
          <HeroDesk />
        </div>
        <div className="hero-specs" aria-label="Product overview">
          <p><span>DESIGNED TO FIT</span>Three considered sizes</p>
          <p><span>MATERIAL CHARACTER</span>Oak, walnut &amp; ash</p>
          <p><span>MAKE IT YOURS</span>Customize in 3D</p>
          <a href="#customization">Discover the details <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section id="customization" className="story-section customization" aria-labelledby="customization-title">
        <div className="story-heading"><p className="eyebrow">MAKE ROOM FOR YOUR ROUTINE</p><h2 id="customization-title">The same form.<br />Your own balance.</h2><p>Start with the space you have. Shape the details around the way you work.</p></div>
        <div className="customization-options">
          <div className="story-option"><h3>A footprint that fits</h3><ul>{Object.entries(catalogV1.sizes).map(([id, size]) => <li key={id}><span>{size.label}</span><span>from {formatUsd(size.priceCents)}</span></li>)}</ul><p>Oak or ash, either frame colour, without accessories. The configurator starts at 140 × 70 cm for {formatUsd(catalogV1.sizes['140x70'].priceCents)}.</p></div>
          <div className="story-option"><h3>Two ways to frame it</h3><p>Black for a defined outline. White for a lighter contrast. Both frame colours are included in the estimate.</p><div className="frame-studies"><span><i className="frame-black" aria-hidden="true" />Black</span><span><i className="frame-white" aria-hidden="true" />White</span></div></div>

          <Link className="text-link" href="/configure">Explore your combinations <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="accessory-library"><div className="accessory-intro"><p className="eyebrow">THE FINISHING DETAILS</p><h3>A place for everything.</h3><p>Three optional additions. Each fits the same form.</p></div>{Object.entries(catalogV1.accessories).map(([id,accessory])=><figure key={id}><AccessoryPreview id={id as AccessoryId}/><figcaption><h3>{accessory.label}</h3><span>+{formatUsd(accessory.priceCents)}</span></figcaption></figure>)}</div>
      </section>

      <section id="materials" className="materials" aria-labelledby="materials-title">
        <div className="material-heading"><p className="eyebrow">01 / MATERIAL LIBRARY</p><h2 id="materials-title">Material<br />studies.</h2><p>Oak, walnut, ash. Three finishes to explore on the same form.</p></div>
        <div className="material-library">
          {materials.map(material => <figure className={`material-study material-${material.id}`} key={material.id}>
            <div className="material-crop"><Image src={`/assets/material-studies/${material.id}.svg`} alt={`${material.label} illustrative wood grain study`} width={600} height={800} sizes="(max-width: 650px) 90vw, (max-width: 1000px) 30vw, 20vw" /><span aria-hidden="true">{material.number}</span></div>
            <figcaption><div><h3>{material.label}</h3><span>{material.price}</span></div><p>{material.description}</p></figcaption>
          </figure>)}
          <p className="material-disclosure"><span aria-hidden="true">↳</span> Illustrative grain studies. Explore the finish textures in the 3D viewer.</p>
        </div>
      </section>

      <section id="details" className="details" aria-labelledby="details-title">
        <div className="details-heading"><p className="eyebrow">02 / DESIGN SPECIFICATIONS</p><h2 id="details-title">Proportion,<br />with purpose.</h2><p>Every size keeps the same considered height, edge and frame proportions.</p><DeskSchematic configuration={defaultConfiguration}/><Link className="text-link" href="/configure">Explore the 3D geometry <span aria-hidden="true">↗</span></Link></div>
        <div className="specification-sheet">
          <div className="specification-title"><span>STUDIO DESK 01</span><span>DIMENSIONS / CM</span></div>
          <dl>

            <div><dt><span>02</span>Desk height</dt><dd>74 cm</dd></div>
            <div><dt><span>03</span>Tabletop thickness</dt><dd>3 cm</dd></div>
            <div><dt><span>04</span>Frame colours</dt><dd>Black / White</dd></div>
            <div><dt><span>05</span>Finish library</dt><dd>Oak / Walnut / Ash</dd></div>
          </dl>
          <p className="fine">Concept dimensions for exploring your space. Not a manufacturing specification.</p>
        </div>
      </section>

      <section id="how-it-works" className="story-section process" aria-labelledby="process-title">
        <div className="story-heading"><p className="eyebrow">03 / FROM IDEA TO ENQUIRY</p><h2 id="process-title">From first idea<br />to your next step.</h2><p>Explore at your pace. Keep the version that feels right.</p></div>
        <ol className="process-steps"><li><span className="eyebrow">01 / CONFIGURE</span><h3>Start with your space.</h3><p>Choose a size, finish, frame and accessories. Your product selection stays in this browser when you return.</p></li><li><span className="eyebrow">02 / SAVE OR SHARE</span><h3>Keep your point of view.</h3><p>Sign in to save a design in My studio, or create a public share link as a guest. Your local draft stays in this browser.</p></li><li><span className="eyebrow">03 / REQUEST & TRACK</span><h3>Start the conversation.</h3><p>Send a demo request for your selected desk. When signed in, follow its status from My studio.</p></li></ol>
      </section>

      <section id="faq" className="story-section concept-faq" aria-labelledby="faq-title">
        <div className="story-heading"><p className="eyebrow">04 / BEFORE YOU BEGIN</p><h2 id="faq-title">A few useful<br />details.</h2><p>What this independent concept can do, and what to expect.</p></div>
        <div className="faq-list">
          <details><summary>Can I buy this desk?</summary><p>No. Form Studio is an independent portfolio concept. The configurator, design sharing and demo enquiry workflow work, but no furniture is offered for sale and no order or email is created.</p></details>
          <details><summary>What does the estimate include?</summary><p>The selected size, finish, frame and optional accessories, in USD. Estimates start at {formatUsd(catalogV1.sizes['120x60'].priceCents)}; the default configuration is {formatUsd(catalogV1.sizes['140x70'].priceCents)}. Tax and shipping are unavailable. Saved designs record their estimate; demo requests use a server-verified current estimate.</p></details>
          <details><summary>Do I need 3D to use the configurator?</summary><p>No. You can choose options, read dimensions and compare estimates without opening the 3D viewer. If WebGL is unavailable, a 2D schematic keeps the design understandable. Interactive choices and submission require JavaScript.</p></details>
          <details><summary>What is saved when I share a design?</summary><p>A share link contains a saved product configuration and its estimate. Contact details are kept separate and never appear in public design links. Editing a shared design creates a copy.</p></details>
          <details><summary>What happens to my demo enquiry?</summary><p>Your contact details stay private to the studio. Sign in before submitting to track the request status in My studio. Contact details are stored temporarily with scheduled cleanup targeting removal within seven days. Use fictional details when trying the demo; no confirmation email is sent.</p></details>
        </div>
      </section>
      <section className="story-invitation" aria-labelledby="invitation-title"><p className="eyebrow">YOUR NEXT WORKSPACE, EXPLORED</p><h2 id="invitation-title">Find your version<br />of Studio Desk 01.</h2><div><Link className="button" href="/configure">Build your desk <span aria-hidden="true">↗</span></Link><Link className="text-link" href="/configure#quote-draft">Request a quote <span aria-hidden="true">↗</span></Link></div><p>Independent concept. Illustrative USD estimates. No furniture for sale.</p></section>
    </main>
    <SiteFooter />
  </>;
}
