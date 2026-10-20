import type { Metadata } from 'next';
import { SiteFooter,WorkspaceHeader } from '@/components/site-chrome';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'My studio — Form Studio',robots:{index:false,follow:false},referrer:'same-origin'};
export default function AccountLayout({children}:{children:React.ReactNode}){return <><WorkspaceHeader/><main id="main-content" className="workspace-shell">{children}</main><SiteFooter compact/></>;}
