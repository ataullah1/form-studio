# Form Studio Progress Checklist

Save as docs/PROGRESS.md. Keep the full roadmap at docs/ROADMAP.md.

## Step status

- [x] Step 0 Scope and screen plan
- [x] Step 1 Repository and 3D integration
- [x] Step 2 Desk geometry and camera
- [ ] Step 3 Materials and visual quality
- [ ] Step 4 Sizes and accessories
- [ ] Step 5 Lighting and interaction
- [ ] Step 6 Pricing and local draft
- [ ] Step 7 Save and share backend
- [ ] Step 8 Quote request workflow
- [ ] Step 9 Restricted admin inbox
- [ ] Step 10 Product story and discovery
- [ ] Step 11 Tests and mobile performance
- [ ] Step 12 Release and portfolio

## Current session

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

## Evidence rules

Only mark a step complete after its acceptance checks pass. Record untested real-device checks. Do not store credentials or quote contact details here. Keep third-party asset rights in docs/ASSETS.md.
