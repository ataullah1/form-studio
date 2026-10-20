import { expect, it } from 'vitest';
import { Vector3 } from 'three';
import { calculateCameraFraming, cameraPreset } from './camera-framing';
import { deriveDeskDimensions } from './desk-dimensions';
import { catalogV1, type SizeId } from '../../lib/catalog';

for (const sizeId of Object.keys(catalogV1.sizes) as SizeId[]) {
  it(`bounds Front, Detail, Top, Rear and Reset presets for ${sizeId} with/without the lamp at portrait/desktop aspect`, () => {
    const desk = deriveDeskDimensions(sizeId);
    for (const height of [desk.height, desk.height + 0.44]) for (const aspect of [0.65, 1.8]) {
      const frame = calculateCameraFraming({ ...desk, height }, aspect);
      const target = new Vector3(...frame.target);
      for (const action of ['reset', 'front', 'detail', 'top', 'rear'] as const) {
        const position = new Vector3(...cameraPreset(frame, action));
        const offset = position.clone().sub(target);
        expect(offset.length()).toBeGreaterThanOrEqual(frame.minDistance - 1e-9);
        expect(offset.length()).toBeLessThanOrEqual(frame.maxDistance);
        const polar = Math.acos(offset.y / offset.length());
        expect(polar).toBeGreaterThanOrEqual(frame.minPolarAngle - 1e-9);
        expect(polar).toBeLessThanOrEqual(frame.maxPolarAngle + 1e-9);
        expect(position.y).toBeGreaterThan(height + 0.09);
      }
      expect(cameraPreset(frame, 'reset')).toEqual(frame.position);
      expect(cameraPreset(frame, 'front')[0]).toBe(0);
    }
  });
}
