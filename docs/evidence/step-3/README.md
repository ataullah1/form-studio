# Step 3 material evidence

Date: 2026-10-19. Local production build; no deployment/commit/push.

## Automated checks

- `pnpm check`: lint, TypeScript, 28 unit checks and optimized Next build passed.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm test:e2e`: **20 passed (41.4s)**, one worker, production server at 127.0.0.1:4173.
- Four new browser checks cover six finish/frame combinations and matching summary/estimate, keyboard finish selection in 2D, disabled future controls, a failed walnut normal map with neutral fallback and successful retry, a held-back walnut download superseded by ash, and 30 switches after warming all three sets.
- GPU instrumentation wraps real WebGL2 createTexture/deleteTexture: created/deleted/live counts remain equal to the warm baseline through 30 switches. Successful map request count also remains unchanged after warmup; nine unique map URLs. This narrow bounded-resource check does not measure total GPU bytes, long-duration leaks or mobile FPS.
- Four new texture-library unit checks cover colour-space/scale setup, deduplication, nine-resource disposal/bitmap closure after repeated loads, failed-partial cleanup/retry and cancellation/late bitmap cleanup. Existing 24 catalog/geometry/camera checks retained.
- Initial browser run exposed an overly exact accessible-name test locator for the disabled lamp (its label includes price). Corrected the locator; final full suite passed.

## Visual evidence

Screenshots in `screenshots/`:

- `{oak,walnut,ash}-{1440,768,390,360}.png`: full configurator, real finish maps and live summary. Oak/walnut show black frames, ash shows white.
- `walnut-detail.png`: closer surface inspection.
- `material-failure.png`: failed map, neutral surface, preserved selected finish and retry.

Inspected desktop oak/walnut and mobile white-frame ash images, plus surface detail/failure. Sources have fine horizontal veneer grain. Grain scale is one metre per tile; a dark walnut coat corrected the initial overly pale render, preserving its independent maps. Highlights remain matte, tabletop bevels visible and feet meet the fixed shadow receiver. This is a concept render, not calibrated manufacturer photography; procedural edges do not model end-grain joints.

`viewport-review.json` records browser version, exact widths/document widths, canvas counts and page errors. Browser: macOS installed Chrome 155.0.8059.85, headless SwiftShader software WebGL. Reduced-motion media was used for repeatable stills. Existing camera tests include portrait/landscape framing and idle rendering.

**Not verified:** physical phone, real touch gestures, Safari/Android, hardware GPU performance or long-running memory. The roadmap's strict real-phone visual acceptance and first visual milestone remain pending; emulated widths cannot pass that gate.

## Asset evidence

[texture-sources.json](texture-sources.json) retains exact official download URLs, creator metadata, source MD5s, output SHA256s, source tile dimensions, map sizes and preparation transformations. [Asset register](../../ASSETS.md) records CC0/license references. No external model or HDRI introduced.
