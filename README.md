# Form Studio

An independent furniture configurator concept by Md Ataullah. Steps 0–10 and Step 11 automated performance checks are implemented locally (latest deployment acceptance pending; user reports Google authentication configured) (physical-phone material review pending): responsive screen plan, Next.js application shell, typed catalog and a real parameterized 3D desk with bounded orbit/zoom/reset. The scene supports three licensed wood finishes, black/white frames, three desk sizes and fixed-position lamp/monitor stand/cable tray, with texture loading, neutral fallback and retry. Balanced/Low preview quality, day/night studio lighting, an optional night lamp, Front/Detail/Reset views and reduced-motion-aware camera transitions are available. Validated integer-cent estimates and a browser-local product draft now preserve designs across refresh. The current visual identity is an architectural furniture atelier: mineral/espresso/terracotta surfaces, upright Bodoni Moda display headings and Manrope controls.

## Run locally

Use Node ^22.13.0, ^24.0.0 or >=26.0.0 and pnpm **11.21.0**. If pnpm is missing, install that exact version using your normal Node package-manager setup.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. The landing is prerendered HTML. Build your desk opens `/configure`; View desk in 3D then downloads the renderer. No credentials/database are needed to build or use the local configurator. Save & share requires server-only database configuration; .env.example and docs/SHARING.md describe setup. The production build fetches Bodoni Moda and Manrope through next/font/google and serves the optimized font files locally at runtime.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

Or run `pnpm check` for the four quality checks. On a new checkout, `pnpm typecheck` works before a first build; Next generates additional route types during dev/build. Production start requires a successful build.

## Browser integration checks

```sh
pnpm exec playwright install chromium
pnpm build
pnpm test:e2e
```

Tests own a production server on **127.0.0.1:4173**; leave that port free. Alternatively use an installed Chrome executable:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm test:e2e
```

Chromium is launched with software-WebGL support for headless QA. This is not a mobile GPU benchmark. Tests cover deferred renderer loading, healthy/unavailable WebGL, module/renderer failures, slow download, context loss, navigation teardown, no-JavaScript HTML, four viewport widths, orbit/zoom/reset, orientation changes, idle resource release, all six finish/frame combinations, failure/retry, stale downloads 30 material changes with bounded GPU textures, and all 24 size/accessory combinations at desktop/mobile widths with configuration reset. Additional checks cover viewer-only lighting, finite camera transitions, offscreen render pause and emulated touch orbit/pinch/outside scrolling. Reports/traces are ignored by Git.

## Vercel Web Analytics

`@vercel/analytics/next` is mounted once in the root layout for page views and Next.js route navigation. No custom events or quote-field values are sent by application code.

In the Vercel project dashboard, open **Analytics → Enable**, then deploy these changes. Visit the deployed site and check the Analytics dashboard. No application API key or new .env variable is required. The platform serves `/_vercel/insights/script.js`; a standalone local production server does not serve that endpoint. Browser product tests stub only that platform script so they do not send analytics data. Live collection must be verified after deployment.

Setup reference: [Vercel Web Analytics quickstart](https://vercel.com/docs/analytics/quickstart).

## Current behavior and limits

- `/`: English product landing, with an explicitly described static concept illustration. No Canvas is mounted here.
- `/configure`: canonical typed configuration with three sizes, three finishes, two frames and three optional accessories; Reset configuration, itemized illustrative estimate, selected 2D dimensions and optional interactive 3D desk. Default estimate $399; accessories/size/walnut change the local estimate.
- Renderer load/start errors, unavailable WebGL2, a 20-second startup timeout or context loss show a 2D schematic. Summary and editable quote draft fields stay outside the renderer boundary.
- The labelled demo quote form sends contact fields only on explicit consent and submission. Requests are private, server-priced and idempotent; contact fields never enter localStorage or public shares. No email or order is created. Use fictional details for demo checks. See docs/QUOTES.md for cleanup and deployment requirements.
- Validated product configuration is saved in localStorage after a 350ms debounce, with refresh restore, immediate reset, invalid-draft discard and a usable storage-unavailable path. Quote fields, lighting and camera are excluded.
- Save & share now stores immutable server-priced PostgreSQL snapshots; `/s/[publicId]` offers read-only viewing and Edit a copy. Neon connectivity is configured and verified; see docs/SHARING.md. The private demo quote backend is implemented; the private Google-authenticated admin inbox supports filters, pagination and transactional status history; see docs/ADMIN.md. No claims of manufacturing suitability or sales performance.

## Project structure

- `src/app`: server-rendered routes, root layout and styles.
- `src/features/scene`: client-only viewer, parameterized desk, pure dimensions/framing, bounded camera, lazy Canvas, error boundary and standalone 2D schematic.
- `src/features/configurator`: typed canonical reducer, browser-local draft lifecycle, accessible controls and validated itemized live summary.
- `src/features/quotes`: HTML quote draft, isolated from WebGL.
- `src/lib/catalog`: versioned product facts/types plus pure strict validation and integer-cent pricing.
- `public/assets`: local concept illustration, UI grain studies and self-hosted CC0 wood maps; provenance in docs/ASSETS.md.
- `src/server`, `prisma`: server-only persistence, rate limiting, private-schema migration and runtime role grants.
- `tests/e2e`: production-browser integration checks; DB-sharing checks use a disposable local database.
- `preview`: archived Step 0 HTML/CSS/SVG screen plan (superseded visual identity), viewable directly via `preview/index.html`.

## Planning and evidence

- [Full roadmap](docs/ROADMAP.md)
- [Active progress tracker](docs/PROGRESS.md)
- [Scope](docs/SCOPE.md), [catalog specification](docs/CATALOG.md), [archived screen baseline](docs/SCREEN-PLAN.md)
- [Dependency compatibility](docs/DEPENDENCIES.md)
- [Assets](docs/ASSETS.md), [decisions](docs/DECISIONS.md)
- [Scene geometry and camera guide](docs/SCENE.md)
- [Current visual identity screenshots and contrast evidence](docs/evidence/visual-identity/README.md)
- [Pricing and local draft contract](docs/PRICING-AND-DRAFTS.md)
- [Sharing backend and Neon setup](docs/SHARING.md)
- [Performance measurements and device gate](docs/PERFORMANCE.md)
- [Step 11 evidence](docs/evidence/step-11/README.md)
- [Product story and SEO](docs/DISCOVERY.md)
- [Step 10 evidence](docs/evidence/step-10/README.md)
- [Private Google admin setup](docs/ADMIN.md)
- [Step 9 evidence](docs/evidence/step-9/README.md)
- [Demo quote workflow and deployment](docs/QUOTES.md)
- [Step 8 evidence](docs/evidence/step-8/README.md)
- [Step 7 evidence](docs/evidence/step-7/README.md)
- [Step 6 evidence](docs/evidence/step-6/README.md)
- [Step 5 interaction evidence](docs/evidence/step-5/README.md)
- [Step 4 configuration evidence](docs/evidence/step-4/README.md)
- [Step 3 materials evidence](docs/evidence/step-3/README.md)
- [Step 0 evidence](docs/evidence/step-0/README.md), [Step 1 evidence](docs/evidence/step-1/README.md), [Step 2 evidence](docs/evidence/step-2/README.md)

Next: physical-phone acceptance and **Step 12**, release/portfolio preparation. Step 11 automated checks pass; hardware FPS and Safari/Android acceptance remain pending. Deploy the latest changes to publish the landing, metadata and preview-quality controls. Physical-phone review of the Step 3 material milestone remains pending. No automatic commit, push or deployment is performed.
