import { catalogV1, defaultConfiguration, formatUsd } from '@/lib/catalog';

/** Static option layout only. Canonical interactive state is introduced in Step 4. */
export function ConfigurationPanel() {
  const config = defaultConfiguration;
  const size = catalogV1.sizes[config.sizeId];
  return <aside className="panel" aria-label="Product options and estimate">
    <div className="product-heading"><p className="eyebrow">01 / SPECIFICATION</p><h2>{catalogV1.label}</h2><p>Default reference: Oak / Black. Options shown below are not yet interactive.</p></div>
    <fieldset disabled><legend><span>01</span> Wood finish <strong>Oak</strong></legend>
      <div className="swatches">{Object.entries(catalogV1.finishes).map(([id, option]) => <label key={id}><input type="radio" name="finish" defaultChecked={id === config.finishId} /><span className={`swatch ${id}`} />{option.label}</label>)}</div>
    </fieldset>
    <fieldset disabled><legend><span>02</span> Frame colour</legend><div className="choices">{Object.entries(catalogV1.frameColours).map(([id, option]) => <button type="button" key={id} className={id === config.frameColourId ? 'chosen' : ''}>{option.label}</button>)}</div></fieldset>
    <fieldset disabled><legend><span>03</span> Desk size</legend><div className="choices sizes">{Object.entries(catalogV1.sizes).map(([id, option]) => <button type="button" key={id} className={id === config.sizeId ? 'chosen' : ''}>{option.label}</button>)}</div></fieldset>
    <fieldset disabled><legend><span>04</span> Accessories</legend>{Object.entries(catalogV1.accessories).map(([id, option]) => <label className="extra" key={id}><span><input type="checkbox" />{option.label}</span><span>+{formatUsd(option.priceCents)}</span></label>)}</fieldset>
    <section className="summary" aria-labelledby="summary-title"><h3 id="summary-title" className="sr-only">Default configuration summary</h3>
      <div><span>Desk · {size.label}</span><span>{formatUsd(size.priceCents)}</span></div>
      <div><span>Oak / Black · No accessories</span><span>Included</span></div>
      <div className="total"><span>Illustrative estimate</span><strong>{formatUsd(size.priceCents)} <small>USD</small></strong></div>
      <p>Tax and shipping excluded. No furniture is offered for sale.</p>
      <a href="#quote-draft" className="button">View demo quote draft ↗</a>
      <button type="button" className="share" disabled>Save & share · In development</button>
    </section>
  </aside>;
}
