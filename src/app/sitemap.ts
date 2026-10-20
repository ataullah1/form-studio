import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteOrigin + '/', priority: 1 }, { url: siteOrigin + '/configure', priority: 0.8 }];
}
