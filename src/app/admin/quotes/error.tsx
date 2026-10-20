'use client';
import { WorkspaceFailure } from '@/components/product/workspace-failure';
export default function ErrorPage({reset}:{reset:()=>void}){return <WorkspaceFailure reset={reset} href="/admin/quotes"/>;}
