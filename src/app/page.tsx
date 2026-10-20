import Image from 'next/image';
import Link from 'next/link';
import { catalogV1, formatUsd } from '@/lib/catalog';
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
        <div className="hero-kicker"><p className="eyebrow">FORM STUDIES / NO. 01</p><span>THE WORKSPACE COLLECTION</span></div>
        <h1 id="hero-title">Your desk.<span>Built around you.</span></h1>
        <div className="hero-composition">
          <div className="hero-copy">
            <p className="intro">Meet Studio Desk 01. Choose your proportions, wood finish and everyday details. See your design take shape in 3D, with an estimate that follows every choice.</p>
            <Link className="button" href="/configure">Build your desk <span aria-hidden="true">↗</span></Link>
            <p className="hero-price">Illustrative pricing from <strong>{formatUsd(Math.min(...Object.values(catalogV1.sizes).map(size => size.priceCents)))}</strong><span>USD · Independent concept</span></p>
          </div>
          <figure className="hero-art">
            <div className="poster-frame">
              <span className="poster-index" aria-hidden="true">01</span>
              <div className="dimension-top"><span>W / 1400 mm</span></div>
              <Image src="/assets/desk-concept.svg" alt="Static concept illustration of Studio Desk 01 in oak with a black frame" width={900} height={650} sizes="(max-width: 650px) 100vw, 70vw" priority />
              <span className="dimension-side">H / 740 mm</span>
              <div className="poster-baseline"><span>D / 700 mm</span><span>01 — STUDIO DESK</span></div>
            </div>
            <figcaption><span>Studio Desk 01 / Oak & black concept</span><span>Static illustration</span></figcaption>
          </figure>
        </div>
        <div className="hero-bottom"><p>One form. Three sizes to explore.</p><a href="#details">Explore the dimensions <span aria-hidden="true">↓</span></a></div>
      </section>

      <section id="customization" className="story-section customization" aria-labelledby="customization-title">
        <div className="story-heading"><p className="eyebrow">MAKE ROOM FOR YOUR ROUTINE</p><h2 id="customization-title">The same form.<br />Your own balance.</h2><p>Start with the space you have. Shape the details around the way you work.</p></div>
        <div className="customization-options">
          <div className="story-option"><h3>A footprint that fits</h3><ul>{Object.entries(catalogV1.sizes).map(([id, size]) => <li key={id}><span>{size.label}</span><span>from {formatUsd(size.priceCents)}</span></li>)}</ul><p>Oak or ash, either frame colour, without accessories. The configurator starts at 140 × 70 cm for {formatUsd(catalogV1.sizes['140x70'].priceCents)}.</p></div>
          <div className="story-option"><h3>Two ways to frame it</h3><p>Black for a defined outline. White for a lighter contrast. Both frame colours are included in the estimate.</p><div className="frame-studies"><span><i className="frame-black" aria-hidden="true" />Black</span><span><i className="frame-white" aria-hidden="true" />White</span></div></div>
          <div className="story-option"><h3>Details for your day</h3><ul>{Object.entries(catalogV1.accessories).map(([id, accessory]) => <li key={id}><span>{accessory.label}</span><span>+{formatUsd(accessory.priceCents)}</span></li>)}</ul><p>Add a lamp, raise the monitor or tuck a tray beneath the desk. Accessories can be selected independently.</p></div>
          <Link className="text-link" href="/configure">Explore your combinations <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section id="materials" className="materials" aria-labelledby="materials-title">
        <div className="material-heading"><p className="eyebrow">01 / MATERIAL LIBRARY</p><h2 id="materials-title">Material<br />studies.</h2><p>Oak, walnut, ash. Three finishes to explore on the same form.</p></div>
        <div className="material-library">
          {materials.map(material => <figure className={`material-study material-${material.id}`} key={material.id}>
            <div className="material-crop"><Image src={`/assets/material-studies/${material.id}.svg`} alt={`Illustrative ${material.label.toLowerCase()} grain study; not a final product texture`} width={400} height={560} sizes="(max-width: 650px) 44vw, 24vw" /><span aria-hidden="true">{material.number}</span></div>
            <figcaption><div><h3>{material.label}</h3><span>{material.price}</span></div><p>{material.description}</p></figcaption>
          </figure>)}
          <p className="material-disclosure"><span aria-hidden="true">↳</span> Illustrative grain studies. Explore the finish textures in the 3D viewer.</p>
        </div>
      </section>

      <section id="details" className="details" aria-labelledby="details-title">
        <div className="details-heading"><p className="eyebrow">02 / DESIGN SPECIFICATIONS</p><h2 id="details-title">Proportion,<br />with purpose.</h2><p>A 74 cm surface. A 3 cm edge.<br />Three configurable footprints.</p><Link className="text-link" href="/configure">Explore the 3D geometry <span aria-hidden="true">↗</span></Link></div>
        <div className="specification-sheet">
          <div className="specification-title"><span>STUDIO DESK 01</span><span>DIMENSIONS / CM</span></div>
          <dl>
            <div><dt><span>01</span>Footprints</dt><dd>120 × 60<br />140 × 70<br />160 × 80</dd></div>
            <div><dt><span>02</span>Desk height</dt><dd>74 cm</dd></div>
            <div><dt><span>03</span>Tabletop thickness</dt><dd>3 cm</dd></div>
            <div><dt><span>04</span>Frame colours</dt><dd>Black / White</dd></div>
            <div><dt><span>05</span>Optional accessories</dt><dd>Desk lamp<br />Monitor stand<br />Cable tray</dd></div>
          </dl>
          <p className="fine">Concept design dimensions. No load rating or ergonomic certification is claimed. All three sizes, finishes and accessories are available in the configurator.</p>
        </div>
      </section>

      <section id="how-it-works" className="story-section process" aria-labelledby="process-title">
        <div className="story-heading"><p className="eyebrow">03 / FROM IDEA TO ENQUIRY</p><h2 id="process-title">Make a little<br />space for possibility.</h2><p>A working design tool. An illustrative estimate. A clear next step.</p></div>
        <ol className="process-steps"><li><span className="eyebrow">01 / CONFIGURE</span><h3>Start with your space.</h3><p>Choose a size, finish, frame and accessories. Your product selection stays in this browser when you return.</p></li><li><span className="eyebrow">02 / EXPLORE</span><h3>See the details.</h3><p>Open the 3D viewer, move around the desk and compare day and night lighting. A dimension schematic is available without WebGL.</p></li><li><span className="eyebrow">03 / KEEP OR SHARE</span><h3>Keep the conversation going.</h3><p>Save an immutable design link, or send a private demo enquiry for your current selection. This is a concept, not a furniture order.</p></li></ol>
      </section>

      <section id="faq" className="story-section concept-faq" aria-labelledby="faq-title">
        <div className="story-heading"><p className="eyebrow">04 / BEFORE YOU BEGIN</p><h2 id="faq-title">A few useful<br />details.</h2><p>What this independent concept can do, and what to expect.</p></div>
        <div className="faq-list">
          <details><summary>Can I buy this desk?</summary><p>No. Form Studio is an independent portfolio concept. The configurator, design sharing and demo enquiry workflow work, but no furniture is offered for sale and no order or email is created.</p></details>
          <details><summary>What does the estimate include?</summary><p>The selected size, finish, frame and optional accessories, in USD. Estimates start at {formatUsd(catalogV1.sizes['120x60'].priceCents)}; the default configuration is {formatUsd(catalogV1.sizes['140x70'].priceCents)}. Tax and shipping are unavailable. Saved designs record their estimate; demo requests use a server-verified current estimate.</p></details>
          <details><summary>Do I need 3D to use the configurator?</summary><p>No. You can choose options, read dimensions and compare estimates without opening the 3D viewer. If WebGL is unavailable, a 2D schematic keeps the design understandable. Interactive choices and submission require JavaScript.</p></details>
          <details><summary>What is saved when I share a design?</summary><p>A share link contains a saved product configuration and its estimate. Contact details are kept separate and never appear in public design links. Editing a shared design creates a copy.</p></details>
          <details><summary>What happens to my demo enquiry?</summary><p>Only the allowed owner can read it. Contact details are stored temporarily with scheduled cleanup targeting removal within seven days. Use fictional details when trying the demo; no confirmation email is sent.</p></details>
        </div>
      </section>
      <section className="story-invitation" aria-labelledby="invitation-title"><p className="eyebrow">YOUR NEXT WORKSPACE, EXPLORED</p><h2 id="invitation-title">Find your version<br />of Studio Desk 01.</h2><div><Link className="button" href="/configure">Build your desk <span aria-hidden="true">↗</span></Link><Link className="text-link" href="/configure#quote-draft">Try the demo enquiry <span aria-hidden="true">↗</span></Link></div><p>Independent concept. Illustrative USD estimates. No furniture for sale.</p></section>
    </main>
    <SiteFooter />
  </>;
}
