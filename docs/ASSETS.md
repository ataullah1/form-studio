# Asset register

| Asset | Source / creator | Rights / attribution | Modifications | Status |
| --- | --- | --- | --- | --- |
| preview/desk.svg | Original code-authored SVG created for this project in Step 0 | No third-party source; repository-wide license not yet selected | Perspective oak/black desk illustration | Static layout placeholder only |
| preview/styles.css wood swatches | Original CSS gradients created in Step 0 | No third-party source | Abstract colour/grain indications | Not runtime wood textures |
| UI fonts | Browser/OS system sans-serif and Georgia | No font files distributed | None | Preview only |

## Required before Step 3
Select self-hosted seamless oak, walnut and ash material maps. Record each asset's exact source URL, creator, license, required attribution, downloaded filenames, modifications and intended usage. Record license evidence; do not infer rights from search thumbnails or an unrelated code license.

Use simple self-owned scene lighting initially. HDR environment and GLB models are optional; if added, register licenses and GLB units, origin, node names and material slots. No third-party texture, GLB or HDRI has been selected/downloaded yet. Final geometry and wood materials remain pending.

## Step 1 additions

| Asset | Source / creator | Rights / attribution | Modifications | Status |
| --- | --- | --- | --- | --- |
| public/assets/desk-concept.svg | Copy of the original preview/desk.svg | No third-party source | Relocated for Next public asset routing | Landing concept illustration |
| src/app/icon.svg | Original code-authored Form Studio monogram | No third-party source | None | App icon |
| 2D dimension schematic | Original SVG in src/features/scene/desk-schematic.tsx | No third-party source | Catalog-backed default dimensions | WebGL-independent fallback |
| Step 1 cube/grid | Original code geometry using installed Three/Fiber/Drei libraries | No external texture/model files; libraries retain their package licenses | None | Integration fixture, not final desk |

No new external texture, GLB, HDRI or font assets have been introduced.

## Step 2 additions

The runtime cube/grid has been replaced by original parameterized desk geometry in desk-model.tsx, desk-dimensions.ts and tabletop-shape.ts. Tabletop outline/extrusion, rounded frame/feet and floor are code-authored; neutral Three standard materials use no image textures. Fixed lights/shadow maps replace the integration grid. No external model/texture/font/HDRI downloads were introduced. Step 1 screenshots remain historical test-fixture evidence; Step 2 images show the actual neutral desk.

## Architectural atelier identity revision

| Asset | Source / creator | License / attribution | Modifications / use |
| --- | --- | --- | --- |
| Bodoni Moda | The Bodoni Moda Project Authors; https://github.com/google/fonts/tree/main/ofl/bodonimoda | SIL OFL 1.1; verified source notice copied to public/licenses/Bodoni-Moda-OFL.txt | next/font/google self-hosts/subsets upright display font at build |
| Manrope | The Manrope Project Authors; https://github.com/google/fonts/tree/main/ofl/manrope | SIL OFL 1.1; verified source notice copied to public/licenses/Manrope-OFL.txt | next/font/google self-hosts/subsets body/controls font at build |
| public/assets/material-studies/{oak,walnut,ash}.svg | Original code-authored grain contour illustrations for this revision | No third-party image source; no external image license claim | UI material library crops and disabled option swatches only; not runtime wood textures |
| src/app/icon.svg | Original Form Studio monogram from Step 1, revised here | No third-party source | Square terracotta/chalk identity |
| public/assets/desk-concept.svg | Existing original concept illustration | Existing original asset record applies | Reframed with CSS dimension annotations; not a new model or texture |

No external photos, GLBs or runtime material maps have been introduced. Existing Step 0/1/2 screenshots retain their historical appearance.
