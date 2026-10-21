# Testing

## Static checks and unit tests

```sh
pnpm check
```

This runs ESLint, TypeScript, Vitest and the production build. Unit tests cover configuration validation, pricing, geometry, camera bounds, local drafts/history, Google token rules and safe authentication returns.

## Browser and database integration

Install PostgreSQL command-line tools (`initdb`, `pg_ctl`, `createdb`, `psql`) on PATH and install Chromium:

```sh
pnpm exec playwright install chromium
pnpm test:sharing --all
```

The harness creates a temporary localhost-only cluster, applies migrations, sets distinct restricted web roles, builds the app and runs Playwright against `127.0.0.1:4173`. It removes the cluster afterward. It overrides project database credentials; fixture contacts and identities are fictional. Keep port 4173 free.

On macOS, an installed Chrome can be used instead:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm test:sharing --all
```

`pnpm test:sharing` runs the account/admin/share/quote checks; `--account` also includes foundation/discovery. Running `pnpm test:e2e` directly starts a production server but does not provision a test database. Tests requiring isolated database fixtures are skipped without the harness. `pnpm build` must succeed before direct browser runs.

Coverage includes WebGL startup/failure/context teardown, material loading/retry, camera and mobile gestures, workbench tools, draft persistence, immutable shares, quote validation, ownership isolation, admin authorization and concurrent status updates. Reports, traces, screenshots and generated audits are written under ignored `test-results/` and `playwright-report/` directories.

## Performance

The latest checked-in [audit](performance.json) uses production HTTP responses and software WebGL at 390 × 844, DPR 2. It recorded 1,535,447 scene resource bytes, 54 peak grouped draw submissions and 12,306 submitted triangles including shadow passes. Low quality caps DPR at 1 and decodes maps at 512px; switching quality also releases texture resources.

These are engineering checks, not physical-device FPS, Lighthouse or CDN-network measurements. Real mobile devices, actual Google authorization and deployed cleanup execution need release acceptance; see [deployment](deployment.md).
