import { validateConfig, calculatePrice } from './pricing';
/** Keep published catalog resolvers when adding a new version. No invented legacy IDs. */
export function resolveSnapshot(snapshot: { configuration: unknown; schemaVersion: number; catalogVersion: string }) {
  if (snapshot.schemaVersion !== 1 || snapshot.catalogVersion !== '1') return null;
  try {
    const configuration = validateConfig(snapshot.configuration);
    return { configuration, currentPrice: calculatePrice(configuration) };
  } catch { return null; }
}
