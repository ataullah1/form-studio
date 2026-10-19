import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { catalogV1, defaultConfiguration, type AccessoryId, type SizeId } from '../../lib/catalog';
import { deriveAccessoryLayout, deriveProductBounds } from './accessory-layout';
import { deriveDeskDimensions } from './desk-dimensions';
import { calculateCameraFraming, CAMERA_FOV } from './camera-framing';

const ids = Object.keys(catalogV1.accessories) as AccessoryId[];
for (const sizeId of Object.keys(catalogV1.sizes) as SizeId[]) {
  describe(`${sizeId} fixed accessory layout`, () => {
    const desk = deriveDeskDimensions(sizeId);
    const layout = deriveAccessoryLayout(desk);
    it('preserves fixed sizes, edge clearances, surface contact and under-desk clearance', () => {
      const reference = deriveAccessoryLayout(deriveDeskDimensions('140x70'));
      for (const id of ids) {
        const { position: p, size: s } = layout[id];
        expect(s).toEqual(reference[id].size);
        expect(Math.abs(p[0]) + s[0] / 2).toBeLessThan(desk.width / 2);
        expect(Math.abs(p[2]) + s[2] / 2).toBeLessThan(desk.depth / 2);
      }
      expect(layout.lamp.position[0] + desk.width / 2).toBeCloseTo(0.14);
      expect(layout.lamp.position[2] + desk.depth / 2).toBeCloseTo(0.14);
      expect(layout['monitor-stand'].position[2] + desk.depth / 2).toBeCloseTo(0.16);
      expect(layout.lamp.position[1]).toBe(desk.height);
      expect(layout['monitor-stand'].position[1]).toBe(desk.height);
      expect(layout['cable-tray'].position[1] + layout['cable-tray'].size[1]).toBeCloseTo(desk.underside);
      // The tray is ahead of the rear rail and behind the front rail at every size.
      const tray = layout['cable-tray'];
      expect(tray.position[2] - tray.size[2] / 2).toBeGreaterThan(-desk.legZ + desk.legWidth / 2);
      expect(tray.position[2] + tray.size[2] / 2).toBeLessThan(desk.legZ - desk.legWidth / 2);
      expect(Math.abs(layout.lamp.position[0]) - layout.lamp.size[0] / 2).toBeGreaterThan(layout['monitor-stand'].size[0] / 2);
    });
    for (let mask = 0; mask < 8; mask++) {
      it(`fits the desk and selected accessory corners, combination ${mask}`, () => {
        const accessoryIds = ids.filter((_, bit) => mask & (1 << bit));
        const config = { ...defaultConfiguration, sizeId, accessoryIds };
        const bounds = deriveProductBounds(desk, config);
        for (const aspect of [0.65, 1.8]) {
          const fit = calculateCameraFraming(bounds, aspect);
          const camera = new PerspectiveCamera(CAMERA_FOV, aspect, fit.near, fit.far);
          camera.position.set(...fit.position); camera.lookAt(...fit.target); camera.updateMatrixWorld();
          for (const id of accessoryIds) {
            const { position: p, size: s } = layout[id];
            for (const x of [-1, 1]) for (const y of [0, 1]) for (const z of [-1, 1]) {
              const projected = new Vector3(p[0] + x * s[0] / 2, p[1] + y * s[1], p[2] + z * s[2] / 2).project(camera);
              expect(Math.abs(projected.x)).toBeLessThan(0.9); expect(Math.abs(projected.y)).toBeLessThan(0.9);
            }
          }
        }
      });
    }
  });
}
