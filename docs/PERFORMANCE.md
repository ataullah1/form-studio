# Production performance and test gate

Measurements use a production build on macOS with installed headless Chrome, software WebGL, a 390 × 844 viewport and device scale factor 2. This is a reproducible engineering audit, not a physical phone benchmark. No Lighthouse or FPS score is claimed.

## Viewer quality

| Setting | Balanced (default) | Low |
| --- | --- | --- |
| DPR cap | 1.5 | 1 |
| Directional shadow | 1024 × 1024, cached | Disabled |
| Decoded wood maps | 1024 × 1024 | 512 × 512 |
| Anisotropy cap | 8 | 1 |

Quality is transient viewer state: it never changes configuration, price, local product draft or shared snapshot. Switching releases the old wood library and shadow light resources. Low uses the same self-hosted WebP downloads and downsizes decoded maps, so it reduces GPU/fill cost rather than network transfer. No alternative asset pipeline or dependencies were added.

On-demand rendering pauses while idle, offscreen or document-hidden. Product, lighting and quality changes invalidate only when active. Tests exercise repeated accessory changes, quality switches, idle draw stopping and a synthetic visibility/resume event. A browser-event simulation is not proof of mobile background lifecycle behavior.

## Measured budget

First requested 3D resources measured **1.45 MiB**, with **54** peak grouped draw submissions and **12,306** submitted triangles including shadows in the audited scenario. All are inside the roadmap budgets.

Selector chips now reuse the existing lightweight illustrative SVG material studies; full wood maps are not downloaded before the viewer starts.

The raw local production measurement is in [production-audit.json](evidence/step-11/production-audit.json). Values and acceptance are summarized in the evidence README after the run. Roadmap targets: approximately 5 MiB for initial requested 3D assets, 100 draw calls and 100,000 triangles. Asset bytes use browser resource timing encodedBodySize, not a throttled CDN/mobile-network test. Document bytes are excluded; repeated texture downloads in the low-quality switch test are identified separately.

Draw calls and submitted triangles are intercepted at WebGL entry points and grouped per event-loop task, including shadow passes. They are conservative submission counts, not unique model geometry or animation FPS. GPU resource counters measure live textures and buffers, not process heap or driver VRAM.

## Reproduce

```sh
pnpm check
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm test:sharing --all
```

The harness uses fresh localhost PostgreSQL, distinct owner/runtime/admin roles and fictional contacts. No live database credentials or contact data are used. It applies migrations only to its disposable cluster and removes the cluster afterward. The audit writes JSON measurements, not screenshots. Existing camera/material regression checks compare temporary pixel buffers only where needed.

## Manual device gate — pending

A real iPhone/Safari and a mid-range Android/Chrome were not available through this workspace. Before release record device/OS/browser, balanced/low quality, drag responsiveness (roughly 30 FPS mobile/60 FPS desktop targets), warm-up and sustained use, pinch/scroll, orientation, background/resume and visual material quality. Measure on hardware; do not infer these results from software WebGL or RAF timing. Physical-phone acceptance for Step 3 and Step 11 remains open.

Also verify the deployed save/share, demo quote, owner login and scheduled cleanup against fictional data during the Step 12 release smoke check. This local performance step does not deploy or write to Neon.
