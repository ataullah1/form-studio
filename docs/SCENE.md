# Desk geometry, camera and materials

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

Step 2 used neutral geometry-review materials. Step 3 replaces the tabletop surface with selected wood maps and adds black/white frame materials; geometry is unchanged. No HDR environment, external model, accessory or backend is introduced.

## Lighting and floor

Ambient/hemisphere lighting plus two directional lights keep the structure readable. One directional light casts a 1024² shadow map onto a floor shadow receiver at y=0. The visual identity revision uses a transparent espresso shadow material over the semantic warm-mineral scene background. The model casts/receives shadows. Floor contact is visible in saved screenshots. This is a simple fixed-light setup; day/night presets and later quality controls are not implemented yet.

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

## Step 3 surfaces and resource ownership

`Configurator` owns only finish/frame state; its partial functional updates feed both HTML summary and lazy scene. Size is still the default catalog size. The small illustrative estimate includes the catalog walnut surcharge; the full pricing/validation engine remains Step 6. Selection is immediately visible even while textures download. 2D references use the selected finish/frame labels.

Each finish has independent 1k colour, OpenGL normal and roughness maps. Colour uses SRGBColorSpace; data maps use NoColorSpace. ImageBitmap decoding disables colour conversion/premultiplication and explicitly flips Y; Texture.flipY remains false. Source grain was visually checked as horizontal: texture rotation is zero, aligned with tabletop width. ExtrudeGeometry's metre-based XY UVs and a 1/m tile repeat preserve the one-metre source scale. Offset centres the tile. Edge UVs are the extrusion's procedural wrapping, not modeled end grain or veneer seams.

Oak/walnut/ash have separate grain maps plus a restrained material coat, roughness 0.82/0.80/0.86 and normal strength 0.12/0.10/0.10. No metallic wood. Frame coats are charcoal #292d29 / warm white #e9e6df; feet remain dark. These concept finishes are not calibrated product photography. A 180ms brightness reveal softens a newly ready finish, skips reduced-motion users and stops invalidating when complete. This is a short material reveal, not a dual-map crossfade. Existing demand rendering and idle behavior remain intact.

Each mounted WoodSurface creates one `WoodTextureLibrary`; no global useLoader cache is mutated. The cache holds at most three finishes/nine texture maps and deduplicates in-flight requests. Renderer anisotropy is capped at 8, with mipmaps. Only selected finish data maps load; small colour-map swatches can load before 3D. A successful set is reused through switches; explicit retry reloads only a failed set. Failed partial results are disposed. A twelve-second per-map timeout prevents indefinite loading.

Keep the previous successful material while a new finish downloads. If a map fails, show a neutral surface, explicit message and Retry finish button while preserving summary/camera/frame. Stale selections cannot overwrite the latest selection. Unmount aborts pending fetches, disposes all owned textures and closes decoded ImageBitmaps, including late decodes. R3F owns declarative materials/geometries and renderer; the library exclusively owns manually loaded textures/bitmaps.

See [Step 3 evidence](evidence/step-3/README.md). Physical-phone/GPU checks remain pending; desktop software rendering is not evidence of mobile hardware performance.
