import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

const materials = [
  { id: 'oak', number: '01', label: 'Oak', description: 'Open grain. Golden undertones.', price: 'Included' },
  { id: 'walnut', number: '02', label: 'Walnut', description: 'Deep colour. Expressive grain.', price: '+$40' },
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
            <p className="intro">Meet Studio Desk 01. A desk concept exploring proportion, materials and the way you work.</p>
            <Link className="button" href="/configure">Build your desk <span aria-hidden="true">↗</span></Link>
            <p className="hero-price">Illustrative pricing from <strong>$349</strong><span>USD · Independent concept</span></p>
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
        <div className="hero-bottom"><p>One form. Three planned footprints.</p><a href="#details">Explore the dimensions <span aria-hidden="true">↓</span></a></div>
      </section>

      <section id="materials" className="materials" aria-labelledby="materials-title">
        <div className="material-heading"><p className="eyebrow">01 / MATERIAL LIBRARY</p><h2 id="materials-title">Material<br />studies.</h2><p>Oak, walnut, ash. Three planned directions for the same form.</p></div>
        <div className="material-library">
          {materials.map(material => <figure className={`material-study material-${material.id}`} key={material.id}>
            <div className="material-crop"><Image src={`/assets/material-studies/${material.id}.svg`} alt={`Illustrative ${material.label.toLowerCase()} grain study; not a final product texture`} width={400} height={560} sizes="(max-width: 650px) 44vw, 24vw" /><span aria-hidden="true">{material.number}</span></div>
            <figcaption><div><h3>{material.label}</h3><span>{material.price}</span></div><p>{material.description}</p></figcaption>
          </figure>)}
          <p className="material-disclosure"><span aria-hidden="true">↳</span> Illustrative grain studies. Explore the finish textures in the 3D viewer.</p>
        </div>
      </section>

      <section id="details" className="details" aria-labelledby="details-title">
        <div className="details-heading"><p className="eyebrow">02 / DESIGN SPECIFICATIONS</p><h2 id="details-title">Proportion,<br />with purpose.</h2><p>A 74 cm surface. A 3 cm edge.<br />Three planned footprints.</p><Link className="text-link" href="/configure">Explore the 3D geometry <span aria-hidden="true">↗</span></Link></div>
        <div className="specification-sheet">
          <div className="specification-title"><span>STUDIO DESK 01</span><span>DIMENSIONS / CM</span></div>
          <dl>
            <div><dt><span>01</span>Footprints</dt><dd>120 × 60<br />140 × 70<br />160 × 80</dd></div>
            <div><dt><span>02</span>Desk height</dt><dd>74 cm</dd></div>
            <div><dt><span>03</span>Tabletop thickness</dt><dd>3 cm</dd></div>
            <div><dt><span>04</span>Planned frame colours</dt><dd>Black / White</dd></div>
            <div><dt><span>05</span>Planned accessories</dt><dd>Desk lamp<br />Monitor stand<br />Cable tray</dd></div>
          </dl>
          <p className="fine">Concept design dimensions. No load rating or ergonomic certification is claimed. Product configuration options are in development.</p>
        </div>
      </section>
    </main>
    <SiteFooter />
  </>;
}
