# Desk geometry, camera and materials

## Coordinate convention

All dimensions are metres. X is width, Y is up, Z is depth; negative Z is the rear. The origin is at the floor under the centre of the desk. The floor is y=0, the tabletop surface is y=0.74, its underside is y=0.71, and its centre is y=0.725. The default product footprint is 1.40 × 0.70.

`deriveDeskDimensions(sizeId)` is the single pure source of geometry measurements. It supports all three catalog sizes; Step 4 enables the public size selector. No nonuniform whole-model scaling is used.

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

Ambient/hemisphere lighting plus two directional lights keep the structure readable. One directional light casts a 1024² shadow map onto a floor shadow receiver at y=0. The visual identity revision uses a transparent espresso shadow material over the semantic warm-mineral scene background. The model casts/receives shadows. Floor contact is visible in saved screenshots. Step 5 extends this with fixed day/night presets (see below); quality presets remain future work.

## Camera

One Drei OrbitControls instance manages a perspective camera with 38° vertical FOV. The target is at the centre of the product bounds. `calculateCameraFraming` derives a bounding sphere, fits it to the narrower horizontal/vertical field of view, and leaves a 12% distance margin. This works from the actual viewer container aspect ratio rather than viewport labels.

Reset returns to a fixed three-quarter direction, recomputed for the current container. Resize/orientation changes reframe the product even after orbiting/zooming. Camera commands use revisions so a previous zoom action does not reapply after resize.

- Orbit is unrestricted around Y; panning is disabled.
- Vertical orbit is bounded to keep the camera above the tabletop. At the closest legal zoom and lowest legal elevation, the eye is at least 10 cm above the top surface.
- Minimum distance stays outside the product bounding sphere, including the near plane; maximum distance is finite.
- Zoom buttons respect the same bounds as wheel/pinch. Close zoom may deliberately crop the product for inspection; Reset shows the whole desk.
- Zoom remains immediate. Step 5 adds a finite 260ms transition for Front/Detail/Reset; reduced-motion users get immediate views. No damping tail or auto-rotation.

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

Step 3 initially gave `Configurator` only finish/frame state; its partial functional updates feed both HTML summary and lazy scene. Step 4 supersedes that state with the full canonical configuration below. The small illustrative estimate includes the catalog walnut surcharge; the full pricing engine remains Step 6. Selection is immediately visible even while textures download. 2D references use the selected finish/frame labels.

Each finish has independent 1k colour, OpenGL normal and roughness maps. Colour uses SRGBColorSpace; data maps use NoColorSpace. ImageBitmap decoding disables colour conversion/premultiplication and explicitly flips Y; Texture.flipY remains false. Source grain was visually checked as horizontal: texture rotation is zero, aligned with tabletop width. ExtrudeGeometry's metre-based XY UVs and a 1/m tile repeat preserve the one-metre source scale. Offset centres the tile. Edge UVs are the extrusion's procedural wrapping, not modeled end grain or veneer seams.

Oak/walnut/ash have separate grain maps plus a restrained material coat, roughness 0.82/0.80/0.86 and normal strength 0.12/0.10/0.10. No metallic wood. Frame coats are charcoal #292d29 / warm white #e9e6df; feet remain dark. These concept finishes are not calibrated product photography. A 180ms brightness reveal softens a newly ready finish, skips reduced-motion users and stops invalidating when complete. This is a short material reveal, not a dual-map crossfade. Existing demand rendering and idle behavior remain intact.

Each mounted WoodSurface creates one `WoodTextureLibrary`; no global useLoader cache is mutated. The cache holds at most three finishes/nine texture maps and deduplicates in-flight requests. Renderer anisotropy is capped at 8, with mipmaps. Only selected finish data maps load; small colour-map swatches can load before 3D. A successful set is reused through switches; explicit retry reloads only a failed set. Failed partial results are disposed. A twelve-second per-map timeout prevents indefinite loading.

Keep the previous successful material while a new finish downloads. If a map fails, show a neutral surface, explicit message and Retry finish button while preserving summary/camera/frame. Stale selections cannot overwrite the latest selection. Unmount aborts pending fetches, disposes all owned textures and closes decoded ImageBitmaps, including late decodes. R3F owns declarative materials/geometries and renderer; the library exclusively owns manually loaded textures/bitmaps.

See [Step 3 evidence](evidence/step-3/README.md). Physical-phone/GPU checks remain pending; desktop software rendering is not evidence of mobile hardware performance.

## Step 4 configuration and accessories

One `useReducer` in Configurator owns the complete catalog-versioned ProductConfiguration. Controls dispatch typed size/finish/frame/accessory/reset actions; scene, HTML estimate and 2D summary receive that same object. No duplicate UI configuration or persistence. `normalizeConfiguration` rejects unknown IDs, metadata versions and extra fields, and gives known accessories canonical catalog order/set semantics. There is one desk and at most one of each accessory. No share transport is implemented yet; its future input must use the same validation contract.

The three footprints derive tabletop geometry, leg spacing, rails and crossbar from metres, without whole-model scaling. R3F disposes replaced declarative geometry/materials. Finish textures remain owned by the existing per-viewer library and survive size changes. Reset configuration restores the 140×70 oak/black desk with no accessories; it leaves the unsaved quote draft alone.

Fixed bottom-centre anchors in `deriveAccessoryLayout`:

| Accessory | Anchor | Fixed dimensions / construction |
| --- | --- | --- |
| Lamp | Left edge +0.14 m, rear edge +0.14 m, tabletop surface | 14 cm diameter base, 32 cm pole, angled shade; conservative 22×44×16 cm bounding envelope |
| Monitor stand | Width centre, rear edge +0.16 m, tabletop surface | 46×20 cm top, 11 cm total height, two fixed supports |
| Cable tray | Width centre, rear edge +0.19 m, underside −0.105 m | 50×12 cm tray, shallow lips, two mounting brackets reaching underside |

All parts are original code geometry with matte frame-matching materials; no downloads/models added. Stand/lamp rest on the top; tray/brackets stay below it and clear the rear/side rails at all sizes. Attachment surfaces intentionally meet. Step 4 had no arbitrary drag placement or lamp lighting; Step 5 adds the night light below.

Camera framing uses the product bounds including selected accessory height. Size/height changes reframe the whole product; changing finish/frame or an accessory that leaves bounds unchanged preserves the current camera. This changes framing only, not mesh scale or grain scale. Existing orbit/zoom limits, error boundary, demand rendering and fallback remain.

The 2D schematic updates numeric dimensions and explicitly lists selected accessories; it is labelled not to scale and does not illustrate accessory geometry. The live estimate adds size, walnut surcharge and unique accessories from catalog facts; server-authoritative pricing, draft storage and backend work remain future steps.

Evidence: [Step 4 tests and screenshots](evidence/step-4/README.md). Real-phone checks remain unperformed.

## Step 5 lighting, camera and render policy

`SceneViewer` owns day/night mode and camera commands independently of ProductConfiguration. Neither enters the display estimate or future product payload. Day retains the warm atelier stage and prior lighting. Night uses a #292b32 background, cooler key/fill, ambient 0.65 and hemisphere 0.7 so wood remains readable even without the optional lamp. If the catalog lamp is selected, night adds a small warm emissive bulb and a local point light (intensity 0.35, distance 1.1m, decay 2, no additional shadow map). Removing the accessory removes its light. No HDRI, new asset or dependency.

One OrbitControls instance still owns orbit/pinch/zoom and camera limits. Front uses a centred front azimuth and safe elevation; Detail uses a closer three-quarter distance clamped to the same minimum; Reset restores the fitted full product. Tall-accessory reset positions now explicitly obey the legal polar envelope before reaching the controls. Front keeps an elevated inspection angle rather than a low orthographic manufacturing elevation. Detail intentionally permits closer/cropped inspection; Reset fits the full product.

Named views blend camera direction and distance separately over 260ms, retaining the fixed product target and avoiding a straight chord through the desk. Only the finite transition requests frames; manual input cancels it immediately. Reduced motion (including live preference changes) moves directly to the destination. Resize/product-bound changes reframe immediately and cancel an old transition. Zoom remains immediate. No second control system, perpetual animation or auto-rotate.

`RenderPolicy` limits shadow refreshes to product, lighting and resume changes; camera-only frames reuse the fixed-light shadow map. It restores the prior renderer setting on teardown. Demand rendering stops when idle. IntersectionObserver with a 120px pre-entry margin and document visibility events switch an offscreen/hidden Canvas to `frameloop=never`, disable controls and allow pending state to appear on resume. Async texture decoding can still finish while paused, but no draw is scheduled. Paused transitions remain bounded and resume with a capped frame delta.

The UI explicitly distinguishes the drag/pinch area from page scrolling. Existing touch-action:none is scoped to Canvas; exterior document scrolling remains native. Day/Night use pressed-state buttons and visible mode text. All buttons have at least 44px height. Front/Detail/Reset, zoom and 2D fallback remain HTML outside the renderer. Product options, selected swatch text/keyboard handling, quote draft and context-loss fallback are preserved.

Evidence: [Step 5 checks](evidence/step-5/README.md). Chrome touch emulation passed; physical phone, Safari/Android and actual background-tab lifecycle/hardware performance remain unverified.
