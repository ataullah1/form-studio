import type { AccessoryId, ProductConfiguration } from '@/lib/catalog';
import type { DeskDimensions, Triple } from './desk-dimensions';

export interface AccessoryBounds { position: Triple; size: Triple }
/** Fixed sizes in metres. Anchor coordinates refer to the bottom-centre of each accessory. */
export function deriveAccessoryLayout(desk: DeskDimensions): Record<AccessoryId, AccessoryBounds> {
  return {
    lamp: { position: [-desk.width / 2 + 0.14, desk.height, -desk.depth / 2 + 0.14], size: [0.22, 0.44, 0.16] },
    'monitor-stand': { position: [0, desk.height, -desk.depth / 2 + 0.16], size: [0.46, 0.11, 0.20] },
    'cable-tray': { position: [0, desk.underside - 0.105, -desk.depth / 2 + 0.19], size: [0.50, 0.105, 0.12] },
  };
}

/** Include selected accessories when fitting the camera, without scaling the model. */
export function deriveProductBounds(desk: DeskDimensions, configuration: ProductConfiguration) {
  const layout = deriveAccessoryLayout(desk);
  return {
    width: desk.width, depth: desk.depth,
    height: Math.max(desk.height, ...configuration.accessoryIds.map(id => layout[id].position[1] + layout[id].size[1])),
  };
}
