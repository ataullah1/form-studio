import type { FinishId } from '../../lib/catalog';

export const woodPresets: Record<FinishId, { tileMetres: number; roughness: number; normalStrength: number; neutralColour: string; surfaceColour: string }> = {
  oak: { tileMetres: 1, roughness: 0.82, normalStrength: 0.12, neutralColour: '#b48b58', surfaceColour: '#e5bb80' },
  walnut: { tileMetres: 1, roughness: 0.8, normalStrength: 0.1, neutralColour: '#70503b', surfaceColour: '#765039' },
  ash: { tileMetres: 1, roughness: 0.86, normalStrength: 0.1, neutralColour: '#d4c5a7', surfaceColour: '#fff5df' },
};
export type TextureKind = 'colour' | 'normal' | 'roughness';
export const textureKinds: TextureKind[] = ['colour', 'normal', 'roughness'];
export function woodTextureURL(finishId: FinishId, kind: TextureKind) {
  return `/assets/textures/wood/${finishId}/${kind}.webp`;
}
