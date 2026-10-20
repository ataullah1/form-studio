import type { Triple } from './desk-dimensions';

export const CAMERA_FOV = 38;
export interface CameraCommand { revision: number; action: 'reset' | 'front' | 'detail' | 'top' | 'rear' | 'zoom-in' | 'zoom-out' }

/** Fit a bounding sphere to the smaller camera field of view, including portrait screens. */
export function calculateCameraFraming(dimensions: { width: number; height: number; depth: number }, aspect: number) {
  if (!Number.isFinite(aspect) || aspect <= 0) throw new Error('Camera aspect must be positive');
  const radius = Math.hypot(dimensions.width / 2, dimensions.height / 2, dimensions.depth / 2);
  const verticalHalfFov = CAMERA_FOV * Math.PI / 360;
  const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * aspect);
  const limitingAngle = Math.min(verticalHalfFov, horizontalHalfFov);
  const distance = radius / Math.sin(limitingAngle) * 1.12;
  const target: Triple = [0, dimensions.height / 2, 0];
  const direction: Triple = [1.25, 1.1, 1.65];
  const directionLength = Math.hypot(...direction);
  const position: Triple = direction.map((value, i) => target[i] + value / directionLength * distance) as Triple;
  const minDistance = radius + 0.28;
  // At the closest legal zoom, the lowest orbit remains 10 cm above the surface.
  const maxPolarAngle = Math.acos((dimensions.height - target[1] + 0.1) / minDistance);
  // Tall accessories tighten the legal orbit: fit/reset must obey that envelope too.
  if (Math.acos(direction[1] / directionLength) > maxPolarAngle) {
    const azimuth = Math.atan2(direction[0], direction[2]);
    position[0] = target[0] + distance * Math.sin(maxPolarAngle) * Math.sin(azimuth);
    position[1] = target[1] + distance * Math.cos(maxPolarAngle);
    position[2] = target[2] + distance * Math.sin(maxPolarAngle) * Math.cos(azimuth);
  }

  return {
    target, position, radius, distance,
    minDistance, maxDistance: distance * 2.2,
    minPolarAngle: 0.2, maxPolarAngle,
    near: 0.025, far: 40,
  };
}

/** Presets remain inside the same orbit/zoom envelope as manual interaction. */
export function cameraPreset(frame: ReturnType<typeof calculateCameraFraming>, action: 'reset' | 'front' | 'detail' | 'top' | 'rear'): Triple {
  if (action === 'reset') return [...frame.position];
  const distance = action === 'detail' ? Math.max(frame.minDistance, frame.distance * 0.72) : frame.distance;
  const polar = Math.min(frame.maxPolarAngle, action === 'top' ? frame.minPolarAngle : action === 'front' || action === 'rear' ? 1.05 : 0.8);
  const azimuth = action === 'top' || action === 'front' ? 0 : action === 'rear' ? Math.PI : 0.65;
  return [
    frame.target[0] + distance * Math.sin(polar) * Math.sin(azimuth),
    frame.target[1] + distance * Math.cos(polar),
    frame.target[2] + distance * Math.sin(polar) * Math.cos(azimuth),
  ];
}
