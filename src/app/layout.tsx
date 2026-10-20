import type { Metadata } from 'next';
import { Bodoni_Moda, Manrope } from 'next/font/google';
import { PublicAnalytics } from '@/components/public-analytics';
import './globals.css';
import { siteOrigin, siteDescription } from '@/lib/site';

const display = Bodoni_Moda({ subsets: ['latin'], style: 'normal', variable: '--font-display', display: 'swap' });
const body = Manrope({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: 'Form Studio — Architectural furniture studies',
  description: siteDescription,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${body.variable}`}><body><a className="skip-link" href="#main-content">Skip to content</a>{children}<PublicAnalytics /></body></html>;
}
