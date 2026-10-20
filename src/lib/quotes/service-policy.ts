/** Production cron is deployed with the app; previews cannot rely on that production schedule. */
export function quoteServiceReady(cleanupSecret: string | undefined, vercel: string | undefined, environment: string | undefined): boolean {
  return !!cleanupSecret && cleanupSecret.length >= 32 && !cleanupSecret.startsWith('replace-') && (vercel !== '1' || environment === 'production');
}
