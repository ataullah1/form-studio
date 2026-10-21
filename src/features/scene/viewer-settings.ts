/** Viewer preferences never enter ProductConfiguration, pricing or share payloads. */
export type LightingMode = 'day' | 'night';
export const lightingPresets = {
  day: { background: null, ambient: 1.15, hemisphere: 1.1, key: 2.1, fill: 0.7, keyColour: '#ffffff', shadowOpacity: 0.18 },
  night: { background: '#292b32', ambient: 0.65, hemisphere: 0.7, key: 1.15, fill: 0.45, keyColour: '#dce4ff', shadowOpacity: 0.3 },
} as const;

export type ViewerQuality = 'balanced' | 'low';
export const qualityPresets = {
  balanced: { dpr: [1, 1.5] as [number, number], shadows: true, textureSize: 1024, anisotropy: 8 },
  low: { dpr: [1, 1] as [number, number], shadows: false, textureSize: 512, anisotropy: 1 },
} as const;
