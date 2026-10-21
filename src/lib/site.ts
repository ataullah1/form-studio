import type { Metadata } from 'next';
// Canonical production origin; preview/local deployments must not become canonical URLs.
export const siteOrigin = 'https://formstudioo.vercel.app';
export const siteDescription = 'Build your Studio Desk 01: explore three sizes, wood finishes and accessories in 3D, compare illustrative estimates and share your design. An independent furniture concept.';
export function publicMetadata(path: '/' | '/configure', title: string, description: string = siteDescription): Metadata {
  const url = siteOrigin + path;
  return {
    title, description, alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'en_US', siteName: 'Form Studio', title, description, url, images: [{ url: siteOrigin + '/opengraph-image.png', width: 1200, height: 630, alt: 'Form Studio — Studio Desk 01, an independent furniture configurator concept' }] },
    twitter: { card: 'summary_large_image', title, description, images: [siteOrigin + '/opengraph-image.png'] },
  };
}
