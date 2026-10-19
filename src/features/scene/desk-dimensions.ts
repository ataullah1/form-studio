import { catalogV1, type SizeId } from '../../lib/catalog';

export type Triple = [number, number, number];
export interface DeskPart {
  id: string;
  position: Triple;
  size: Triple;
  radius: number;
}

/** Metres; x = width, y = up, z = depth. Origin is the floor at desk centre. */
export function deriveDeskDimensions(sizeId: SizeId) {
  const { widthMetres: width, depthMetres: depth } = catalogV1.sizes[sizeId];
  const height = catalogV1.heightMetres;
  const thickness = catalogV1.tabletopThicknessMetres;
  const underside = height - thickness;
  const railHeight = 0.04;
  const legWidth = 0.045;
  const footHeight = 0.008;
  const legTop = underside - railHeight;
  const legHeight = legTop - footHeight;
  const legX = width / 2 - 0.095;
  const legZ = depth / 2 - 0.085;
  const parts: DeskPart[] = [];

  for (const x of [-legX, legX]) {
    for (const z of [-legZ, legZ]) {
      const id = `${x < 0 ? 'left' : 'right'}-${z < 0 ? 'rear' : 'front'}`;
      parts.push({
        id: `leg-${id}`, position: [x, footHeight + legHeight / 2, z],
        size: [legWidth, legHeight, legWidth], radius: 0.0025,
      });
      parts.push({
        id: `foot-${id}`, position: [x, footHeight / 2, z],
        size: [legWidth + 0.002, footHeight, legWidth + 0.002], radius: 0.0015,
      });
    }
    parts.push({
      id: `side-rail-${x < 0 ? 'left' : 'right'}`,
      position: [x, underside - railHeight / 2, 0],
      size: [legWidth, railHeight, 2 * legZ + legWidth], radius: 0.002,
    });
  }
  for (const z of [-legZ, legZ]) {
    parts.push({
      id: `rail-${z < 0 ? 'rear' : 'front'}`,
      position: [0, underside - railHeight / 2, z],
      size: [2 * legX + legWidth, railHeight, legWidth], radius: 0.002,
    });
  }
  parts.push({
    id: 'rear-crossbar', position: [0, 0.25, -legZ],
    size: [2 * legX - legWidth, 0.035, 0.025], radius: 0.002,
  });

  return {
    width, depth, height, thickness, underside,
    tabletopY: height - thickness / 2,
    cornerRadius: 0.035,
    bevel: 0.004,
    legX, legZ, legWidth, legTop, footHeight,
    parts,
  };
}
export type DeskDimensions = ReturnType<typeof deriveDeskDimensions>;
