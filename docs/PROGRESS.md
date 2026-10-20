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
- [x] Step 7 Save and share backend — local and Neon connection verified
- [x] Step 8 Quote request workflow — verified locally; deployment/cron activation pending
- [x] Step 9 Restricted admin inbox — local verification complete; real Google login/deployment acceptance pending
- [x] Step 10 Product story and discovery — local acceptance verified; deployment pending
- [ ] Step 11 Tests and mobile performance
- [ ] Step 12 Release and portfolio

## Current session — Step 10 product story and discovery (2026-10-20)

- User reports authentication is configured. Added customization preview, workflow, native concept FAQ and final configurator/demo-enquiry entry. Updated outdated planned-option copy to reflect implemented sizes/finishes/frame/accessories; displayed option prices derive from the catalog. Existing SVG poster/material studies retained.
- Added canonical production metadata, Open Graph/Twitter card, public-only sitemap and robots route. Shared/admin noindex retained. A single code-rendered 1200 × 630 social preview uses existing colours; no AI imagery, screenshots, extra Canvas, dependency or new analytics events.
- Restrained poster/material motion respects reduced motion; normal scroll and server-rendered content remain available without JavaScript. Quote entry does not start the renderer.
- Verified lint/typecheck, 110 unit tests, production build and 17 unique affected browser checks across foundation/discovery runs. No overflow at 1440/768/390/360 px. Details: docs/evidence/step-10/README.md; metadata contract: docs/DISCOVERY.md.
- No database/account changes, commit, push or deployment. Live indexing/social-platform acceptance and prior physical-phone review remain unverified. Next: Step 11 tests and mobile performance.

## Previous session — Step 9 restricted admin inbox (2026-10-20)

- User selected Google login. Added server OIDC authorization-code flow with PKCE/state/nonce, cryptographic ID-token validation using jose 6.2.12 and immutable Google-sub allowlist. Opaque hashed database sessions expire after eight hours; logout revokes them.
- Added private login, twenty-record paginated/status-filtered inbox, original saved quote details and transactional actor/status history. Each query/mutation checks session and allowlist; same-origin mutations and optimistic versions reject forged/stale/replayed changes. Focus refresh handles stale tabs.
- Added a separate restricted admin database role, auth tables and RLS that hides expired contacts immediately. Public runtime contact/session/history access remains denied. Private pages use no-store/noindex/same-origin referrer policy/denied framing; admin Analytics is suppressed.
- Verification: 110 unit tests, 24 database/browser checks, production build and final lint/typecheck passed. Neon migration and restricted admin role connectivity/ACL inspection passed; credential stored privately in ignored .env. See docs/evidence/step-9/README.md. No screenshots or generated images; fixtures use fictional local contacts only. Google account authorization cannot be verified until the owner supplies OAuth credentials.
- Setup: docs/ADMIN.md. No commit, push or deployment. Next functional step: Step 10 product story/discovery, after configuring live Google login.

## Previous session — Step 8 demo quote workflow (2026-10-20)

- Added consent-based demo requests tied to the canonical configuration, server-authoritative prices, opaque receipts, transactional private persistence, HMAC idempotency, concurrent retry handling and explicit current-price confirmation for shared designs.
- Contact data is isolated in an insert-only runtime table, excluded from public shares, browser storage and application telemetry. Failure preserves fields; success clears them only after server confirmation. No email, order or public quote lookup.
- Added strict bounded validation, honeypot, database-backed request limits, five-day contact expiry and authenticated daily cleanup with a seven-day removal target. Quote persistence fails closed without cleanup configuration and on Vercel preview deployments.
- Verified lint/typecheck, 98 unit tests and production build. Full browser run passed 44 checks; two further quote cases were added and all 16 sharing/quote checks passed. See docs/evidence/step-8/README.md for final run and migration status.
- Applied the Step 8 migration to Neon and verified runtime contact SELECT/DELETE are denied while INSERT and cleanup EXECUTE are granted. No test contact data was written remotely.
- Generated CRON_SECRET only in ignored local .env. Vercel Production must receive that value and deploy vercel.json to activate the daily schedule. No deployment or production contact submissions performed.
- Next: Step 9 restricted admin inbox using provider-independent authentication; Supabase is no longer a requirement. No commit/push.

## Provider update — Neon selected

- User explicitly chose Neon instead of Supabase. Updated .env.example, current README/setup guide and Step 7 roadmap provider. Existing Prisma/PostgreSQL persistence, private schema, SQL-created runtime role, immutable snapshots and shared database rate limits remain unchanged.
- Runtime uses the Neon pooled -pooler endpoint with plain form_studio_runtime username; migrations use a direct owner endpoint. No Supabase SDK/API key dependency exists. Historical Step 7 references below describe the original provider plan, not current setup requirements.
- Checked Neon's official connection/role documentation: use the SQL-created restricted role, not Console-created elevated runtime roles. Neon owner migration and restricted runtime connectivity were subsequently configured and verified. User reports Vercel environment setup complete; deployed behavior has not been independently verified.
- No commit/push. Suggested commit: chore: configure Neon PostgreSQL deployment setup.

## Current session — Step 7 immutable save/share backend (2026-10-20)

- Added Prisma/PostgreSQL schema/migration, server-only connection adapter, ignored generated client and .env.example placeholders. Stable Prisma/client/adapter 7.10.1, pg/types 8.23.1, dotenv 18.0.8 and server-only 0.0.1 pinned; ORM build scripts explicitly allowed. No framework/scene dependency upgrades.
- Implemented bounded POST /api/configurations with strict catalog/schema validation, server-estimated integer cents, opaque 192-bit public IDs, persisted idempotency fingerprint/UUID and advisory-lock retry serialization. Same-key different payload returns 409; malformed/oversize/foreign-origin/rate-limit/unavailable states have explicit failures, never fake success.
- Added allowlisted public GET and /s/[publicId] read-only page with saved/current estimate and Edit a copy. Server resolves snapshots before mounting the editor, so local draft never overrides a share. Edits create local copies; originals stay immutable. Unknown/unsupported/removed catalog states are explicit. Published v1 is retained; no invented legacy catalog support claimed.
- Restricted private app schema with RLS/grants, narrow NOLOGIN runtime role and immutable DML trigger. Existing anon/authenticated/PUBLIC access (including public Prisma migration metadata) revoked. Database-clock atomic per-client/global rate buckets shared across instances; HMAC identity, trusted Vercel ingress only, conservative non-Vercel fallback. No quote fields or admin data in public responses/rows.
- Added honest Save & share UI with stable retry key, selectable/copyable link and current-selection result association. Unconfigured backend returns 503 and preserves selection; no link appears. Quote submission remains disabled.
- Verification: lint/typecheck, 79 unit tests and production build passed. Full local Postgres production-browser suite: 37 passed (1.2m). Fresh disposable-cluster test harness rebuilt and passed all seven database-sharing tests after final shared-page copy/metadata hardening. It applies the migration under an owner, runs app using restricted runtime, then stops/removes its own cluster. See docs/evidence/step-7/README.md.
- Tests verify independent browser restoration, shared/local precedence, unique row from six concurrent retries, conflicting payload, immutable row rejection, malformed/oversize/contact/price payload rejection, client/global limits under concurrency, spoofed local headers, unknown/obsolete catalogs, grants and committed-but-unconfirmed save retry. No production DB was touched.
- Visual evidence: shared/edit copy at 1440/390/360 px; inspected mobile shared layout. No overflow/page errors in recorded audit. Separate no-environment app returns explicit 503, preserves walnut selection and shows no success link. Physical phone/cloud Supabase API/pooler/TLS/Vercel ingress remain unverified; prior Step 3 device acceptance stays pending.
- Supabase project/credentials were not supplied. Live account provisioning, owner migration and Vercel env/deployment were not performed. Concrete instructions: docs/SHARING.md and .env.example. No commit/push; suggested commit: feat: add immutable PostgreSQL save and share workflow.
- Next: configure live backend using SHARING.md, then Step 8 demo quote workflow when requested.

## Previous session — Step 6 pricing and local draft (2026-10-20)

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
