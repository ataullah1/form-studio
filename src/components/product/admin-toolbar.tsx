import { SignOut } from '@/features/auth/sign-out';
import Link from 'next/link';
export function AdminToolbar(){return <div className="workspace-subnav"><nav aria-label="Owner navigation"><Link href="/admin/quotes">Quote inbox</Link><Link href="/dashboard">My studio</Link></nav><SignOut/></div>;}
