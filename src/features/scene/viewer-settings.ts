/** Viewer preferences never enter ProductConfiguration, pricing or future share payloads. */
export type LightingMode = 'day' | 'night';
export const lightingPresets = {
  day: { background: null, ambient: 1.15, hemisphere: 1.1, key: 2.1, fill: 0.7, keyColour: '#ffffff', shadowOpacity: 0.18 },
  night: { background: '#292b32', ambient: 0.65, hemisphere: 0.7, key: 1.15, fill: 0.45, keyColour: '#dce4ff', shadowOpacity: 0.3 },
} as const;
