# Step 1 verification evidence

Date: 2026-10-19. Local environment: macOS, Node 26.7.0, pnpm 11.21.0, installed Chrome 155.0.8059.85. Browser tests use Playwright against a production Next server, with headless software-WebGL support.

## Quality checks

- Frozen-lockfile installation: passed with strict peer-dependency checks.
- ESLint: passed without lint errors/warnings.
- TypeScript: passed.
- Vitest: 3 catalog invariant checks passed.
- Production build: passed; `/`, `/configure`, `/icon.svg` and framework not-found page prerender successfully.
- Production browser suite: final clean-checkout run passed all **12 tests** in 19.6 seconds, including renderer construction failure after a successful capability probe. The runner state is saved in browser-run.json.

The initial browser run detected horizontal overflow from a hidden quote-fieldset legend inheriting global legend width. Product-legend styles were scoped to the panel; all four viewport tests subsequently passed. This was fixed without hiding document overflow.

## Browser coverage

Healthy renderer, deferred Three loading, missing WebGL, failed lazy scene download, slow scene download/loading state, context loss, repeated navigation teardown, 360/390/768/1440 px layouts, and no-JavaScript product/quote-draft HTML. A final targeted test also exercises renderer construction failure after a successful capability probe.

Normal browser flows have no observed page or console errors, including hydration errors. Deliberately broken chunk/renderer/context-loss cases may emit expected browser/Three error diagnostics; their assertions verify a contained fallback and intact HTML/draft fields instead of hiding those diagnostics globally.

The lazy-loading test inspects downloaded JS responses for Three's renderer marker: absent on landing and initial configurator, present after explicit Load 3D test scene. It also verifies one Canvas and a nonzero drawing buffer; screenshots verify visible test geometry. This is a loading-isolation check, not a full bundle-size benchmark.

## Screenshot artifacts

For 390 and 1440 px, each of these is saved:
- `landing-<width>.png`: server-rendered landing composition.
- `configurator-2d-<width>.png`: initial schematic and HTML shell.
- `configurator-3d-<width>.png`: visible integration test cube/grid.
- `configurator-fallback-<width>.png`: explicit 2D fallback.

`screenshots.json` records viewport/document width, one Canvas with its bounds, browser version and observed page errors. Mobile/desktop 3D and mobile landing screenshots were visually inspected. `dependency-versions.json` captures the installed official package metadata used to check compatibility.

## Limits

No physical phone, Safari, Android, hardware-GPU performance measurement, real desk geometry/material review, database or production deployment is verified by this step. Quote fields are editable HTML drafts only; submission and storage remain disabled. Screenshots show the labelled test object and are not final furniture imagery.

## Clean-checkout verification

Exported all staged repository files through git checkout-index into a new empty temporary directory. No node_modules or .next outputs were copied. Ran `pnpm install --frozen-lockfile` and `pnpm check`: install, lint, typecheck, all three unit tests and the production build passed. Then ran the 12-test Playwright suite against that directory's own production build/server using the installed Chrome executable; all passed. This used the local pnpm package cache and does not claim an uncached/offline cross-platform install. Final evidence/progress updates after this export only change documentation; application/configuration/test inputs match the verified source.
