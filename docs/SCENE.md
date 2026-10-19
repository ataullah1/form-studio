# Desk geometry and camera — Step 2

## Coordinate convention

All dimensions are metres. X is width, Y is up, Z is depth; negative Z is the rear. The origin is at the floor under the centre of the desk. The floor is y=0, the tabletop surface is y=0.74, its underside is y=0.71, and its centre is y=0.725. The default product footprint is 1.40 × 0.70.

`deriveDeskDimensions(sizeId)` is the single pure source of geometry measurements. It supports all three catalog sizes, but the public size selector remains disabled until Step 4. No nonuniform whole-model scaling is used.

## Model construction

| Part | Construction / placement |
| --- | --- |
| Tabletop | Rounded 2D outline with 35 mm corner radius, extruded into a 30 mm slab; 4 mm edge bevel |
| Top position | Centre y=0.725; rotate the centred extrusion −90° around X so its extrusion axis becomes world Y |
| Four legs | 45 × 45 mm section; leg centres inset 95 mm from width edges and 85 mm from front/rear edges |
| Feet | 8 mm high, bottom at y=0; legs start at y=0.008 |
| Upper rails | 40 mm high, top at y=0.71 and bottom at y=0.67; legs end at y=0.67 |
| Rear crossbar | Joins the two rear legs at y=0.25; span derived between their inner faces |

The tabletop outline is inset by the bevel amount before extrusion. Extrusion depth is thickness minus two bevel amounts. This avoids accidentally increasing the finished width, depth or thickness. Unit checks construct the actual Three extrusion and measure its bounds.

Frame components are separate rounded meshes with fixed section sizes; only their lengths/positions derive from footprint dimensions. Feet are separate parts. R3F owns and disposes the declaratively mounted geometry/materials. The shape/extrusion parameters are memoized rather than rebuilt each frame.

The tabletop has a neutral matte material; the frame has a neutral charcoal material. These are geometry-review materials, not final oak/black finish presets. No runtime textures, HDR environments, external model files, accessories or backend work is introduced here.

## Lighting and floor

Ambient/hemisphere lighting plus two directional lights keep the structure readable. One directional light casts a 1024² shadow map onto a matte floor at y=0. The model casts/receives shadows. Floor contact is visible in saved screenshots. This is a simple fixed-light setup; day/night presets and later quality controls are not implemented yet.

## Camera

One Drei OrbitControls instance manages a perspective camera with 38° vertical FOV. The target is at the centre of the product bounds. `calculateCameraFraming` derives a bounding sphere, fits it to the narrower horizontal/vertical field of view, and leaves a 12% distance margin. This works from the actual viewer container aspect ratio rather than viewport labels.

Reset returns to a fixed three-quarter direction, recomputed for the current container. Resize/orientation changes reframe the product even after orbiting/zooming. Camera commands use revisions so a previous zoom action does not reapply after resize.

- Orbit is unrestricted around Y; panning is disabled.
- Vertical orbit is bounded to keep the camera above the tabletop. At the closest legal zoom and lowest legal elevation, the eye is at least 10 cm above the top surface.
- Minimum distance stays outside the product bounding sphere, including the near plane; maximum distance is finite.
- Zoom buttons respect the same bounds as wheel/pinch. Close zoom may deliberately crop the product for inspection; Reset shows the whole desk.
- Reset/zoom are immediate, without a camera animation or damping tail. Step 5 may add reduced-motion-aware transitions.

The HTML buttons and summary are outside Canvas. Canvas drag/pinch captures gestures only inside its region; normal page scrolling remains available outside it. Physical touch behavior still requires phone checks.

## Rendering and fallback

The landing remains server-rendered without Three. Only an explicit View desk in 3D request loads the client-only Canvas. The existing missing-WebGL, module/renderer-error, startup-timeout and context-loss fallback paths remain intact.

The scene renders on demand, without auto-rotation/damping. A browser instrumentation check verifies draw calls stop while idle and the renderer context is released after navigation. This is a narrow lifecycle check, not a general memory-leak or mobile-performance certification.

## Evidence and references

See [Step 2 evidence](evidence/step-2/README.md), `src/features/scene/desk-geometry.test.ts` and `tests/e2e/desk-camera.spec.ts`.

Implementation references checked against the installed packages:
- [Drei RoundedBox](https://drei.docs.pmnd.rs/shapes/rounded-box)
- [Three OrbitControls](https://threejs.org/docs/pages/OrbitControls.html)
- [R3F hooks and render invalidation](https://r3f.docs.pmnd.rs/api/hooks)

## Learning map

A geometry describes shape, a material describes surface response to light, and a mesh joins them at a position. The scene groups the product, lighting and floor. The camera chooses what the visitor sees; controls move that camera around a fixed target. Changing a camera does not alter desk dimensions, product selection or price.
