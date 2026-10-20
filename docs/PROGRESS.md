# Form Studio Progress Checklist

Save as docs/PROGRESS.md. Keep the full roadmap at docs/ROADMAP.md.

## Step status

- [x] Step 0 Scope and screen plan
- [x] Step 1 Repository and 3D integration
- [x] Step 2 Desk geometry and camera
- [ ] Step 3 Materials and visual quality — implementation verified; physical-phone acceptance pending
- [x] Step 4 Sizes and accessories
- [x] Step 5 Lighting and interaction
- [x] Step 6 Pricing and local draft
- [ ] Step 7 Save and share backend
- [ ] Step 8 Quote request workflow
- [ ] Step 9 Restricted admin inbox
- [ ] Step 10 Product story and discovery
- [ ] Step 11 Tests and mobile performance
- [ ] Step 12 Release and portfolio

## Current session — Step 6 pricing and local draft (2026-10-20)

- Added pure versioned validateConfig/calculatePrice in lib/catalog: strict shape/ID/version/duplicate/injected-field rejection, canonical ordering, integer-cent itemization, product subtotal, surcharges, USD estimate and unavailable tax/shipping. Idempotent reducer accessory actions stay unique; external duplicate lists now reject rather than silently deduplicate.
- Golden prices verified: default $399; default walnut + all accessories $539; small desk + cable tray $369. UI itemization/totals use one validated price result. Lighting/camera remain independent. Server price/security verification is still future work.
- Added 350ms debounced product-only localStorage, valid refresh restore, immediate durable reset, pagehide/unmount flush, invalid/obsolete draft warning and explicit discard. Blocked access/quota failures preserve session usability. No contact fields, quote message, viewer state or price are persisted.
- Hydration resolves browser state before mounting interactive choices. Pending defaults are hidden inline before CSS arrives; noscript exposes default catalog/schematic for JS-disabled readers. Supplied shared snapshots win without local reads; unedited shared source does not overwrite local draft and product edits make a local copy. Actual shared route/API remain Step 7; future route must resolve snapshot before mounting.
- Final verification: PASS lint, typecheck, all 77 unit tests, production build and all 30 browser tests (1.1m). Tests cover 72 size/finish/accessory price subsets with frame invariance, malformed inputs, shared/local priority, refresh/reset, visible hydration selections, privacy, debounce coalescing/fast-refresh flush and blocked/quota modes, plus all prior scene/configuration checks.
- Review fixes: hide pending defaults inline as well as stylesheet rules, so early parser/layout observations never see the default price. Invalid-draft browser fixtures now navigate away before seeding another case, respecting the intentional outgoing-state flush. Final full suite passed after both fixes.
- Evidence: docs/evidence/step-6/README.md and viewport-review.json; restored/invalid states at 1440/390/360 px and unavailable-storage mobile screenshot. Inspected restored mobile itemization and desktop recovery; no overflow or recorded page errors. Headless installed Chrome on macOS; no physical phone or deployed-site check. Prior Step 3 real-phone acceptance remains pending.
- No package/asset dependency, commit, push, deployment or backend change. Suggested commit: feat: add validated pricing and persistent local drafts.
- Next: Step 7 save/share backend, when requested.

## Previous session — Step 5 lighting and interaction

- Implemented separate viewer-only day/night state, readable night studio and restrained warm lamp contribution only when selected at night. Product configuration/illustrative estimate remain unchanged by lighting or camera controls.
- Added Front and Detail alongside Reset/zoom, preserving one OrbitControls. Named views have a bounded 260ms direction/distance transition, immediate reduced-motion behavior, manual-input cancellation and immediate reframe on resize/product-bound change. Corrected tall-accessory reset position to obey the polar envelope explicitly.
- Added demand-render visibility gating (120px intersection margin + document visibility), paused controls, resume invalidation and product/lighting-only shadow-map refresh. No auto-rotation, perpetual animation, extra shadow map, package or external asset.
- Verified: lint/typecheck, all 61 unit tests and production build passed. Full browser run: 23 of 24 passed; the remaining new assertion mixed innerText and textContent. Corrected that test-only comparison; targeted interaction rerun: both passed (9.9s). All 24 unique browser checks passed across these final runs, including existing context loss, material failure/retry, 30 switches, configuration/camera and fallback tests. Final lint/typecheck rerun passed.
- New browser checks: unchanged summary and camera after day/night round trip; stopped draw calls after named-view transitions; offscreen lighting change performs no draws then resume works; lamp removal returns ambient night; emulated touch orbit/pinch releases controls, exterior touch scroll moves document, quote draft remains editable, reduced-motion views reset correctly.
- Visual evidence: day/night with selected lamp at 1440/768/390/360 px, night Front/Detail and night without lamp. Inspected mobile night and desktop no-lamp views: tabletop is readable. Viewport audit has no overflow/page errors and one canvas per case. See docs/evidence/step-5/README.md.
- Limits: installed macOS Chrome 155.0.8059.85 with software WebGL/touch emulation. No physical phone, Safari/Android, hardware performance or actual background-tab lifecycle validation. Step 3 physical-phone acceptance remains pending.
- No commit, push or deployment. Suggested commit: feat: add day-night lighting and accessible camera presets.
- Next functional step: Step 6 pricing validation and local draft, when requested.

## Previous session — Step 4 sizes and accessories

- Implemented typed canonical ProductConfiguration reducer with explicit invalid-ID/version/extra-field rejection and known-accessory deduplication/order. Scene, controls, 2D dimensions and itemized illustrative estimate consume the same state. No persistence/share payload transmission introduced.
- Enabled 120×60, 140×70 and 160×80 cm selection. Existing metre-based slab/frame functions now drive the rendered desk; no whole-model scale. Added fixed-anchor original lamp, monitor stand and underside cable tray. Their dimensions stay fixed while edge-derived anchors move with size.
- Added Reset configuration: default 140×70 oak/black, no accessories. Desk/accessory quantity is fixed at one. Quote draft stays separate. Camera fits selected accessory height and preserves its position on finish/frame-only changes.
- Verification: lint, typecheck, 58 unit tests and production build passed. Full production-browser suite: 22 passed (50.1s). Strengthened reset-image comparison and shared pixel helper subsequently verified in a targeted six-test configuration/camera run. Tests cover all 24 size/accessory subsets at desktop/mobile widths, rapid changes, reset, invalid inputs, independent accessory dimensions, frame clearance and fitted accessory corners. Existing material/fallback/lazy-loading tests passed.
- Visual review: all accessories enabled at each size at 1440/768/390/360 px; no horizontal overflow or page errors in viewport audit. Reviewed smallest desktop composition and largest mobile composition; lamp and stand fit without overlap, with fixed proportions. Tray lives below the rear tabletop and can be occluded in the default view. Evidence: docs/evidence/step-4/README.md.
- Device limits: macOS installed Chrome 155.0.8059.85, headless software WebGL and emulated viewports. No physical phone/Safari/Android or hardware performance test; prior Step 3 physical-phone acceptance remains pending. User requested continuing to Step 4; no backend work performed.
- No new third-party assets/dependencies. No commit, push or deployment. Suggested commit: feat: add desk sizes and fixed-anchor accessories.
- Next functional step: Step 5 — lighting presets and camera interaction, when requested.

## Previous session — Step 3 implementation

- Implemented three separate licensed oak/walnut/ash map sets, black/white frame selection and shared finish/frame state. Summary updates immediately, including the catalog walnut surcharge; selected labels also work in the 2D view. Sizes/accessories, save/share and quote submission remain disabled.
- Added correctly annotated sRGB colour/data maps, metre-based grain scale, low normal strength, matte finish presets and a finite reduced-motion-aware material reveal. Screenshot review corrected overly pale walnut with a documented finish coat over its distinct source map.
- Added per-viewer bounded texture ownership, partial failure cleanup, fetch timeout/abort, stale-selection protection, ImageBitmap closure and disposal on unmount. Loading retains the last successful surface; failures show neutral material with retry and preserved selection.
- Assets: three CC0 Poly Haven veneer sets by Jenelle van Heerden, nine self-hosted 1k WebP maps, approximately 4.1 MiB. Exact source URLs, hashes, transformations and license references are in ASSETS.md and evidence/step-3/texture-sources.json.
- Verification: PASS lint, typecheck, all 28 unit tests, production build and all 20 production-browser tests. Browser tests include six combinations, keyboard selection, neutral fallback/retry, slow stale downloads and 30 switches with stable WebGL texture creation/live counts after warmup and no additional successful-map downloads. Existing camera, idle, context-loss and navigation tests passed.
- Visual review: saved all three finishes at 1440/768/390/360 px, black frames for oak/walnut and white for ash, plus close detail and material failure. Chrome 155.0.8059.85 on macOS using headless software WebGL. No overflow or page errors in the recorded viewport audit. Emulation is not a physical-phone test.
- Acceptance status: local implementation and desktop/emulated-mobile review complete. Physical phone, Safari/Android and hardware GPU checks unavailable and unverified. Leave Step 3's strict desktop-and-real-phone checkbox and first visual milestone pending until device review; no backend work begun.
- Evidence: docs/evidence/step-3/README.md. No commit, push or deployment. Suggested commit: feat: add licensed wood finishes and frame colour selection.
- Next: physical-phone visual/touch review, then Step 4 sizes/accessories when requested.

## Historical functional baseline — Step 2

- Current step: Step 2 complete — parameterized desk geometry and responsive camera.
- Completed work: replaced cube/grid with a 140×70 cm default desk, 74 cm surface height, 3 cm beveled rounded tabletop, independent metal legs/rails/rear crossbar/feet, floor and contact shadow. Pure geometry functions support all three catalog footprints. Added bounded orbit/zoom, keyboard-operable zoom/reset buttons and container-aware reset/reframing after orientation changes. Preserved lazy loading and every Step 1 fallback/draft boundary.
- Changed files: src/features/scene/{desk-dimensions,tabletop-shape,desk-model,camera-framing,desk-camera,desk-geometry.test}; scene-canvas/scene-viewer; app labels/styles; foundation browser checks and new desk-camera checks; README, SCENE/ASSETS/DECISIONS and Step 2 evidence. Next regenerated next-env.d.ts production type paths during build.
- Checks and actual results: PASS — lint, typecheck, 24 unit tests and production build. Full production browser pass: 15 tests passed; an additional idle/context-release test passed, bringing unique browser checks to 16. Strengthened orbit/zoom/orientation test passed in a targeted rerun. No product-code changes followed the production build. See docs/evidence/step-2/README.md for exact runs and screenshot artifacts.
- Device and browser tested: macOS, Node 26.7.0, pnpm 11.21.0, Chrome 155.0.8059.85 through Playwright with software WebGL. Screenshots at 1440×900, 768×900, 390×844, 360×800 and 844×390. These are emulated viewports; real-phone/Safari/Android and hardware-GPU tests remain unperformed.
- Visual review: desktop, mobile portrait and landscape desk images inspected; the default desk fits, corners/bevels are visible and feet meet the shadowed floor. Neutral materials only; no wood-quality milestone claimed.
- Known limits: wood finishes/frame selectors belong to Step 3; interactive sizes/accessories to Step 4. All sizes have geometry/math tests, but only the default footprint is publicly rendered. Close zoom intentionally allows cropped inspection; Reset returns a full fit. Quote fields remain unsaved drafts; no backend/admin/deployment. Short idle/context checks do not prove long-duration memory or phone performance.
- Decisions: see docs/SCENE.md and docs/DECISIONS.md; existing dependency versions retained.
- Commit: local commit titled "feat: add parameterized desk geometry and responsive camera"; use git log -1 for its hash. No push or deployment.
- Next task: Step 3 only — select/document licensed self-hosted oak, walnut and ash texture maps, add two frame colour presets, handle colour space/resource ownership/loading failures and review materials on desktop/phone where available.

## Additional session — Vercel Analytics

- User reports deployment at https://formstudioo.vercel.app/ and requests Web Analytics integration.
- Added exact @vercel/analytics 2.0.1 and mounted its Next.js Analytics component once in src/app/layout.tsx. Package/lockfile updated; no custom events or quote-field payloads added.
- Browser product tests now share a fixture that stubs only Vercel's platform-owned analytics script. A local Next server does not serve that endpoint; the stub prevents local telemetry/network errors without changing application code.
- Verified: lint, typecheck, all 24 unit tests, production build and all 16 production-browser tests passed. A local smoke check with the platform script stubbed observed one Analytics script request/element and queued pageviews for / and /configure after client navigation.
- Remaining: user enables Analytics in the Vercel dashboard if needed, commits/pushes these changes and verifies data after the resulting deployment. Live collection/dashboard state has not been verified.
- Working agreement: no automatic commit/push/deploy. Suggested commit message: feat: add Vercel Web Analytics.
- Roadmap status remains Step 2 complete; Step 3 is still next.

## Previous session — Visual identity revision within Step 2

- Visual direction: architectural furniture atelier. Replaced the former green/italic UI with mineral #F4EDE3, espresso #2B211C, terracotta #A3442D and chalk #FFFBF5 semantic tokens. Upright Bodoni Moda and Manrope are loaded through next/font; verified OFL notices are in public/licenses.
- Visual changes: shared typographic Form Studio/01 header/footer, requested hero headline/copy/CTA, asymmetric static product poster with technical dimension annotations, square UI-only material studies on espresso, specification-led details, precise HTML configurator panel/estimate and warm scene stage. Removed the full-width development banner in favor of the requested compact capability note. Preserved disabled future controls and unsaved quote-draft disclosures.
- Changed files: app pages/layout/global styles/icon; shared site-chrome component; presentational panel/quote/viewer/schematic code; stage colours/shadow receiver; original SVG material-study assets and font license notices; copy-sensitive existing browser selectors; roadmap Visual Direction and related scope/asset/decision docs.
- Preserved: routes, stack/dependency versions, catalog, dimensions, geometry functions/model, camera framing/commands, lazy renderer, all loading/error/fallback paths, native disabled states, Analytics and existing product behavior. No Step 3–12 features added. Step 10 remains unchecked.
- Verification: final lint, typecheck, all 24 unit tests, production build and all 16 browser tests passed. Final screenshots and per-route audits at 360/390/768/1440 px show no horizontal overflow, no page errors, zero landing Canvas and one active configurator Canvas. Checked keyboard focus, keyboard fallback activation, disabled controls, editable draft fields and reduced motion. Text contrast pairs pass 4.5:1; enabled control boundaries pass 3:1. See docs/evidence/visual-identity/README.md, browser-review.json and contrast.json.
- Review fixes: restored material heading line breaks and zero-minimum grid sizing to fix mobile overflow; removed sticky scene placement after the landscape camera check exposed a short-viewport composition problem. Regenerated screenshots and reran the complete browser suite after fixes.
- Limits: headless desktop Chrome with emulated viewport widths/software WebGL; no physical phone, Safari/Android, hardware performance, deployed-site or live analytics verification. Material studies are illustrations only, not actual 3D finish support.
- Working agreement: no commit, push, deployment, migration or production data action. Suggested message: feat: redesign Form Studio with an architectural atelier identity.
- Next incomplete functional step: Step 3 — licensed self-hosted materials and visual quality. This revision does not change functional step completion.

## Evidence rules

Only mark a step complete after its acceptance checks pass. Record untested real-device checks. Do not store credentials or quote contact details here. Keep third-party asset rights in docs/ASSETS.md.
