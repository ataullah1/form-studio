# Decisions

## 2026-10-19 — Step 0
- Keep the supplied full roadmap at docs/ROADMAP.md and the active checklist at docs/PROGRESS.md; retain the original source documents.
- Use a dependency-free HTML/CSS screen plan in preview/ so layout work does not prematurely pick framework versions or implement Step 1. Later translate the accepted design into Next.js components.
- Preview uses one responsive document for landing and desktop/mobile configurator compositions. Mobile uses a stacked panel before considering a sheet/tab interaction.
- Use an original SVG composition and CSS swatches as visibly labelled placeholders. They are not finished 3D/material assets. No AI-generated or third-party imagery is needed for Step 0.
- Keep unavailable product actions disabled and state their planned status; do not simulate saved configurations or successful quote requests.
- Adopt the IDs and schema/catalog versions in CATALOG.md as the initial specification. Roadmap remains authoritative for product scope.
- Do not push, deploy, buy services or create external accounts during this local planning step.

## Details to settle in later steps
- Step 1: verify stable compatible Next.js/React/Three/Fiber/Drei releases using official documentation, pin pnpm and lockfile. No package compatibility claim is made in Step 0.
- Step 7: persist configuration-save idempotency keys plus payload fingerprint; define retry and conflict behavior. The roadmap's minimal database list does not explicitly list these fields.
- Step 8/12: specify the scheduled seven-day quote-contact purge, status-event retention and cleanup authorization; no personal information in public snapshots.
- Step 3/11: owner visual review and physical mobile testing; record devices and evidence rather than assuming headless rendering proves mobile GPU performance.

## Step 0 finalization
- Completed a local installed-Chrome browser review through temporary Playwright tooling without introducing project dependencies. Saved the final four-width screenshots and measurements in docs/evidence/step-0/.
- Final screen baseline is docs/SCREEN-PLAN.md. The user's request to finish Step 0 authorizes finalizing this deliverable; it is not recorded as personal approval of screenshots.
- Keep Git initialization in Step 1 as planned; no standalone initialization/commit is performed in this static planning step.

## Step 1 — Next.js foundation and client-only scene

- Initialized an independent local Git repository on main, keeping the original roadmap and Step 0 preview intact. No remote, push or deployment.
- Added a Next App Router/TypeScript/Tailwind application with exact dependency pins and a pnpm lockfile. See DEPENDENCIES.md for checked versions, official references and the documented ESLint 9 peer-compatibility limitation.
- Landing is a prerendered Server Component; `/configure` isolates the viewer. Only SceneViewer is a client entry; next/dynamic with ssr:false loads the R3F/Drei/Three module after explicit user request. No renderer code is imported by landing components.
- Kept the integration fixture a clearly labelled cube/grid. Do not confuse it with the Step 2 desk or Step 3 material-quality milestone.
- Viewer loading/module errors and renderer exceptions are scoped by a React boundary. WebGL2 capability failure, startup timeout and context loss use an accessible 2D dimension schematic. R3F owns scene/renderer disposal; native context-loss listeners and startup timers have teardown paths.
- Kept catalog-backed HTML controls, summary and quote draft outside the scene boundary. Product selectors are disabled until Step 4. Quote fields can be typed into but have no form action/storage/submission until Step 8. No mock success is shown.
- Added focused catalog invariant checks and production-browser integration checks. Browser evidence is viewport emulation on desktop Chrome with software rendering; no real-device/GPU-performance claim.
- Fixed Tailwind integration overflow by scoping product legend styles rather than suppressing body overflow.

## Step 2 — Physical desk and responsive camera

- Use a pure metre-based dimension function across all three catalog sizes, with a separate extruded tabletop, 13 frame/foot components and no whole-group scale. Rounded corners are 35 mm, edge bevel 4 mm; compensate for bevel expansion to preserve published size/thickness. See SCENE.md.
- Use neutral matte tabletop/charcoal frame materials and simple fixed lighting/shadow floor. Wood presets, texture ownership and finish UI remain Step 3; accessories/state remain Step 4.
- Fit a conservative product bounding sphere to the narrower perspective field of view, with a 12% distance margin. Resize reframes automatically. Disable pan, damping and auto-rotate; bound vertical orbit/zoom so the closest/lowest legal camera stays above the tabletop. Reset/zoom buttons are outside Canvas.
- Keep camera-command revisions separate from product configuration; do not reapply an old zoom command on resize.
- Retain explicit lazy loading and every Step 1 fallback/draft boundary. Update UI labels from integration fixture to geometry preview.
- Verify actual extrusion bounds, physical joints, projected camera corners, rendered reset/zoom behavior, viewport/orientation behavior and a short idle/context-release sample. Real-phone checks remain unperformed and are recorded honestly.

## Vercel Analytics integration

- User reports hosting at https://formstudioo.vercel.app/. Added exact @vercel/analytics 2.0.1, whose Next >=13 and React ^18/^19 peers cover the installed stack. Mounted its Next.js Analytics component once in the server root layout using the official integration.
- Page views/route navigation only; no custom events or quote form values added. Dashboard enablement and live collection require a subsequent user deployment and verification.
- Local browser product tests stub only the Vercel-owned analytics script; a standalone Next server cannot supply that endpoint. This does not verify live collection.
- User working agreement: do not create commits or push automatically. Provide a suggested commit message after completing changes; the user commits/pushes/deploys.

## Visual identity revision — architectural furniture atelier

- User requests a distinct Form Studio identity rather than Review Room's off-white/green/italic editorial style. This is an art-direction change within completed Steps 0–2, not a product restart or implementation of Steps 3–12.
- Adopt semantic mineral (#F4EDE3), espresso (#2B211C), burnt terracotta (#A3442D) and chalk (#FFFBF5) tokens. Use separately checked muted, disabled, border and on-dark accent colours. Replace conflicting CSS coherently rather than layering the old green identity.
- Use upright Bodoni Moda and Manrope through next/font/google, served locally by Next after build. Add their verified OFL license notices to public/licenses and asset metadata to ASSETS.md. No package upgrades or new UI framework.
- Present landing typography/product poster asymmetrically, material studies on espresso, specification-led details and a typographic footer. Reuse the existing static desk illustration; no landing Canvas. New original SVG grain studies are UI-only illustrations, not runtime material maps or evidence of completed finish switching.
- Apply the same system to /configure, its existing HTML options/estimate, quote draft, error/loading and 2D schematic. The compact viewer capability note replaces the development banner. Preserve native disabled states and explicit future-feature disclosures. Shared header/footer components contain presentation only.
- Geometry, catalog, camera calculations/commands and route architecture stay unchanged. Stage background and floor shadow colours read the semantic palette; the existing floor becomes a shadow receiver over the warm backdrop. Product materials are not turned into selectable presets.
- Keep viewer/controls in document flow. An attempted sticky viewer was removed after landscape screenshot validation showed clipped compositions in short viewports. Fix mobile material overflow with real line breaks and zero-minimum grid tracks, not hidden page overflow.
- Original Step 0 preview/screenshots are historical artifacts; the current art direction supersedes them. Step 10 remains incomplete and owns final product-story expansion.
- Preserve Vercel Analytics and the user's no-commit/no-push/no-deploy workflow.

## Step 3 — real material presets

- Retain the existing identity/geometry/camera and package versions. Enable only three finish radios and two frame buttons, with one shared appearance state; sizes/accessories remain Step 4.
- Use three distinct self-hosted Poly Haven CC0 1k veneer sets; preserve source/data colour handling and documented one-metre grain scale. Multiply the sources with concept finish coats after screenshot review showed the uncoated walnut reading too pale. No manufacturer colour-match claim.
- Own a bounded per-viewer texture library with explicit fetch timeouts, stale-result guards, partial failure cleanup, bitmap closure and unmount disposal. No global loader-cache mutation. Preserve last successful wood during loading; neutral material and explicit retry on failure.
- Use a finite reduced-motion-aware material reveal and keep demand rendering. Full lighting/interaction expansion remains Step 5.
- Verify six combinations, failure/retry, stale downloads, teardown and thirty switches. Report physical-phone and hardware-GPU checks as pending; do not mark the first desktop-and-phone milestone accepted from emulation alone.
- No commit, push or deployment; provide the user a commit message.

## Step 4 — canonical configuration and fixed accessories

- Replace the small appearance state with a typed reducer over ProductConfiguration. Pass the canonical state to controls, scene, itemized display estimate and 2D dimensions; reject invalid IDs/versions/extra fields and normalize known accessory order/duplicates. No share transport or local draft persistence yet.
- Enable three catalog sizes; reuse metre-based desk geometry/rails/leg placement. Add original code-modeled lamp, stand and tray at edge-derived fixed anchors with independent dimensions and frame-matching surfaces. No drag placement or lamp lighting (Step 5).
- Include selected accessory height in camera bounds; preserve camera through finish/frame changes. Reset configuration restores default product state and leaves quote draft separate.
- Verify all three sizes × eight accessory subsets with physical bounds/camera tests and desktop/mobile browser integration. Record viewport emulation honestly; prior real-phone material acceptance remains pending. User explicitly requested proceeding to the next step.
- Preserve user workflow: no automatic commit, push or deployment; provide a commit message.
