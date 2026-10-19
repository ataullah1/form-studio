# Form Studio

An independent furniture configurator concept by Md Ataullah. Steps 0–3 are implemented (physical-phone material review pending): responsive screen plan, Next.js application shell, typed catalog and a real parameterized 3D desk with bounded orbit/zoom/reset. The scene now supports three licensed wood finishes and black/white frames, with texture loading, neutral fallback and retry. The current visual identity is an architectural furniture atelier: mineral/espresso/terracotta surfaces, upright Bodoni Moda display headings and Manrope controls.

## Run locally

Use Node ^22.13.0, ^24.0.0 or >=26.0.0 and pnpm **11.21.0**. If pnpm is missing, install that exact version using your normal Node package-manager setup.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. The landing is prerendered HTML. Build your desk opens `/configure`; View desk in 3D then downloads the renderer. No credentials, database or .env file is needed for the current app. The production build fetches Bodoni Moda and Manrope through next/font/google and serves the optimized font files locally at runtime.

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

Chromium is launched with software-WebGL support for headless QA. This is not a mobile GPU benchmark. Tests cover deferred renderer loading, healthy/unavailable WebGL, module/renderer failures, slow download, context loss, navigation teardown, no-JavaScript HTML, four viewport widths, orbit/zoom/reset, orientation changes, idle resource release, all six finish/frame combinations, failure/retry, stale downloads and 30 material changes with bounded GPU textures. Reports/traces are ignored by Git.

## Vercel Web Analytics

`@vercel/analytics/next` is mounted once in the root layout for page views and Next.js route navigation. No custom events or quote-field values are sent by application code.

In the Vercel project dashboard, open **Analytics → Enable**, then deploy these changes. Visit the deployed site and check the Analytics dashboard. No application API key or new .env variable is required. The platform serves `/_vercel/insights/script.js`; a standalone local production server does not serve that endpoint. Browser product tests stub only that platform script so they do not send analytics data. Live collection must be verified after deployment.

Setup reference: [Vercel Web Analytics quickstart](https://vercel.com/docs/analytics/quickstart).

## Current behavior and limits

- `/`: English product landing, with an explicitly described static concept illustration. No Canvas is mounted here.
- `/configure`: live oak/walnut/ash and black/white selection, disabled future size/accessory controls, $399 illustrative estimate ($439 walnut), accessible selected-finish 2D dimensions and an optional interactive 3D desk.
- Renderer load/start errors, unavailable WebGL2, a 20-second startup timeout or context loss show a 2D schematic. Summary and editable quote draft fields stay outside the renderer boundary.
- Quote fields are a **local draft only**, with no form action, persistence or transmission. Submission is disabled until Step 8. Do not use real contact details for demo checks.
- Size/accessory state, full pricing validation/engine, localStorage, share persistence, quote backend and admin are future steps. No claims of manufacturing suitability or sales performance.

## Project structure

- `src/app`: server-rendered routes, root layout and styles.
- `src/features/scene`: client-only viewer, parameterized desk, pure dimensions/framing, bounded camera, lazy Canvas, error boundary and standalone 2D schematic.
- `src/features/configurator`: shared appearance state and accessible HTML options/live summary.
- `src/features/quotes`: HTML quote draft, isolated from WebGL.
- `src/lib/catalog`: versioned product facts and configuration types.
- `public/assets`: local concept illustration, UI grain studies and self-hosted CC0 wood maps; provenance in docs/ASSETS.md.
- `tests/e2e`: production-browser integration checks.
- `preview`: archived Step 0 HTML/CSS/SVG screen plan (superseded visual identity), viewable directly via `preview/index.html`.

## Planning and evidence

- [Full roadmap](docs/ROADMAP.md)
- [Active progress tracker](docs/PROGRESS.md)
- [Scope](docs/SCOPE.md), [catalog specification](docs/CATALOG.md), [archived screen baseline](docs/SCREEN-PLAN.md)
- [Dependency compatibility](docs/DEPENDENCIES.md)
- [Assets](docs/ASSETS.md), [decisions](docs/DECISIONS.md)
- [Scene geometry and camera guide](docs/SCENE.md)
- [Current visual identity screenshots and contrast evidence](docs/evidence/visual-identity/README.md)
- [Step 3 materials evidence](docs/evidence/step-3/README.md)
- [Step 0 evidence](docs/evidence/step-0/README.md), [Step 1 evidence](docs/evidence/step-1/README.md), [Step 2 evidence](docs/evidence/step-2/README.md)

Next: physical-phone review of the Step 3 material milestone, then **Step 4**, sizes and accessories. No push, deployment, external accounts, payments or database provisioning is performed by these local development steps.
