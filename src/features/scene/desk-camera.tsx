'use client';

import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCallback, useLayoutEffect, useMemo, useRef, type ComponentRef } from 'react';
import { PerspectiveCamera } from 'three';
import { calculateCameraFraming, type CameraCommand } from './camera-framing';
import type { DeskDimensions } from './desk-dimensions';

export function DeskCamera({ dimensions, command }: { dimensions: DeskDimensions; command: CameraCommand }) {
  const camera = useThree(state => state.camera);
  const size = useThree(state => state.size);
  const invalidate = useThree(state => state.invalidate);
  const appliedRevision = useRef(-1);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const frame = useMemo(
    () => calculateCameraFraming(dimensions, size.width / Math.max(1, size.height)),
    [dimensions, size.width, size.height],
  );

  const reset = useCallback(() => {
    if (!(camera instanceof PerspectiveCamera) || !controls.current) return;
    camera.position.set(...frame.position);
    controls.current.target.set(...frame.target);
    controls.current.update();
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, frame, invalidate]);

  // Resize/orientation changes get a new fit, including a resize after a user orbit.
  useLayoutEffect(reset, [reset]);
  useLayoutEffect(() => {
    if (appliedRevision.current === command.revision) return;
    appliedRevision.current = command.revision;
    if (command.action === 'reset') { reset(); return; }
    if (!controls.current) return;
    const target = controls.current.target;
    const distance = camera.position.distanceTo(target);
    const desired = distance * (command.action === 'zoom-in' ? 0.85 : 1 / 0.85);
    const bounded = Math.max(frame.minDistance, Math.min(frame.maxDistance, desired));
    camera.position.sub(target).multiplyScalar(bounded / distance).add(target);
    controls.current.update();
    invalidate();
  }, [camera, command, frame, invalidate, reset]);

  return <OrbitControls
    ref={controls}
    makeDefault
    enablePan={false}
    enableDamping={false}
    autoRotate={false}
    target={frame.target}
    minDistance={frame.minDistance}
    maxDistance={frame.maxDistance}
    minPolarAngle={frame.minPolarAngle}
    maxPolarAngle={frame.maxPolarAngle}
    rotateSpeed={0.7}
    zoomSpeed={0.7}
  />;
}
