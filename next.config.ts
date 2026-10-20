import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  async headers() { return ['/admin/:path*', '/api/admin/:path*'].map(source => ({ source, headers: [
    { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
    { key: 'Referrer-Policy', value: 'same-origin' },
    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    { key: 'X-Frame-Options', value: 'DENY' },
  ] })); },
  transpilePackages: ['three'],
};
export default config;
