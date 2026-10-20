# Step 11 verification — 2026-10-20

## Automated results

- Lint/typecheck, **111 unit tests** and production build passed. Final lint/typecheck/unit rerun passed after the test additions.
- Full isolated PostgreSQL production-browser run: **60/61 passed (1.5m)**. The audit exposed initial 1K wood-map downloads for selector chips. Replaced those with the existing lightweight illustrative SVG studies so actual maps remain deferred until 3D is requested.
- After that fix, rebuilt production and reran the four affected material checks plus the performance audit: **5 passed (21.1s)**. All **61 unique browser checks** passed across these runs; a second full suite was not run.
- An earlier harness attempt stopped at TypeScript checking because the new fallback test lacked a this annotation; fixed before browser execution. No application defect or test failure is concealed.

Coverage includes strict catalog/pricing/state, all size/accessory subsets, responsive camera/fallback, texture failure/retry/racing/disposal, local draft privacy/recovery, share persistence and limits, private server-priced quote idempotency/current-price consent/rollback, actual no-WebGL quote submission, admin allowlist/origin/replay/history/expired-session redirect, Google token validation, discovery metadata and touch/orientation behavior.

## Production measurements

Source: [production-audit.json](production-audit.json). macOS headless Chrome 155, software WebGL, viewport 390 × 844, device pixel ratio 2. Product: default oak/black 140 × 70 cm, then all three accessories. No FPS, Lighthouse score or physical-phone performance claim.

| Measurement | Observed | Roadmap budget |
| --- | ---: | ---: |
| Initial configurator resource encoded bodies, excluding HTML | 306,215 bytes (0.29 MiB) | No separate target |
| Additional first requested 3D JS/maps | 1,522,442 bytes (1.45 MiB) | Approximately 5 MiB |
| Wood maps in that first scene load | 1,263,214 bytes (1.20 MiB) | Included above |
| Peak grouped WebGL draw submissions, including shadows | 54 | Approximately 100 |
| Peak submitted triangles, including shadows | 12,306 | Approximately 100,000 |

Resource timing comes from a local production HTTP server, not CDN/network throttling. Draws are grouped by event-loop task; counts include shadow passes and are not unique mesh geometry. Quality-switch fetches are excluded from the first-scene transfer figure and recorded separately in the raw audit.

Balanced canvas width: 471 backing pixels / 314 CSS pixels. Low: 314 / 314. Balanced decoded maps: 1024px; low: 512px. Live GPU objects include renderer internals: default balanced 10 textures/46 buffers; all accessories 10/98; after twelve rendered accessory off/on cycles still 10/98. Low returned to 8 textures/46 buffers; four further balanced/low cycles did not increase retained texture count. Idle draws stopped; synthetic hidden/resume paused and resumed rendering.

## Fixes and limits

Added transient Balanced/Low preview controls, lower decoded textures/anisotropy/DPR and disabled shadows in Low. Product selections and estimates remain identical. Expired/revoked admin sessions now return 401 and the private page redirects to login; authenticated non-allowlisted accounts remain 403.

Physical iPhone/Safari, Android/Chrome, hardware drag FPS, thermal/sustained load and actual OS background lifecycle remain **pending**. Synthetic events/touch and software WebGL cannot close these acceptance gates. See ../../PERFORMANCE.md for the device checklist. Step 3 real-phone material review remains open as well.

No new screenshots or AI images; existing pixel assertions use temporary buffers only where needed. No dependency, credential, production migration, live enquiry, commit, push or deployment changes. PostgreSQL writes were confined to the harness's disposable local cluster, which was removed afterward.
