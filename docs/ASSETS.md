# Asset register

| Asset | Source / creator | Rights / attribution | Modifications | Status |
| --- | --- | --- | --- | --- |
| preview/desk.svg | Original code-authored SVG created for this project in Step 0 | No third-party source; repository-wide license not yet selected | Perspective oak/black desk illustration | Static layout placeholder only |
| preview/styles.css wood swatches | Original CSS gradients created in Step 0 | No third-party source | Abstract colour/grain indications | Not runtime wood textures |
| UI fonts | Browser/OS system sans-serif and Georgia | No font files distributed | None | Preview only |

## Historical requirements before Step 3
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
| public/assets/material-studies/{oak,walnut,ash}.svg | Original code-authored grain contour illustrations for this revision | No third-party image source; no external image license claim | UI material library crops and historical option swatches; not runtime wood textures |
| src/app/icon.svg | Original Form Studio monogram from Step 1, revised here | No third-party source | Square terracotta/chalk identity |
| public/assets/desk-concept.svg | Existing original concept illustration | Existing original asset record applies | Reframed with CSS dimension annotations; not a new model or texture |

No external photos, GLBs or runtime material maps have been introduced. Existing Step 0/1/2 screenshots retain their historical appearance.

## Step 3 — self-hosted wood materials

All three sets are by **Jenelle van Heerden**, distributed by Poly Haven under **CC0 1.0**. Attribution is not required; creator/source credit is retained here. [Poly Haven license evidence](https://polyhaven.com/license) identifies the assets as CC0; the license is [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). Retrieved 2026-10-19.

| Finish | Exact asset source | Local files | Source tile |
| --- | --- | --- | --- |
| Oak | https://polyhaven.com/a/oak_veneer_02 | public/assets/textures/wood/oak/{colour,normal,roughness}.webp | 1 × 1 metre |
| Walnut | https://polyhaven.com/a/black_walnut_veneer_01 | public/assets/textures/wood/walnut/{colour,normal,roughness}.webp | 1 × 1 metre |
| Ash | https://polyhaven.com/a/ash_veneer | public/assets/textures/wood/ash/{colour,normal,roughness}.webp | 1 × 1 metre |

Downloaded Diffuse, OpenGL normal (`nor_gl`) and Rough JPEG maps at 1k from Poly Haven's official files API. Original MD5 verified against API metadata. Converted with sharp 0.35.5 in temporary asset tooling (no app dependency), 1024², metadata stripped: colour WebP quality 85; normal/roughness lossless WebP retaining the original JPEG samples. No source colour grading or resampling beyond the declared output size. Exact download URLs, hashes, output hashes, authors and bytes are in [texture-sources.json](evidence/step-3/texture-sources.json). Nine outputs total approximately 4.1 MiB; no 4K/HDRI/GLB files.

Runtime finish coats multiply each separate source colour map (oak #e5bb80, walnut #765039, ash #fff5df), with species-specific roughness/normal strength. These are art-directed concept finishes, not measured manufacturer colour samples. Option swatches use the same source colour maps and coat colours; landing grain illustrations remain explicitly illustrative. Colour maps are sRGB; normal and roughness are untransformed data maps. One tile spans one metre using the extrusion's metre UVs, with grain along the width. See SCENE.md for ownership and rendering details.

## Step 4 accessories

Lamp, monitor stand and cable tray in src/features/scene/desk-accessories.tsx are original code-authored box/cylinder geometry. No third-party model, image, HDRI or dependency added. Existing Step 3 texture rights and ownership are unchanged.

## Step 5 lighting

Day/night use original code-authored fixed light presets. The lamp bulb is original sphere geometry with a local light. No HDRI, environment image, external model or new font introduced; prior texture licenses remain unchanged.

## Portfolio polish additions — 2026-10-20

- `public/assets/studio-desk-01.png`: static screenshot of this repository's actual parameterized desk, oak/black, default 140 × 70 cm with optional lamp and monitor stand. Captured locally in the production viewer using installed Chrome/software WebGL; original geometry, existing lighting and licensed wood maps. No AI render, external model, stock photo or claim of a manufactured product. Original PNG is approximately 131 KiB; next/image serves responsive optimized variants.
- Accessory previews and enhanced fallback are original inline SVG/code in `components/product/accessory-preview.tsx` and `features/scene/desk-schematic.tsx`, representing only the implemented lamp/stand/tray. They are technical illustrations, not additional product options.
- Marketing material crops use the same existing Poly Haven CC0 colour maps and concept finish coats; provenance above remains unchanged. The earlier SVG grain studies remain lightweight selector-chip/archived assets.
