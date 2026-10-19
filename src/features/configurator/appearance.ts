import type { ProductConfiguration } from '../../lib/catalog';

/** Step 3 selection only. Sizes/accessories and a full config reducer follow in Step 4. */
export type AppearanceSelection = Pick<ProductConfiguration, 'finishId' | 'frameColourId'>;
