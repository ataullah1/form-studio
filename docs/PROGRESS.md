# Form Studio Progress Checklist

Save as docs/PROGRESS.md. Keep the full roadmap at docs/ROADMAP.md.

## Step status

- [x] Step 0 Scope and screen plan
- [x] Step 1 Repository and 3D integration
- [ ] Step 2 Desk geometry and camera
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

- Current step: Step 1 complete — repository and client-only 3D integration verified.
- Completed work: initialized independent local Git repository; pinned pnpm/dependencies/lockfile; implemented Next App Router/TypeScript/Tailwind shell, landing and configure routes, typed versioned catalog, lazy R3F test scene, loading/timeout/error/context-loss handling, accessible 2D schematic and editable HTML quote draft outside Canvas. Original Step 0 preview retained.
- Changed files: package.json, pnpm-lock.yaml, pnpm-workspace.yaml, Next/TypeScript/ESLint/PostCSS/Vitest/Playwright configs; src/app; src/features/scene, configurator and quotes; src/lib/catalog; public/assets; tests/e2e; README and planning/evidence documents.
- Checks and actual results: PASS — frozen-lockfile install, lint, typecheck, 3 Vitest tests, production build and all 12 Playwright browser tests. Repeated all quality checks and the browser suite from an isolated clean index export with no copied node_modules/.next. Tests confirm deferred renderer download, WebGL fallback, loading state, lazy-module and renderer failures, context-loss fallback, repeated navigation, no-JavaScript HTML, and no horizontal overflow at 360/390/768/1440 px.
- Device and browser tested: macOS, Node 26.7.0, pnpm 11.21.0, headless Google Chrome 155.0.8059.85 through Playwright with software WebGL. Mobile widths are emulated; no real-phone/Safari/Android check or hardware-GPU benchmark.
- Visual review: eight Step 1 screenshots saved; desktop/mobile test scene and mobile landing inspected. Evidence and installed dependency metadata are in docs/evidence/step-1/.
- Known limits: test cube/grid only; no finished desk or textures. Product choices remain visibly disabled until Step 4; quote fields are editable drafts with no submission/storage until Step 8. No backend/auth/deployment. ESLint 9 tooling compatibility limitation recorded in docs/DEPENDENCIES.md.
- Decisions: see docs/DECISIONS.md and docs/DEPENDENCIES.md. No push, deployment, purchase or production-data operation.
- Commit: Step 0/1 baseline is included in the local commit titled "feat: establish Form Studio app and client-only 3D integration"; use git log -1 for its hash.
- Next task: Step 2 only — replace integration fixture with parameterized metre-based desk geometry, beveled tabletop, separate frame/legs/crossbar, floor contact, bounded orbit/zoom/reset and responsive portrait/landscape framing. Defer wood textures/accessories/backend to their roadmap steps.

## Evidence rules

Only mark a step complete after its acceptance checks pass. Record untested real-device checks. Do not store credentials or quote contact details here. Keep third-party asset rights in docs/ASSETS.md.
