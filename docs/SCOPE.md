# Step 0 — Product and screen plan

Form Studio is an independent furniture concept by Md Ataullah, intended to demonstrate frontend and product engineering to furniture brands and ecommerce agencies. All visitor-facing copy is English. It is not a furniture shop accepting orders.

## First release
One Studio Desk 01, three sizes, three wood finishes, two frame colours, and three optional fixed-position accessories. Planned interactions: orbit/zoom/reset, camera presets, day/night, dimensions, live itemized pricing, local product draft, immutable public share, demo quote submission, and a restricted admin inbox. Keep an HTML summary and usable controls/quote flow when WebGL is unavailable.

Excluded: checkout/payments, shipping engine, marketplace, arbitrary model upload, AR, AI generation, customer accounts, subscriptions and custom shaders. Screenshot export is optional after core completion. Email sending is excluded from the initial quote flow.

## Screens
- Landing (`preview/index.html#home`): brand/navigation, product statement, default desk illustration, Build/Make it yours CTA, materials, dimensions and concept disclosure.
- Desktop configurator (`#configure`, above 650 CSS px): large scene area, side panel ordered finish → frame → size → accessories → itemized estimate → quote/share entry. At intermediate widths keep controls readable.
- Mobile configurator (`#configure`, up to 650 CSS px): scene above the full-width controls and summary. Use the simpler stacked layout first; tabs/sheet are optional after touch testing.

The scene area reserves room for a single future client-only Canvas; product copy, controls and summary remain HTML. The current SVG is a labelled static composition placeholder, not the finished model or a first-milestone pass. All planned product controls are disabled in this preview; navigation anchors work.

## Visual direction
Warm off-white #f7f5f0, charcoal #292c26, muted green #384735 and wood accents. System sans-serif for controls and Georgia for editorial product headings. No external fonts or image requests. Clear focus states, native controls, visible labels and reduced-motion support.

## Acceptance boundary
Step 0 delivers documented scope/catalog and a responsive static screen plan. It does not establish working 3D, persistence, authentication or pricing logic. The static baseline and browser review are finalized in SCREEN-PLAN.md; owner subjective approval has not been claimed. Later steps must meet the full roadmap's acceptance checks.
