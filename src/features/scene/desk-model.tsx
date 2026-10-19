'use client';

import { DeskAccessories } from './desk-accessories';
import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import { tabletopExtrusion } from './tabletop-shape';
import type { DeskDimensions } from './desk-dimensions';
import { WoodSurface, type TextureReport } from './wood-surface';
import type { ProductConfiguration } from '@/lib/catalog';

export function DeskModel({ dimensions, configuration, attempt, onTextureStatus }: { dimensions: DeskDimensions; configuration: ProductConfiguration; attempt: number; onTextureStatus: (report: TextureReport) => void }) {
  const { shape, settings } = useMemo(() => tabletopExtrusion(dimensions), [dimensions]);

  return <group name="studio-desk-01">
    <mesh
      name="tabletop"
      position={[0, dimensions.tabletopY, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      castShadow
      receiveShadow
    >
      <extrudeGeometry args={[shape, settings]} onUpdate={geometry => geometry.center()} />
      <WoodSurface finishId={configuration.finishId} attempt={attempt} onStatus={onTextureStatus} />
    </mesh>
    {dimensions.parts.map(part => <RoundedBox
      key={part.id}
      name={part.id}
      args={part.size}
      position={part.position}
      radius={part.radius}
      smoothness={2}
      bevelSegments={2}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={part.id.startsWith('foot-') ? '#242923' : configuration.frameColourId === 'white' ? '#e9e6df' : '#292d29'}
        metalness={part.id.startsWith('foot-') ? 0 : 0.45}
        roughness={0.58}
      />
    </RoundedBox>)}
    <DeskAccessories dimensions={dimensions} configuration={configuration} />
  </group>;
}
