import { catalogV1, type ProductConfiguration } from '@/lib/catalog';
import { DeskSchematic } from '@/features/scene/desk-schematic';
import { validateConfig } from '@/lib/catalog/pricing';
export function ConfigurationDetails({ configuration }: { configuration: unknown }) {
  let c:ProductConfiguration;try{c=validateConfig(configuration);}catch{return <p className="fine">This saved design uses an earlier specification. Its original estimate is preserved.</p>;}
  return <dl className="product-specs"><div><dt>Size</dt><dd>{catalogV1.sizes[c.sizeId].label}</dd></div><div><dt>Finish</dt><dd>{catalogV1.finishes[c.finishId].label}</dd></div><div><dt>Frame</dt><dd>{catalogV1.frameColours[c.frameColourId].label}</dd></div><div><dt>Accessories</dt><dd>{c.accessoryIds.length?c.accessoryIds.map(id=>catalogV1.accessories[id].label).join(', '):'None'}</dd></div></dl>;
}
export function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}><span aria-hidden="true" />{status}</span>;
}
export function FormattedDate({ value }: { value: Date }) { return <time dateTime={value.toISOString()}>{new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(value)}</time>; }
export function EmptyState({ title, children, action }: { title:string;children:React.ReactNode;action?:React.ReactNode }) {
  return <div className="empty-state"><span className="empty-mark" aria-hidden="true">↗</span><h3>{title}</h3><p>{children}</p>{action}</div>;
}
export function PageHeading({ eyebrow,title,description,actions }: {eyebrow?:string;title:string;description?:string;actions?:React.ReactNode}) {
  return <div className="page-heading"><div>{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description&&<p>{description}</p>}</div>{actions&&<div className="page-actions">{actions}</div>}</div>;
}

export function ProductPreview({configuration}:{configuration:unknown}) { let c:ProductConfiguration;try{c=validateConfig(configuration);}catch{return <div className="preview-unavailable">Earlier design · Preview unavailable</div>;}return <DeskSchematic configuration={c} compact/>; }
