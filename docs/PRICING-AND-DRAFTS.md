# Pricing and local product drafts — Step 6

## Strict product boundary

`src/lib/catalog/pricing.ts` is a pure module usable without React, Three, browser storage or credentials. `validateConfig(unknown)` returns independently owned ProductConfiguration with current schemaVersion 1, catalogVersion "1", product ID and known size/finish/frame/accessory IDs. Extra fields (including supplied price/contact/viewer fields), wrong/missing versions, unknown IDs, malformed arrays and duplicate accessories throw. Valid unique accessories are ordered by catalog. No silent ID substitution or obsolete-version migration.

Step 4 reducer actions stay idempotent: enabling an already-enabled accessory creates no second instance. External payloads with duplicate IDs are now rejected instead of silently deduplicated. The reducer's normalizeConfiguration name aliases the strict boundary.

`calculatePrice(unknown)` validates first and uses only immutable versioned catalog facts. It returns USD itemized integer-cent lines, productSubtotalCents (size base), surchargeCents (finish/frame/accessories), estimatedTotalCents, catalogVersion and explicit null tax/shipping. UI lines and totals use this same result, formatted through Intl.NumberFormat. Tax/shipping are unavailable and excluded; this remains an independent illustrative concept.

Golden estimates:

| Configuration | Base | Surcharges | Estimate |
| --- | --- | --- | --- |
| Default 140×70 oak/black | $399 | $0 | $399 |
| Default size, walnut, all three accessories | $399 | $40 + $45 + $35 + $20 | $539 |
| 120×60 oak/black, cable tray | $349 | $20 | $369 |

Lighting/camera never enter ProductConfiguration or pricing. These are client-side estimates; local server-side validation and persistence tests now pass, but live deployment security remains unverified. Step 7 now validates and recalculates from catalog facts before snapshot persistence; Supabase/live deployment remain unverified.

## Local persistence lifecycle

Key: `form-studio:product-draft`. Value: JSON of validated ProductConfiguration only, including schema/catalog versions. No quote name/email/company/country/message, estimated price, material URL, camera, lighting or timestamp. Drafts are scoped to that browser profile/origin, with no cross-device sync and no storage-event synchronization between tabs.

Configurator resolves browser storage only after hydration, before mounting interactive product choices. The server and first hydration render share a pending shell. Its default selections are hidden inline (also before CSS arrives); a noscript style exposes static default facts/schematic when JS is absent. Thus existing local drafts never show an interactive default estimate first, and no browser globals are read during SSR. Quote fields stay outside this boundary. JS-disabled visitors cannot restore localStorage; static catalog facts remain available.

A valid draft restores; an empty store starts defaults. Changes save after a 350ms debounce. New changes cancel older timers. Pagehide and component teardown flush the latest eligible state; abrupt process termination may still prevent a flush. Reset Configuration writes validated defaults immediately, then updates the canonical state. No success is claimed if storage throws.

Corrupt, oversized (>4096 characters), malformed, duplicate or obsolete drafts display a clear warning with defaults and a Discard saved draft action. Existing invalid data is not automatically overwritten: edits work for this visit until discard/reset explicitly replaces it with defaults. Blocked access/read/write or quota errors show a session-only notice and leave all product controls/estimate and unsaved quote fields usable. Storage functions catch those browser errors; invalid configuration is still rejected.

## Shared-URL precedence contract for Step 7

No share URL parser, public route, API or persistence backend is implemented here. The future server-resolved share route must resolve/validate its snapshot **before mounting Configurator**, then pass it as `sharedSnapshot`. Mount/key the editor per snapshot; do not first mount with an undefined snapshot while waiting for it, and do not merge it with a local draft.

`loadInitialConfiguration(storage, sharedSnapshot)` always uses a supplied validated snapshot without reading storage, even if storage is blocked. Invalid supplied snapshots throw and must become the future share route's explicit unavailable/error state; they must never fall back to an unrelated local design. Server/noscript references use that supplied snapshot too. The unedited shared source does not overwrite an existing local draft. Explicit product edits create a validated local copy; reset is also an explicit edit. The shared source object remains untouched. Lighting/camera changes do not count as product edits.

Tests verify local-versus-shared precedence and invalid-shared rejection at the pure loader boundary. Real shared-URL end-to-end behavior remains Step 7, rather than a simulated public share feature.

## Step 7 integration update

The future precedence contract above is now wired into `/s/[publicId]?edit=1`: the server resolves a snapshot before Configurator mounts, keyed by public ID. Read-only public pages never mount the local draft editor. Cross-browser restoration and local-draft priority behavior pass real local Postgres integration tests. See SHARING.md; original Step 6 boundaries above remain historical context.
