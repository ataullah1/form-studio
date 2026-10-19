'use client';

import { useState } from 'react';
import { defaultConfiguration } from '@/lib/catalog';
import { SceneViewer } from '@/features/scene/scene-viewer';
import { ConfigurationPanel } from './configuration-panel';
import type { AppearanceSelection } from './appearance';

/** One selection drives HTML, scene, schematic and the illustrative finish surcharge. */
export function Configurator() {
  const [appearance, setAppearance] = useState<AppearanceSelection>({
    finishId: defaultConfiguration.finishId,
    frameColourId: defaultConfiguration.frameColourId,
  });
  return <div className="builder">
    <SceneViewer appearance={appearance} />
    <ConfigurationPanel appearance={appearance} onChange={patch => setAppearance(previous => ({ ...previous, ...patch }))} />
  </div>;
}
