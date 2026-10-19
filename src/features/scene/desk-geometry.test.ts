import { describe, expect, it } from 'vitest';
import { ExtrudeGeometry, PerspectiveCamera, Vector3 } from 'three';
import { catalogV1, type SizeId } from '../../lib/catalog';
import { deriveDeskDimensions } from './desk-dimensions';
import { tabletopExtrusion } from './tabletop-shape';
import { CAMERA_FOV, calculateCameraFraming } from './camera-framing';

const sizes = Object.keys(catalogV1.sizes) as SizeId[];

for (const sizeId of sizes) {
  describe(`physical desk constraints: ${sizeId}`, () => {
    const d = deriveDeskDimensions(sizeId);

    it('keeps the actual beveled slab within published width/depth and at 74cm surface height', () => {
      const { shape, settings } = tabletopExtrusion(d);
      const geometry = new ExtrudeGeometry(shape, settings);
      geometry.center();
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(0, d.tabletopY, 0);
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      expect(box.max.x - box.min.x).toBeCloseTo(d.width, 6);
      expect(box.max.z - box.min.z).toBeCloseTo(d.depth, 6);
      expect(box.max.y).toBeCloseTo(0.74, 6);
      expect(box.min.y).toBeCloseTo(0.71, 6);
      expect(box.max.y - box.min.y).toBeCloseTo(0.03, 6);
      geometry.dispose();
    });

    it('has four grounded feet, supported legs, rails touching the slab and a joined rear crossbar', () => {
      const feet = d.parts.filter(p => p.id.startsWith('foot-'));
      const legs = d.parts.filter(p => p.id.startsWith('leg-'));
      const rails = d.parts.filter(p => p.id.includes('rail'));
      expect(feet).toHaveLength(4);
      expect(legs).toHaveLength(4);
      for (const foot of feet) expect(foot.position[1] - foot.size[1] / 2).toBeCloseTo(0, 8);
      for (const leg of legs) {
        expect(leg.position[1] - leg.size[1] / 2).toBeCloseTo(d.footHeight, 8);
        expect(leg.position[1] + leg.size[1] / 2).toBeCloseTo(d.legTop, 8);
        expect(leg.size[0]).toBe(0.045);
        expect(leg.size[2]).toBe(0.045);
      }
      for (const rail of rails) {
        expect(rail.position[1] + rail.size[1] / 2).toBeCloseTo(d.underside, 8);
        expect(rail.position[1] - rail.size[1] / 2).toBeCloseTo(d.legTop, 8);
      }
      const crossbar = d.parts.find(p => p.id === 'rear-crossbar')!;
      expect(crossbar.size[0] / 2).toBeCloseTo(d.legX - d.legWidth / 2, 8);
      expect(crossbar.position[2]).toBe(-d.legZ);
    });

    it('keeps every frame part within the tabletop footprint and above the floor', () => {
      expect(new Set(d.parts.map(p => p.id)).size).toBe(d.parts.length);
      for (const part of d.parts) {
        expect(Math.abs(part.position[0]) + part.size[0] / 2).toBeLessThan(d.width / 2);
        expect(Math.abs(part.position[2]) + part.size[2] / 2).toBeLessThan(d.depth / 2);
        expect(part.position[1] - part.size[1] / 2).toBeGreaterThanOrEqual(-1e-9);
        expect(part.position[1] + part.size[1] / 2).toBeLessThanOrEqual(d.underside + 1e-9);
      }
    });

    for (const aspect of [0.65, 1, 1.8, 2.5]) {
      it(`fits all product corners with safe orbit/zoom limits at aspect ${aspect}`, () => {
        const fit = calculateCameraFraming(d, aspect);
        const camera = new PerspectiveCamera(CAMERA_FOV, aspect, fit.near, fit.far);
        camera.position.set(...fit.position);
        camera.lookAt(...fit.target);
        camera.updateMatrixWorld();
        for (const x of [-d.width / 2, d.width / 2]) {
          for (const y of [0, d.height]) {
            for (const z of [-d.depth / 2, d.depth / 2]) {
              const point = new Vector3(x, y, z).project(camera);
              expect(Math.abs(point.x)).toBeLessThan(0.9);
              expect(Math.abs(point.y)).toBeLessThan(0.9);
              expect(point.z).toBeGreaterThan(-1);
              expect(point.z).toBeLessThan(1);
            }
          }
        }
        const lowestCameraY = fit.target[1] + fit.minDistance * Math.cos(fit.maxPolarAngle);
        expect(lowestCameraY).toBeGreaterThanOrEqual(d.height + 0.099);
        expect(fit.minDistance - fit.radius).toBeGreaterThan(fit.near);
        expect(fit.distance).toBeGreaterThan(fit.minDistance);
        expect(fit.maxDistance).toBeGreaterThan(fit.distance);
      });
    }
  });
}
