import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Form Studio — A considered workspace',
  description: 'An independent desk configurator concept. Explore the screen plan and client-only 3D integration preview.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a>{children}<Analytics /></body></html>;
}
