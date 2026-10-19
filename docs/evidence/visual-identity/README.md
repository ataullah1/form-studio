# Architectural atelier visual revision — evidence

Verified 2026-10-19. This is an art-direction revision of the implemented Step 2 screens, not a new functional roadmap milestone. Steps 3–12 remain incomplete.

## Screenshots

All screenshots are from the production Next build in headless Chrome 155.0.8059.85 on macOS, through Playwright with software WebGL. For each width **360, 390, 768 and 1440 CSS px**:

- `landing-<width>.png`: complete landing, including typography, static hero, material library, specifications and footer.
- `configurator-<width>.png`: complete /configure page with the interactive 3D scene, HTML panel, estimate, unsaved quote draft and footer.
- `desk-<width>.png`: actual rendered desk on the new warm-mineral stage.
- `fallback-<width>.png`: functioning 2D schematic after activating Use 2D view with the keyboard.

Useful references: [desktop landing](landing-1440.png), [mobile landing](landing-360.png), [desktop configurator](configurator-1440.png), [mobile configurator](configurator-390.png), [tablet configurator](configurator-768.png), [2D fallback](fallback-390.png).

Final mobile landing, tablet configurator, desktop scene and mobile fallback were visually inspected, along with the earlier desktop landing/mobile configurator pass. The earlier pass found a mobile material heading without a usable break and min-content grid overflow; these were fixed and every screenshot/measurement regenerated. A sticky viewer also disrupted the landscape composition check; normal document flow fixed it without changing camera code or weakening its assertions.

## Automated and browser checks

- `pnpm check`: lint, typecheck, all **24 unit tests**, production build — passed.
- Final complete production Playwright suite: all **16 tests passed** in 33.0 seconds; runner state is in browser-run.json.
- Existing foundation tests retain deferred Three loading, healthy/unavailable WebGL, failed module/renderer startup, slow loading, context-loss fallback, single-Canvas navigation teardown, no-JavaScript HTML and four viewport checks. Text/link selectors were updated for the requested new copy.
- Existing camera checks retain desktop/mobile orbit, finite zoom limits, reset, portrait/landscape reframing, idle rendering and context release. No geometry/calculation/control files were modified.
- `browser-review.json`: both routes have document width equal to viewport width, with no overflowing main-content elements. Landing has zero Canvas; active configurator has one. All images load, headings use the configured Bodoni family, body uses the configured Manrope family, no decorative italic elements are present, and no page errors were observed.
- All option inputs/buttons inside disabled fieldsets, save/share and quote submission remain disabled at all four widths. Quote draft fields remain editable after fallback.
- Keyboard Tab reaches Zoom in with a visible 2px terracotta outline (rgb(163, 68, 45)). Enter activates Use 2D view. Emulating reduced motion changes document scrolling to auto; transition/animation removal is defined in the reduced-motion CSS block.
- New SVGs parse as XML. Roadmap comparison against the prior Git revision confirms it is unchanged outside the Art direction section: product scope, steps, dependencies and acceptance criteria are preserved.

The Vercel-owned analytics script was stubbed in local browser checks to avoid local endpoint failures/telemetry. This does not verify or modify live analytics.

## Measured contrast

`contrast.json` computes WCAG relative luminance ratios from the actual semantic hex tokens:

| Pair | Ratio |
| --- | --- |
| Espresso / mineral page | 13.51:1 |
| Muted text / page | 5.29:1 |
| Muted text / chalk | 5.96:1 |
| Muted text / scene or disabled surface | 4.67:1 |
| Chalk button text / terracotta | 5.95:1 |
| Terracotta text / mineral page | 5.28:1 |
| Terracotta selected value / selection surface | 4.75:1 |
| Mineral text / espresso section | 13.51:1 |
| Muted on-dark text / espresso | 8.40:1 |
| On-dark focus accent / espresso | 7.95:1 |
| Input/control border / chalk | 4.25:1 |
| Camera-button border / scene | 3.32:1 |

All tested text pairs exceed 4.5:1, including small text. Enabled control boundaries exceed 3:1. Decorative rules and disabled-control borders use lighter tokens; they are not used as enabled control boundaries or text colours. Native disabled states remain native; no universal accessibility-compliance claim is made from these checks alone.

## Preserved scope and limits

Routes, stack, dependencies, catalog, physical dimensions, pure geometry, orbit/zoom/reset calculations, loading/error boundaries, 2D fallback, quote-draft behavior and Analytics integration are preserved. Only stage presentation changes: palette-based background, warm light tint and a floor shadow receiver. Product materials remain the Step 2 neutral presets.

The material library contains original SVG illustrations only. They are labelled previews and are not runtime wood texture maps. No finish changes, interactive sizes/accessories, persistence, save/share, submission, admin or Step 10 expansion have been implemented.

Physical iPhone/Safari, Android, touch/GPU performance and deployed-site checks were not performed. No commit, push, deployment, production migration or production data operation was performed. The next incomplete roadmap step remains **Step 3 — Materials and visual quality**.
