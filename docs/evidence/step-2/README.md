# Step 2 verification evidence

Verified 2026-10-19 on macOS, Node 26.7.0, pnpm 11.21.0, Playwright with installed Chrome 155.0.8059.85 and headless software WebGL.

## Checks

- `pnpm check`: lint, typecheck, **24 unit tests**, and production build passed.
- Full production browser pass: **15 tests passed** in 28.4 seconds. This includes the previous 12 foundation/fallback checks adapted to the desk plus desktop/mobile orbit/zoom/reset and orientation checks. State is preserved in browser-run.json.
- Additional targeted resource check: **1 test passed** in 4.3 seconds. Native WebGL instrumentation observed nonzero rendering, no new draw calls over a 500 ms resting interval, zero active contexts after navigating away, and no further drawing after exit. State is in idle-resource-run.json.
- Orientation test was then strengthened to orbit and zoom before resizing and compare automatic landscape fit against Reset. The strengthened test passed (1 test, 3.9 seconds); state is in orientation-run.json. Its comparison allows less than 0.1% differing interior pixels after excluding a 12px screenshot edge to avoid fractional-scroll clipping/antialiasing differences. Desktop/mobile orbit/zoom/reset checks retain exact screenshot comparisons.
- Final lint/typecheck passed after the browser-test additions.

## Geometry/math coverage

For each of 120×60, 140×70 and 160×80 cm:
- Build the actual beveled tabletop extrusion, measure width/depth, verify y=0.74 top, y=0.71 underside and 0.03 thickness.
- Check four feet at the floor, legs connected between feet and upper rails, rails touching the slab, crossbar reaching rear-leg inner faces.
- Check all frame parts inside the footprint and above the floor; metal section sizes stay fixed.
- At aspects 0.65, 1, 1.8 and 2.5, project all product-box corners into the fitted camera; confirm framing margin and near/far clipping limits.
- Verify minimum zoom stays outside the product sphere and the lowest legal camera position stays at least 10 cm above the tabletop.

Browser camera checks compare rendered Canvas screenshots before orbit, after orbit and after Reset; reset restores the initial composition. Repeated zoom clicks reach finite near/far limits, and Reset restores the same composition from both. Existing navigation checks still confirm only one Canvas and no normal-flow console/hydration errors.

## Screenshots

`desk-<width>x<height>.png` captures the actual rendered viewer, and `configurator-<width>x<height>.png` captures viewer plus HTML controls. Saved at 1440×900, 768×900, 390×844, 360×800 and 844×390. `screenshots.json` records document/viewport width, Canvas count and page errors.

Desktop, portrait and landscape scene images were inspected: full default desk is visible, bevel/corners are readable, legs meet the floor and contact shadows are present. These are neutral geometry previews, not wood-finish promotional renders.

## Limits

No physical phone, Safari or Android checks were performed. Headless Chrome viewports do not prove mobile GPU/touch performance. Accessories are absent at this step, so accessory clipping is not claimed tested. UI size selectors stay disabled until Step 4; all catalog sizes have geometry/math coverage, while the public scene uses the default 140×70 desk. The resource sample is not a long-duration GPU/memory benchmark. No first-material-quality milestone is claimed before Step 3.
