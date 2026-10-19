'use client';

import { useReducer } from 'react';
import { defaultConfiguration } from '@/lib/catalog';
import { SceneViewer } from '@/features/scene/scene-viewer';
import { ConfigurationPanel } from './configuration-panel';
import { configurationReducer, normalizeConfiguration } from './configuration-state';

/** One canonical product state drives HTML, scene, dimensions and illustrative estimate. */
export function Configurator() {
  const [configuration, dispatch] = useReducer(configurationReducer, defaultConfiguration, normalizeConfiguration);
  return <div className="builder">
    <SceneViewer configuration={configuration} />
    <ConfigurationPanel configuration={configuration} dispatch={dispatch} />
  </div>;
}
