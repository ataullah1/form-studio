'use client';

import { catalogV1, formatUsd, type FinishId, type FrameColourId, type SizeId, type ProductConfiguration } from '@/lib/catalog';
import type { Dispatch } from 'react';
import { illustrativeEstimate, type ConfigurationAction } from './configuration-state';

interface Props { configuration: ProductConfiguration; dispatch: Dispatch<ConfigurationAction> }

/** All product choices read and update the canonical reducer. */
export function ConfigurationPanel({ configuration, dispatch }: Props) {
  const size = catalogV1.sizes[configuration.sizeId];
  const finish = catalogV1.finishes[configuration.finishId];
  const frame = catalogV1.frameColours[configuration.frameColourId];
  const estimate = illustrativeEstimate(configuration);
  return <aside className="panel" aria-label="Product options and estimate">
    <div className="product-heading"><p className="eyebrow">01 / SPECIFICATION</p><h2>{catalogV1.label}</h2><p>Choose your proportions, materials and workspace details. Quantity is fixed at one.</p></div>
    <fieldset><legend><span>01</span> Wood finish <strong>{finish.label}</strong></legend>
      <div className="swatches">{Object.entries(catalogV1.finishes).map(([id, option]) => <label key={id}>
        <input type="radio" name="finish" value={id} checked={id === configuration.finishId} onChange={() => dispatch({ type: 'finish', id: id as FinishId })} />
        <span className={`swatch ${id}`} />{option.label}
      </label>)}</div>
    </fieldset>
    <fieldset><legend><span>02</span> Frame colour</legend><div className="choices" role="group" aria-label="Frame colour">{Object.entries(catalogV1.frameColours).map(([id, option]) => <button
      type="button" key={id} aria-pressed={id === configuration.frameColourId} className={id === configuration.frameColourId ? 'chosen' : ''}
      onClick={() => dispatch({ type: 'frame', id: id as FrameColourId })}
    >{option.label}</button>)}</div></fieldset>
    <fieldset><legend><span>03</span> Desk size</legend><div className="choices sizes" role="group" aria-label="Desk size">{Object.entries(catalogV1.sizes).map(([id, option]) => <button type="button" key={id} aria-pressed={id === configuration.sizeId} onClick={() => dispatch({ type: 'size', id: id as SizeId })} className={id === configuration.sizeId ? 'chosen' : ''}>{option.label}</button>)}</div></fieldset>
    <fieldset><legend><span>04</span> Accessories</legend>{Object.entries(catalogV1.accessories).map(([id, option]) => <label className="extra" key={id}><span><input type="checkbox" checked={configuration.accessoryIds.includes(id as keyof typeof catalogV1.accessories)} onChange={event => dispatch({ type: 'accessory', id: id as keyof typeof catalogV1.accessories, enabled: event.target.checked })} />{option.label}</span><span>+{formatUsd(option.priceCents)}</span></label>)}</fieldset>
    <button type="button" className="secondary-button configuration-reset" onClick={() => dispatch({ type: 'reset' })}>Reset configuration</button>
    <section className="summary" aria-labelledby="summary-title"><h3 id="summary-title" className="sr-only">Configuration summary</h3>
      <div><span>Desk · {size.label}</span><span>{formatUsd(size.priceCents)}</span></div>
      <div><span>{finish.label} finish</span><span>{finish.priceCents ? `+${formatUsd(finish.priceCents)}` : 'Included'}</span></div>
      <div><span>{frame.label} frame</span><span>Included</span></div>
      {configuration.accessoryIds.map(id => <div key={id}><span>{catalogV1.accessories[id].label} × 1</span><span>+{formatUsd(catalogV1.accessories[id].priceCents)}</span></div>)}
      <p>{configuration.accessoryIds.length ? "Fixed accessory positions · Quantity 1 each" : "No accessories"} · Desk quantity 1</p>
      <div className="total"><span>Illustrative estimate</span><strong>{formatUsd(estimate)} <small>USD</small></strong></div>
      <p>Tax and shipping excluded. No furniture is offered for sale.</p>
      <a href="#quote-draft" className="button">View demo quote draft ↗</a>
      <button type="button" className="share" disabled>Save & share · In development</button>
    </section>
  </aside>;
}
