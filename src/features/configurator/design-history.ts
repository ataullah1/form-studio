import { defaultConfiguration, type ProductConfiguration } from '../../lib/catalog';
import { validateConfig } from '../../lib/catalog/pricing';
import { configurationReducer, type ConfigurationAction } from './configuration-state';

export interface DesignHistory { past: ProductConfiguration[]; present: ProductConfiguration; future: ProductConfiguration[] }
export type DesignAction = ConfigurationAction | { type: 'undo' } | { type: 'redo' } | { type: 'template'; configuration: ProductConfiguration };
export const designPresets: { id: string; label: string; description: string; configuration: ProductConfiguration }[] = [
  { id: 'essential', label: 'The essential', description: 'Oak · Black · An open canvas', configuration: defaultConfiguration },
  { id: 'warm', label: 'Warm workspace', description: 'Walnut · White · Lamp & stand', configuration: { ...defaultConfiguration, finishId: 'walnut', frameColourId: 'white', accessoryIds: ['lamp', 'monitor-stand'] } },
  { id: 'focus', label: 'Focus station', description: '160 × 80 · Oak · All accessories', configuration: { ...defaultConfiguration, sizeId: '160x80', accessoryIds: ['lamp', 'monitor-stand', 'cable-tray'] } },
];
export function createDesignHistory(configuration: ProductConfiguration): DesignHistory { return { past: [], present: validateConfig(configuration), future: [] }; }
export function designHistoryReducer(state: DesignHistory, action: DesignAction): DesignHistory {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present].slice(-50), present: state.future[0], future: state.future.slice(1) };
  }
  const next = action.type === 'template' ? validateConfig(action.configuration) : configurationReducer(state.present, action);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past, state.present].slice(-50), present: next, future: [] };
}
