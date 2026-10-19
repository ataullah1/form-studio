'use client';

import type { LightingMode } from './viewer-settings';
import type { ProductConfiguration } from '@/lib/catalog';
import type { DeskDimensions, Triple } from './desk-dimensions';
import { deriveAccessoryLayout } from './accessory-layout';

function Solid({ size, position, colour }: { size: Triple; position: Triple; colour: string }) {
  return <mesh position={position} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={colour} metalness={0.35} roughness={0.6} /></mesh>;
}

/** Original code geometry; physical dimensions never scale with the tabletop. */
export function DeskAccessories({ dimensions, configuration, lighting }: { lighting: LightingMode; dimensions: DeskDimensions; configuration: ProductConfiguration }) {
  const layout = deriveAccessoryLayout(dimensions);
  const colour = configuration.frameColourId === 'white' ? '#e9e6df' : '#292d29';
  return <group name="accessories">
    {configuration.accessoryIds.map(id => <group key={id} name={`accessory-${id}`} position={layout[id].position}>
      {id === 'lamp' && <>
        <mesh position={[0.037, 0.333, 0]}><sphereGeometry args={[0.019, 12, 8]} /><meshStandardMaterial color="#fff5df" emissive="#ffcc88" emissiveIntensity={lighting === 'night' ? 0.7 : 0} /></mesh>
        {lighting === 'night' && <pointLight name="desk-lamp-light" position={[0.05, 0.315, 0.025]} color="#ffd29a" intensity={0.35} distance={1.1} decay={2} />}

        <mesh position={[0, 0.009, 0]} castShadow receiveShadow><cylinderGeometry args={[0.065, 0.07, 0.018, 24]} /><meshStandardMaterial color={colour} metalness={0.4} roughness={0.55} /></mesh>
        <mesh position={[0, 0.177, 0]} castShadow><cylinderGeometry args={[0.009, 0.009, 0.32, 12]} /><meshStandardMaterial color={colour} metalness={0.4} roughness={0.55} /></mesh>
        <mesh position={[0.025, 0.365, 0]} rotation={[0, 0, -0.5]} castShadow><cylinderGeometry args={[0.035, 0.065, 0.07, 24]} /><meshStandardMaterial color={colour} metalness={0.4} roughness={0.55} /></mesh>
        <Solid size={[0.055, 0.012, 0.018]} position={[0.02, 0.331, 0]} colour={colour} />
      </>}
      {id === 'monitor-stand' && <>
        <Solid size={[0.46, 0.02, 0.20]} position={[0, 0.10, 0]} colour={colour} />
        {[-0.19, 0.19].map(x => <Solid key={x} size={[0.025, 0.09, 0.16]} position={[x, 0.045, 0]} colour={colour} />)}
      </>}
      {id === 'cable-tray' && <>
        <Solid size={[0.50, 0.012, 0.12]} position={[0, 0.006, 0]} colour={colour} />
        {[-0.055, 0.055].map(z => <Solid key={z} size={[0.50, 0.045, 0.01]} position={[0, 0.0285, z]} colour={colour} />)}
        {[-0.20, 0.20].map(x => <Solid key={x} size={[0.015, 0.105, 0.025]} position={[x, 0.0525, 0]} colour={colour} />)}
      </>}
    </group>)}
  </group>;
}
