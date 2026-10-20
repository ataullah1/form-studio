import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { SceneViewer } from '@/features/scene/scene-viewer';
import { Configurator } from '@/features/configurator/configurator';
import { readSnapshot } from '@/server/sharing';
import { resolveSnapshot } from '@/lib/catalog/snapshot';
import { formatUsd } from '@/lib/catalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Shared desk — Form Studio', robots: { index: false, follow: false } };
export default async function SharedPage({ params, searchParams }: { params: Promise<{ publicId: string }>; searchParams: Promise<{ edit?: string }> }) {
  const { publicId } = await params;
  let snapshot;
  try { snapshot = await readSnapshot(publicId); }
  catch { return <><SiteHeader configurator /><main className="configure"><h1>Shared designs are temporarily unavailable.</h1><p>Please try again later. Your browser draft is unchanged.</p><Link className="text-link" href="/configure">Return to your desk</Link></main><SiteFooter /></>; }
  if (!snapshot) notFound();
  const resolved = resolveSnapshot(snapshot);
  if (!resolved) return <><SiteHeader configurator /><main className="configure"><h1>This design version is unavailable.</h1><p>Its saved options cannot be resolved. We have not replaced it with another design.</p><Link className="text-link" href="/configure">Build a new desk</Link></main><SiteFooter /></>;
  const editing = (await searchParams).edit === '1';
  return <><SiteHeader configurator /><main className="configure">
    <div className="configure-heading"><div><p className="eyebrow">{editing ? 'EDIT A COPY' : 'SAVED DESIGN'} · CATALOG {snapshot.catalogVersion}</p><h1>{editing ? 'Make it yours.' : 'A desk, shared.'}</h1></div></div>
    <p className="draft-notice">{editing ? 'You are editing a copy. The saved design stays unchanged.' : `Saved design · Catalog ${snapshot.catalogVersion}. Edit a copy to make changes.`}</p>
    {editing ? <Configurator key={publicId} sharedSnapshot={resolved.configuration} /> : <div className="builder">
      <SceneViewer configuration={resolved.configuration} readOnly />
      <section className="panel summary" aria-label="Saved design summary">
        <h2>Studio Desk 01</h2>
        {resolved.currentPrice.lines.map(line => <div key={line.id}><span>{line.label}</span><span>{line.amountCents ? formatUsd(line.amountCents) : 'Included'}</span></div>)}
        <p>Saved estimate · Catalog {snapshot.catalogVersion}: {formatUsd(snapshot.estimatedTotalCents)}</p>
        <div className="total"><span>Current illustrative estimate</span><strong>{formatUsd(resolved.currentPrice.estimatedTotalCents)} <small>USD</small></strong></div>
        <p>Tax and shipping unavailable. This concept does not offer furniture for sale.</p>
        <Link className="button" href={`/s/${publicId}?edit=1`}>Edit a copy ↗</Link>
      </section>
    </div>}
  </main><SiteFooter /></>;
}
