# Step 0 verification evidence

Date: 2026-10-19. Environment: macOS, installed Google Chrome 155.0.8059.85, headless through Playwright. Static HTTP server on 127.0.0.1:4173. No project dependencies installed; temporary QA tooling was installed outside the repository.

## Results

Rendered at 360, 390, 768 and 1440 CSS px, with 900 px viewport height and device scale factor 1. Each width has a landing screenshot and a complete configurator-element screenshot. See browser-checks.json for measured bounding rectangles and results.

At all four widths:
- HTTP 200 for the page; both desk images loaded.
- Zero page JavaScript errors.
- Document width equals viewport width; no elements extend horizontally outside the viewport.
- All ten planned buttons are disabled, directly or through native disabled fieldsets.
- Clicking Make it yours reaches #configure, with the section starting approximately 24 px below the viewport top.
- Mobile panel begins immediately below the viewer. Tablet/desktop panel sits alongside it.

Visual review inspected desktop configurator/mobile landing first, corrected crossing SVG grain lines, and raised mobile choice/view/share buttons and accessory rows to at least 44 px. The four-width browser pass and all screenshots were then regenerated. Final desktop landing and mobile configurator images were inspected for composition, legibility, placement and clipping.

Structural checks from the preceding pass also confirmed eight anchor targets, image paths, SVG XML parsing, CSS brace balance, and the planning documents.

## Limits

Viewport emulation is not a physical-phone test. Real iPhone/Safari and Android checks are unperformed and are required in later interaction/performance steps. No 3D/GPU, persistence, pricing-function or backend tests apply to this static step. Screenshots are planning references, not evidence that the later product works. Owner subjective approval has not been claimed.
