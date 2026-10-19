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

## Functional baseline — Step 2

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

## Current session — Visual identity revision within Step 2

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
