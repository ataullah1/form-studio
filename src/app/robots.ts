import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/site';
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/dashboard', '/login'] }, sitemap: siteOrigin + '/sitemap.xml' };
}
