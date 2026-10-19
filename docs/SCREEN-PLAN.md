# Step 0 — Archived screen and visual baseline

Historical Step 0 plan. The current architectural atelier identity supersedes these visuals; see [current visual evidence](evidence/visual-identity/README.md).

Finalized on 2026-10-19 for the requested Step 0 scope. This is the implementation baseline; it does not claim the owner has personally reviewed or approved screenshots.

## Visual references

Use the original local screen compositions below as references for later implementation. No external brand design or unlicensed product photograph is required for this baseline.

- [Desktop landing, 1440 px](evidence/step-0/landing-1440.png): editorial serif product heading, quiet off-white background, arched product composition, restrained green primary action.
- [Desktop configurator, 1440 px](evidence/step-0/configurator-1440.png): large scene left; all product choices and itemized estimate right.
- [Mobile landing, 390 px](evidence/step-0/landing-390.png): statement and CTA first, product illustration immediately below.
- [Mobile configurator, 390 px](evidence/step-0/configurator-390.png): scene and viewer actions first, full-width option groups, estimate and quote/share entry below.

## Placement and responsive rules

| Element | Desktop / tablet >650 px | Mobile ≤650 px |
| --- | --- | --- |
| Landing hero | Copy left, illustration right | Copy, CTA, then illustration |
| Scene | Left column; fills available space | First block; full width |
| Product controls | Right column, minimum 310 px | Below scene, full width |
| Product options | Finish, frame, size, accessories | Same order, no horizontal carousel |
| Estimate | After accessories, in HTML | After accessories, in HTML |
| Quote entry | Below estimate | Below estimate |
| Share entry | Below quote action | Below quote action |

All unavailable product controls are disabled, including native fieldset descendants. No simulated quote success or changing fake price. Navigation anchors work. Future 3D uses the existing scene region; preserve the HTML controls/summary and a fallback path.

## Acceptance review

- Scope, allowed IDs, dimensions, prices and exclusions are fixed in SCOPE.md and CATALOG.md.
- All three requested screen compositions exist and their main regions are explicit.
- Placeholder illustration is labelled in the banner, viewer and documentation. It does not meet the later interactive-3D milestone.
- Original assets and future licensed-texture requirements are recorded in ASSETS.md.
- Progress, decisions and next-step handoff are documented.
- Browser checks and screenshot review are recorded in evidence/step-0/README.md.

Step 0 is complete as a screen-planning deliverable. Subjective owner design feedback can be incorporated later without claiming it has already been received. Step 1 remains unstarted.
