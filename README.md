# Form Studio

An independent furniture configurator concept by Md Ataullah. Steps 0 and 1 are implemented: responsive screen plan, Next.js application shell, typed catalog and an on-demand client-only 3D integration test. The test cube is intentionally labelled; the finished desk belongs to Steps 2–3.

## Run locally

Use Node ^22.13.0, ^24.0.0 or >=26.0.0 and pnpm **11.21.0**. If pnpm is missing, install that exact version using your normal Node package-manager setup.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. The landing is prerendered HTML. Build your desk opens `/configure`; Load 3D test scene then downloads the renderer. No credentials, database or .env file is needed in Step 1.

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

Chromium is launched with software-WebGL support for headless QA. This is not a mobile GPU benchmark. Tests cover deferred renderer loading, healthy WebGL, unavailable WebGL, failed scene download, slow download, context loss, navigation teardown, no-JavaScript HTML and four viewport widths. Reports/traces are ignored by Git.

## Current behavior and limits

- `/`: English product landing, with an explicitly described static concept illustration. No Canvas is mounted here.
- `/configure`: catalog-backed default facts, disabled planned product selectors, $399 illustrative default estimate, accessible 2D dimensions and an optional 3D test object.
- Renderer load/start errors, unavailable WebGL2, a 20-second startup timeout or context loss show a 2D schematic. Summary and editable quote draft fields stay outside the renderer boundary.
- Quote fields are a **local draft only**, with no form action, persistence or transmission. Submission is disabled until Step 8. Do not use real contact details for demo checks.
- Finish/size/accessory state, real desk geometry, pricing validation/engine, localStorage, share persistence, quote backend and admin are future steps. No claims of manufacturing suitability or sales performance.

## Project structure

- `src/app`: server-rendered routes, root layout and styles.
- `src/features/scene`: client-only viewer, lazy Canvas, error boundary and standalone 2D schematic.
- `src/features/configurator`: HTML option/summary shell.
- `src/features/quotes`: HTML quote draft, isolated from WebGL.
- `src/lib/catalog`: versioned product facts and configuration types.
- `public/assets`: local concept illustration; licensed runtime textures have not been selected.
- `tests/e2e`: production-browser integration checks.
- `preview`: preserved Step 0 HTML/CSS/SVG screen plan, viewable directly via `preview/index.html`.

## Planning and evidence

- [Full roadmap](docs/ROADMAP.md)
- [Active progress tracker](docs/PROGRESS.md)
- [Scope](docs/SCOPE.md), [catalog specification](docs/CATALOG.md), [screen baseline](docs/SCREEN-PLAN.md)
- [Dependency compatibility](docs/DEPENDENCIES.md)
- [Assets](docs/ASSETS.md), [decisions](docs/DECISIONS.md)
- [Step 0 evidence](docs/evidence/step-0/README.md), [Step 1 evidence](docs/evidence/step-1/README.md)

Next: **Step 2 only**, parameterized desk geometry and responsive camera. No push, deployment, external accounts, payments or database provisioning has been performed.
