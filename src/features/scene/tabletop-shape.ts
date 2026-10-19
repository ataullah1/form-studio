import { Shape, type ExtrudeGeometryOptions } from 'three';
import type { DeskDimensions } from './desk-dimensions';

/** Bevel expands the outline; inset it so the finished slab keeps catalog dimensions. */
export function tabletopExtrusion(dimensions: DeskDimensions) {
  const { width, depth, thickness, cornerRadius, bevel } = dimensions;
  const x = width / 2 - bevel;
  const z = depth / 2 - bevel;
  const r = cornerRadius - bevel;
  const shape = new Shape();
  shape.moveTo(-x + r, -z);
  shape.lineTo(x - r, -z);
  shape.quadraticCurveTo(x, -z, x, -z + r);
  shape.lineTo(x, z - r);
  shape.quadraticCurveTo(x, z, x - r, z);
  shape.lineTo(-x + r, z);
  shape.quadraticCurveTo(-x, z, -x, z - r);
  shape.lineTo(-x, -z + r);
  shape.quadraticCurveTo(-x, -z, -x + r, -z);
  shape.closePath();

  const settings: ExtrudeGeometryOptions = {
    depth: thickness - 2 * bevel,
    steps: 1,
    bevelEnabled: true,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 3,
    curveSegments: 8,
  };
  return { shape, settings };
}
