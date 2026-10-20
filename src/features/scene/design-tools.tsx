'use client';

import { Html } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { DeskDimensions, Triple } from './desk-dimensions';
import type { LightingMode } from './viewer-settings';

import { floorFinishes, type FloorFinish, type RoomView } from './design-settings';
/** Original room geometry. View preferences are never product facts or quote inputs. */
export function DesignRoom({ view, floor, lighting }: { view: RoomView; floor: FloorFinish; lighting: LightingMode }) {
  const dark = lighting === 'night';
  return <group name="design-room">
    <mesh name="room-floor" rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color={view === 'studio' ? '#e9dfd1' : floorFinishes[floor].colour} roughness={0.95} metalness={0} />
    </mesh>
    {view === 'room' && <>
      <mesh position={[0, 1.5, -1.7]} receiveShadow><planeGeometry args={[10, 3]} /><meshStandardMaterial color={dark ? '#999389' : '#e6dfd4'} roughness={1} /></mesh>
      <mesh position={[-2.3, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[10, 3]} /><meshStandardMaterial color={dark ? '#8c887f' : '#d4cbbb'} roughness={1} /></mesh>
      <mesh position={[0, 0.045, -1.685]}><boxGeometry args={[10, 0.09, 0.025]} /><meshStandardMaterial color="#c5b9a6" roughness={0.8} /></mesh>
      <mesh position={[-2.285, 0.045, 0]}><boxGeometry args={[0.025, 0.09, 10]} /><meshStandardMaterial color="#c5b9a6" roughness={0.8} /></mesh>
    </>}
  </group>;
}

export function DimensionGuides({ dimensions: d }: { dimensions: DeskDimensions }) {
  const { segments, labels } = useMemo(() => {
    const points: number[] = [];
    const line = (a: Triple, b: Triple) => points.push(...a, ...b);
    const front = d.depth / 2 + 0.12, right = d.width / 2 + 0.12;
    line([-d.width / 2, 0.02, front], [d.width / 2, 0.02, front]);
    for (const x of [-d.width / 2, d.width / 2]) line([x, 0.02, front - 0.035], [x, 0.02, front + 0.035]);
    line([right, 0.02, -d.depth / 2], [right, 0.02, d.depth / 2]);
    for (const z of [-d.depth / 2, d.depth / 2]) line([right - 0.035, 0.02, z], [right + 0.035, 0.02, z]);
    line([-right, 0.02, -d.depth / 2], [-right, d.height, -d.depth / 2]);
    for (const y of [0.02, d.height]) line([-right - 0.035, y, -d.depth / 2], [-right + 0.035, y, -d.depth / 2]);
    return { segments: new Float32Array(points), labels: [
      { position: [0, 0.02, front + 0.04] as Triple, text: `W ${Math.round(d.width * 100)} cm` },
      { position: [right + 0.04, 0.02, 0] as Triple, text: `D ${Math.round(d.depth * 100)} cm` },
      { position: [-right - 0.05, d.height / 2, -d.depth / 2] as Triple, text: `H ${Math.round(d.height * 100)} cm` },
    ] };
  }, [d]);
  return <group name="dimension-guides">
    <lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" args={[segments, 3]} /></bufferGeometry><lineBasicMaterial color="#a3442d" depthTest={false} transparent opacity={0.8} /></lineSegments>
    {labels.map(label => <Html key={label.text} position={label.position} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><span className="dimension-label">{label.text}</span></Html>)}
  </group>;
}

/** Capture synchronously after rendering; no permanent preserveDrawingBuffer allocation. */
export function CaptureView({ revision, onCapture }: { revision: number; onCapture?: (data: string | null) => void }) {
  const { gl, scene, camera, invalidate } = useThree();
  const captured = useRef(0);
  useEffect(() => {
    if (!revision || !onCapture || revision === captured.current) return;
    captured.current = revision;
    try {
      gl.render(scene, camera);
      const image = gl.domElement.toDataURL('image/png');
      onCapture(image.startsWith('data:image/png;') ? image : null);
      invalidate();
    } catch { onCapture(null); }
  }, [revision, onCapture, gl, scene, camera, invalidate]);
  return null;
}
