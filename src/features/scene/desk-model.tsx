'use client';

import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import { tabletopExtrusion } from './tabletop-shape';
import type { DeskDimensions } from './desk-dimensions';

export function DeskModel({ dimensions }: { dimensions: DeskDimensions }) {
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
      <meshStandardMaterial color="#c2b7a4" roughness={0.72} metalness={0} />
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
        color={part.id.startsWith('foot-') ? '#242923' : '#353b34'}
        metalness={part.id.startsWith('foot-') ? 0 : 0.45}
        roughness={0.58}
      />
    </RoundedBox>)}
  </group>;
}
