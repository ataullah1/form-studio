# Step 4 configuration evidence

Date: 2026-10-19. Local production build on macOS; no commit/push/deployment.

## Verification

- `pnpm check`: lint, typecheck, **58 unit tests** and optimized production build passed.
- Installed-Chrome `pnpm test:e2e`: **22 passed (50.1s)** against the production server. Existing 20 material, camera, fallback, lazy-loading, no-JavaScript and navigation checks remain covered.
- Two new configuration browser tests exercise **three sizes × eight accessory subsets** at each of 1440×1000 and 390×844: selected controls, dynamic viewer dimensions, unique itemized summary lines, illustrative totals, one canvas and no document overflow. They also exercise rapid toggles/size changes, finish/frame selection, Reset configuration and selected numeric dimensions/accessories in 2D fallback.
- Strengthened reset verification compares rendered default composition before selection and after reset. The first raw PNG byte comparison was sensitive to desktop screenshot clipping/encoding; use the existing camera-test interior pixel comparison (12px inset, channel tolerance 2, <0.1% differing pixels). Shared the helper with camera checks. All six configuration/camera checks passed in a targeted rerun after this change; final lint/typecheck rerun passed.
- Three reducer tests verify independent updates/default reset, immutable inputs, set semantics after 100 rapid actions, stable accessory order and invalid-ID/prototype-name/version/extra-field rejection.
- Twenty-seven layout/camera tests verify fixed sizes and edge clearance, stand/lamp contact, tray mounting height, rear/side frame clearance, lamp/stand separation and selected accessory corner projection at portrait/desktop aspects across every size/subset. Existing geometry tests verify actual tabletop extrusion/leg/rail dimensions for all three sizes.
- Initial browser test targeted the raw canvas for aria-label; R3F puts the Canvas label on its containing element. Corrected the locator to the actual labelled viewer; production behavior was unchanged.

## Screenshots and review

`all-{120,140,160}-{1440,768,390,360}.png` in screenshots/ shows all accessories enabled at every size/width. `selected-2d-360.png` records the selected fallback dimensions/accessory list. The 2D diagram is a not-to-scale numeric reference, not accessory geometry or a manufacturing drawing.

Reviewed smallest-size desktop and largest-size mobile compositions. Lamp/stand are separated and sit on the top; feet remain grounded. Camera fits the tallest selected accessory. Tray is attached below the rear surface; normal top-down views can occlude it. Accessory dimensions remain independent of desk size; no external model or extra light added.

`viewport-review.json` records Chrome version, twelve size/width audits, one canvas each, document widths and zero page errors. Saved stills use reduced-motion media. Automated checks use installed Chrome 155.0.8059.85 with SwiftShader software WebGL; mobile sizes are viewport emulation.

**Unverified:** physical phones, touch hardware, Safari/Android, hardware GPU performance/long-duration memory. The Step 3 real-phone material milestone remains pending. This step does not add storage, share backend, quote submission, admin, lamp lighting or new dependencies.
