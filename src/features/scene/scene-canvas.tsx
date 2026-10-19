'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { PCFSoftShadowMap, type WebGLRenderer } from 'three';
import { defaultConfiguration } from '@/lib/catalog';
import { deriveDeskDimensions } from './desk-dimensions';
import { DeskModel } from './desk-model';
import { DeskCamera } from './desk-camera';
import { CAMERA_FOV, type CameraCommand } from './camera-framing';
import type { AppearanceSelection } from '../configurator/appearance';
import type { TextureReport } from './wood-surface';

interface Props { onReady: () => void; onUnavailable: () => void; command: CameraCommand; appearance: AppearanceSelection; attempt: number; onTextureStatus: (report: TextureReport) => void }

export default function SceneCanvas({ onReady, onUnavailable, command, appearance, attempt, onTextureStatus }: Props) {
  const sceneColours = useMemo(() => {
    const tokens = getComputedStyle(document.documentElement);
    return { surface: tokens.getPropertyValue('--colour-scene').trim(), shadow: tokens.getPropertyValue('--colour-ink').trim() };
  }, []);
  const dimensions = useMemo(() => deriveDeskDimensions(defaultConfiguration.sizeId), []);
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
    camera={{ position: [2, 1.8, 2.7], fov: CAMERA_FOV, near: 0.025, far: 40 }}
    shadows={{ type: PCFSoftShadowMap }}
    gl={{ antialias: true, alpha: false }}
    fallback={<div role="status">3D unavailable. Please use the 2D view.</div>}
    onCreated={({ gl }) => {
      renderer.current = gl;
      readyFrame.current = requestAnimationFrame(onReady);
    }}
    aria-label="Interactive Studio Desk 01 material preview, 140 by 70 centimetres"
  >
    <color attach="background" args={[sceneColours.surface]} />
    <ambientLight intensity={1.15} />
    <hemisphereLight args={['#fff9ee', '#a28b79', 1.1]} />
    <directionalLight
      position={[-2, 4, 2]}
      intensity={2.1}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-camera-left={-2.5}
      shadow-camera-right={2.5}
      shadow-camera-top={2.5}
      shadow-camera-bottom={-2.5}
      shadow-camera-near={0.1}
      shadow-camera-far={10}
      shadow-normalBias={0.012}
      shadow-bias={-0.0001}
      shadow-radius={3}
    />
    <directionalLight position={[2, 2, -3]} intensity={0.7} />
    <DeskModel dimensions={dimensions} appearance={appearance} attempt={attempt} onTextureStatus={onTextureStatus} />
    <mesh name="floor" rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <shadowMaterial color={sceneColours.shadow} transparent opacity={0.18} />
    </mesh>
    <DeskCamera dimensions={dimensions} command={command} />
  </Canvas>;
}
