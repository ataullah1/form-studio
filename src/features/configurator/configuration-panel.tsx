'use client';

import { catalogV1, defaultConfiguration, formatUsd, type FinishId, type FrameColourId } from '@/lib/catalog';
import type { AppearanceSelection } from './appearance';

interface Props { appearance: AppearanceSelection; onChange: (selection: Partial<AppearanceSelection>) => void }

/** Finish/frame choices only. Size/accessory state and authoritative pricing are later steps. */
export function ConfigurationPanel({ appearance, onChange }: Props) {
  const size = catalogV1.sizes[defaultConfiguration.sizeId];
  const finish = catalogV1.finishes[appearance.finishId];
  const frame = catalogV1.frameColours[appearance.frameColourId];
  const estimate = size.priceCents + finish.priceCents;
  return <aside className="panel" aria-label="Product options and estimate">
    <div className="product-heading"><p className="eyebrow">01 / SPECIFICATION</p><h2>{catalogV1.label}</h2><p>Choose a finish and frame. Size and accessory options are in development.</p></div>
    <fieldset><legend><span>01</span> Wood finish <strong>{finish.label}</strong></legend>
      <div className="swatches">{Object.entries(catalogV1.finishes).map(([id, option]) => <label key={id}>
        <input type="radio" name="finish" value={id} checked={id === appearance.finishId} onChange={() => onChange({ finishId: id as FinishId })} />
        <span className={`swatch ${id}`} />{option.label}
      </label>)}</div>
    </fieldset>
    <fieldset><legend><span>02</span> Frame colour</legend><div className="choices" role="group" aria-label="Frame colour">{Object.entries(catalogV1.frameColours).map(([id, option]) => <button
      type="button" key={id} aria-pressed={id === appearance.frameColourId} className={id === appearance.frameColourId ? 'chosen' : ''}
      onClick={() => onChange({ frameColourId: id as FrameColourId })}
    >{option.label}</button>)}</div></fieldset>
    <fieldset disabled><legend><span>03</span> Desk size</legend><div className="choices sizes">{Object.entries(catalogV1.sizes).map(([id, option]) => <button type="button" key={id} className={id === defaultConfiguration.sizeId ? 'chosen' : ''}>{option.label}</button>)}</div></fieldset>
    <fieldset disabled><legend><span>04</span> Accessories</legend>{Object.entries(catalogV1.accessories).map(([id, option]) => <label className="extra" key={id}><span><input type="checkbox" />{option.label}</span><span>+{formatUsd(option.priceCents)}</span></label>)}</fieldset>
    <section className="summary" aria-labelledby="summary-title"><h3 id="summary-title" className="sr-only">Configuration summary</h3>
      <div><span>Desk · {size.label}</span><span>{formatUsd(size.priceCents)}</span></div>
      <div><span>{finish.label} finish</span><span>{finish.priceCents ? `+${formatUsd(finish.priceCents)}` : 'Included'}</span></div>
      <div><span>{frame.label} frame · No accessories</span><span>Included</span></div>
      <div className="total"><span>Illustrative estimate</span><strong>{formatUsd(estimate)} <small>USD</small></strong></div>
      <p>Tax and shipping excluded. No furniture is offered for sale.</p>
      <a href="#quote-draft" className="button">View demo quote draft ↗</a>
      <button type="button" className="share" disabled>Save & share · In development</button>
    </section>
  </aside>;
}
