import type { Metadata } from 'next';
import { SiteHeader,SiteFooter } from '@/components/site-chrome';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Studio operations — Form Studio',robots:{index:false,follow:false},referrer:'same-origin'};
export default function AdminLayout({children}:{children:React.ReactNode}){return <><SiteHeader configurator/><main id="main-content" className="workspace-shell">{children}</main><SiteFooter compact/></>;}
