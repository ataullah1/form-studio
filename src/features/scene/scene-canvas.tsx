'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import type { WebGLRenderer } from 'three';

interface Props { onReady: () => void; onUnavailable: () => void }

export default function SceneCanvas({ onReady, onUnavailable }: Props) {
  const renderer = useRef<WebGLRenderer | null>(null);
  const readyFrame = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (readyFrame.current !== null) cancelAnimationFrame(readyFrame.current);
      // R3F owns disposal of renderer, scene geometry/materials and event handlers.
      renderer.current = null;
    };
  }, []);

  useEffect(() => {
    // Canvas mounts in its own React root. Poll only until its renderer exists,
    // then use a native context-loss listener with explicit teardown.
    let frame: number;
    let element: HTMLCanvasElement | undefined;
    const lost = (event: Event) => { event.preventDefault(); onUnavailable(); };
    const attach = () => {
      const canvas = renderer.current?.domElement;
      if (!canvas) { frame = requestAnimationFrame(attach); return; }
      element = canvas;
      element.addEventListener('webglcontextlost', lost);
    };
    frame = requestAnimationFrame(attach);
    return () => { cancelAnimationFrame(frame); element?.removeEventListener('webglcontextlost', lost); };
  }, [onUnavailable]);

  return <Canvas
    frameloop="demand"
    dpr={[1, 1.5]}
    camera={{ position: [2.6, 2, 3], fov: 42 }}
    gl={{ antialias: true, alpha: false }}
    fallback={<div role="status">3D unavailable. Please use the 2D view.</div>}
    onCreated={({ gl }) => {
      renderer.current = gl;
      readyFrame.current = requestAnimationFrame(onReady);
    }}
    aria-label="Interactive 3D integration test object; this is not the final desk"
  >
    <color attach="background" args={['#eaece3']} />
    <ambientLight intensity={1.4} />
    <directionalLight position={[3, 4, 2]} intensity={2} />
    <mesh rotation={[0.15, 0.4, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#b58d5f" roughness={0.65} />
    </mesh>
    <gridHelper args={[5, 10, '#aeb7a2', '#d1d7c8']} position={[0, -0.8, 0]} />
    <OrbitControls makeDefault enablePan={false} minDistance={2} maxDistance={7} maxPolarAngle={Math.PI / 2} />
  </Canvas>;
}
