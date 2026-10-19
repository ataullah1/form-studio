# Step 5 lighting and interaction evidence

Date: 2026-10-19. Local production build; no commit, push or deployment.

## Checks

- `pnpm check`: lint, typecheck, **61 unit tests** and optimized Next build passed.
- Three new camera-preset unit checks cover every size, with/without tall lamp, portrait/desktop aspect, safe distance/elevation, Front azimuth and exact Reset target. Initial check found a tall-accessory reset position outside the polar envelope; corrected the pure framing function. Existing geometry and accessory projection tests still pass.
- Installed-Chrome `pnpm test:e2e`: **23 passed, one new assertion failed**. That assertion captured innerText then compared it with Playwright's default textContent; no product mismatch. Corrected the capture to textContent. Targeted `playwright test tests/e2e/viewer-interaction.spec.ts`: **2 passed (9.9s)**. Together the final runs pass all **24 unique browser checks**. No runtime changes followed the production build (only a code comment, test comparison and docs).
- New desktop check verifies unchanged itemized summary and same camera after Day → Night → Day, visible night lamp status, finite normal-motion Front/Detail/Reset, stable draw-call counts after transitions, paused offscreen lighting updates, resume drawing and ambient night after lamp removal.
- New mobile check uses Chromium CDP touch input for single-finger orbit and two-finger pinch, verifies the image changed, taps Front/Detail/Reset with reduced motion, checks exterior touch scrolling and edits the unsaved name draft. No page errors; estimate remains $399. It does not prove physical touchscreen behavior.
- Existing checks pass for selected state/keyboard swatches, all 24 size/accessory combinations, material failure/retry/stale downloads, thirty bounded material switches, idle draws/navigation teardown, lazy scene, WebGL unavailable, module/renderer failure and context-loss 2D fallback.

## Visual evidence

In screenshots/:

- `day-{1440,768,390,360}.png`, `night-{1440,768,390,360}.png`: full page with optional lamp selected.
- `front-night.png`, `detail-night.png`: camera presets.
- `night-without-lamp.png`: readable tabletop under ambient studio lighting alone.

Inspected mobile night and desktop no-lamp views; matte wood remains readable, a local warm lamp pool appears when selected, and exterior controls retain the atelier identity. Detail permits close inspection; Reset returns the full fitted composition. `viewport-review.json` records widths, document widths, one canvas per case, browser version and no page errors.

Chrome 155.0.8059.85 on macOS, headless SwiftShader software WebGL. Stills use reduced-motion media; the normal-motion browser test separately verifies transition settling. No external lighting assets or dependency changes.

## Limits

No physical phone, Safari/Android, hardware GPU/FPS/long-duration memory or actual background-tab lifecycle test. Offscreen rendering was instrumented through real WebGL draw calls; document visibility handling is implemented but background OS behavior remains unverified. The prior real-phone material acceptance is still pending. No product storage/share transport or backend added.
