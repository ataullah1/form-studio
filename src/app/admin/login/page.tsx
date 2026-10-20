import { AuthPanel } from '@/components/product/auth-panel';
import { safeReturnPath } from '@/lib/auth/return-path';
export default async function LoginPage({searchParams}:{searchParams:Promise<{returnTo?:string;error?:string}>}){const q=await searchParams;return <AuthPanel owner returnTo={safeReturnPath(q.returnTo,true)} error={q.error}/>;}
