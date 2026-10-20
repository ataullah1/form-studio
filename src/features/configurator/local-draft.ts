import { defaultConfiguration, type ProductConfiguration } from '../../lib/catalog';
import { validateConfig } from '../../lib/catalog/pricing';

export const DRAFT_KEY = 'form-studio:product-draft';
export const DRAFT_DELAY_MS = 350;
export type DraftStatus = 'new' | 'restored' | 'invalid' | 'unavailable' | 'shared' | 'saved';
export interface DraftBoot { configuration: ProductConfiguration; status: DraftStatus }
export type DraftStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** A supplied shared snapshot wins, including invalid snapshots: never silently load a local draft instead. */
export function loadInitialConfiguration(storage: () => DraftStorage, sharedSnapshot?: unknown): DraftBoot {
  if (sharedSnapshot !== undefined) return { configuration: validateConfig(sharedSnapshot), status: 'shared' };
  let raw: string | null;
  try { raw = storage().getItem(DRAFT_KEY); }
  catch { return { configuration: validateConfig(defaultConfiguration), status: 'unavailable' }; }
  if (raw === null) return { configuration: validateConfig(defaultConfiguration), status: 'new' };
  try {
    if (raw.length > 4096) throw new Error('Draft too large');
    return { configuration: validateConfig(JSON.parse(raw)), status: 'restored' };
  } catch { return { configuration: validateConfig(defaultConfiguration), status: 'invalid' }; }
}

export function saveDraft(storage: () => DraftStorage, configuration: unknown): boolean {
  const validated = validateConfig(configuration);
  try { storage().setItem(DRAFT_KEY, JSON.stringify(validated)); return true; }
  catch { return false; }
}
