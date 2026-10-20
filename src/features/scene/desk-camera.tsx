'use client';

import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, type ComponentRef } from 'react';
import { PerspectiveCamera, Vector3 } from 'three';
import { calculateCameraFraming, cameraPreset, type CameraCommand } from './camera-framing';

export function DeskCamera({ dimensions, command, active, allowZoom = true }: { dimensions: { width: number; height: number; depth: number }; command: CameraCommand; active: boolean; allowZoom?: boolean }) {
  const camera = useThree(state => state.camera);
  const size = useThree(state => state.size);
  const invalidate = useThree(state => state.invalidate);
  const appliedRevision = useRef(-1);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const reducedMotion = useRef(false);
  const transition = useRef<{ from: Vector3; to: Vector3; elapsed: number } | null>(null);
  const frame = useMemo(() => calculateCameraFraming(dimensions, size.width / Math.max(1, size.height)), [dimensions, size.width, size.height]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      reducedMotion.current = media.matches;
      if (media.matches && transition.current) {
        camera.position.copy(transition.current.to);
        transition.current = null;
        controls.current?.update();
        invalidate();
      }
    };
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [camera, invalidate]);

  const reset = useCallback(() => {
    transition.current = null;
    if (!(camera instanceof PerspectiveCamera) || !controls.current) return;
    camera.position.set(...frame.position);
    controls.current.target.set(...frame.target);
    controls.current.update(); camera.updateProjectionMatrix(); invalidate();
  }, [camera, frame, invalidate]);

  // Reframe immediately after size/orientation changes; never replay a previous command.
  useLayoutEffect(reset, [reset]);
  useLayoutEffect(() => {
    if (appliedRevision.current === command.revision) return;
    appliedRevision.current = command.revision;
    if (!controls.current) return;
    let destination: Vector3;
    if (command.action === 'reset' || command.action === 'front' || command.action === 'detail' || command.action === 'top' || command.action === 'rear') {
      destination = new Vector3(...cameraPreset(frame, command.action));
    } else {
      const target = controls.current.target;
      const distance = camera.position.distanceTo(target);
      const desired = distance * (command.action === 'zoom-in' ? 0.85 : 1 / 0.85);
      const bounded = Math.max(frame.minDistance, Math.min(frame.maxDistance, desired));
      destination = camera.position.clone().sub(target).multiplyScalar(bounded / distance).add(target);
    }
    // Zoom is immediate; named views use a short finite transition unless motion is reduced.
    if (reducedMotion.current || !active || command.action.startsWith('zoom') || camera.position.distanceTo(destination) < 0.00001) {
      transition.current = null; camera.position.copy(destination); controls.current.update();
    } else transition.current = { from: camera.position.clone(), to: destination, elapsed: 0 };
    invalidate();
  }, [active, camera, command, frame, invalidate]);

  useFrame((_, delta) => {
    const moving = transition.current;
    if (!moving || !active || !controls.current) return;
    moving.elapsed = Math.min(1, moving.elapsed + Math.min(delta, 0.05) / 0.26);
    // Blend direction and distance separately to avoid cutting through the desk.
    const target = controls.current.target;
    const from = moving.from.clone().sub(target);
    const to = moving.to.clone().sub(target);
    const eased = 1 - (1 - moving.elapsed) ** 3;
    const direction = from.clone().normalize().lerp(to.clone().normalize(), eased);
    if (direction.lengthSq() < 0.001) direction.set(0, 1, 0);
    camera.position.copy(direction.normalize().multiplyScalar(from.length() + (to.length() - from.length()) * eased).add(target));
    if (moving.elapsed === 1) { camera.position.copy(moving.to); transition.current = null; }
    controls.current.update(); invalidate();
  });

  return <OrbitControls ref={controls} makeDefault enabled={active}
    onStart={() => { transition.current = null; }}
    enableZoom={allowZoom} enablePan={false} enableDamping={false} autoRotate={false}
    target={frame.target} minDistance={frame.minDistance} maxDistance={frame.maxDistance}
    minPolarAngle={frame.minPolarAngle} maxPolarAngle={frame.maxPolarAngle}
    rotateSpeed={0.7} zoomSpeed={0.7}
  />;
}
