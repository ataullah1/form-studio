import type { Metadata } from 'next';
import { Bodoni_Moda, Manrope } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const display = Bodoni_Moda({ subsets: ['latin'], style: 'normal', variable: '--font-display', display: 'swap' });
const body = Manrope({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  title: 'Form Studio — Architectural furniture studies',
  description: 'Studio Desk 01. An independent furniture concept exploring proportion, materials and the way you work.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${display.variable} ${body.variable}`}><body><a className="skip-link" href="#main-content">Skip to content</a>{children}<Analytics /></body></html>;
}
