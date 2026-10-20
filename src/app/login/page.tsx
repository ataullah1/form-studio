import type { Metadata } from 'next';
import { SiteHeader,SiteFooter } from '@/components/site-chrome';
import { AuthPanel } from '@/components/product/auth-panel';
import { safeReturnPath } from '@/lib/auth/return-path';
export const metadata:Metadata={title:'Sign in — Form Studio',robots:{index:false,follow:false},referrer:'same-origin'};
export default async function LoginPage({searchParams}:{searchParams:Promise<{returnTo?:string;error?:string}>}) {
  const query=await searchParams;
  return <><SiteHeader configurator/><main id="main-content" className="auth-shell"><AuthPanel returnTo={safeReturnPath(query.returnTo)} error={query.error}/></main><SiteFooter compact/></>;
}
