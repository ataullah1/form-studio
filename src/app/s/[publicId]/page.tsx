import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader,SiteFooter } from '@/components/site-chrome';
import { SceneViewer } from '@/features/scene/scene-viewer';
import { Configurator } from '@/features/configurator/configurator';
import { CopyShareLink } from '@/features/sharing/copy-share-link';
import { ConfigurationDetails,EmptyState,PageHeading } from '@/components/product/product-details';
import { readSnapshot } from '@/server/sharing';
import { resolveSnapshot } from '@/lib/catalog/snapshot';
import { formatUsd } from '@/lib/catalog';
export const runtime='nodejs';export const dynamic='force-dynamic';
export const metadata={title:'Shared desk — Form Studio',robots:{index:false,follow:false}};
export default async function SharedPage({params,searchParams}:{params:Promise<{publicId:string}>;searchParams:Promise<{edit?:string;resume?:string}>}){
 const {publicId}=await params;let snapshot;
 try{snapshot=await readSnapshot(publicId);}catch{return <><SiteHeader configurator/><main id="main-content" className="workspace-shell"><div role="alert"><EmptyState title="Shared designs are temporarily unavailable." action={<Link className="button" href="/configure">Return to your desk</Link>}>Please try again later. Your browser draft is unchanged.</EmptyState></div></main><SiteFooter compact/></>;}
 if(!snapshot)notFound();const resolved=resolveSnapshot(snapshot);
 if(!resolved)return <><SiteHeader configurator/><main id="main-content" className="workspace-shell"><EmptyState title="This design version is unavailable." action={<Link className="button" href="/configure">Build a new desk</Link>}>Its saved options cannot be resolved. We have not replaced it with another design.</EmptyState></main><SiteFooter compact/></>;
 const editing=(await searchParams).edit==='1';const changed=snapshot.estimatedTotalCents!==resolved.currentPrice.estimatedTotalCents;
 return <><SiteHeader configurator/><main id="main-content" className="configure workspace-configure shared-workspace"><PageHeading eyebrow={editing?'EDIT A COPY':'SHARED DESIGN / STUDIO DESK 01'} title={editing?'Make it yours.':'A desk, shared.'} description={editing?'You are editing a copy. The saved design stays unchanged.':'One point of view. Make it the starting point for yours.'}/>{editing?<Configurator key={publicId} sharedSnapshot={resolved.configuration} sourcePublicId={publicId}/>:<div className="builder"><SceneViewer configuration={resolved.configuration} readOnly/><section className="panel shared-summary" aria-label="Saved design summary"><p className="eyebrow">SAVED CONFIGURATION</p><h2>Studio Desk 01</h2><ConfigurationDetails configuration={resolved.configuration}/><div className="detail-estimate"><span>Saved estimate</span><strong>{formatUsd(snapshot.estimatedTotalCents)} <small>USD</small></strong></div>{changed&&<p className="feedback">Current illustrative estimate: {formatUsd(resolved.currentPrice.estimatedTotalCents)} USD. Your saved estimate stays unchanged; a new request uses the current estimate.</p>}<p className="fine">Tax and shipping excluded. Independent concept; no furniture is offered for sale.</p><Link className="button" href={`/s/${publicId}?edit=1`}>Edit a copy ↗</Link><CopyShareLink publicId={publicId}/><details className="technical-details"><summary>Design reference</summary><p>Catalog {snapshot.catalogVersion} · Saved {snapshot.createdAt.slice(0,10)}</p></details></section></div>}</main><SiteFooter compact/></>;
}
