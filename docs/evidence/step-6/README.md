# Step 6 pricing and local draft evidence

Date: 2026-10-20. Local production build; no commit, push or deployment.

## Verification

- `pnpm check`: lint, TypeScript, **77 unit tests** and optimized Next build passed.
- Installed-Chrome `pnpm test:e2e`: **30 passed (1.1m)**, production server at 127.0.0.1:4173, one worker. No product-code changes followed that final build/run.
- Six new pricing tests cover three golden estimates ($399/$539/$369), every three-size/three-finish/eight-accessory subset with frame price invariance, integer cents/exact line sums, unknown/duplicate/sparse/versioned/injected input rejection and non-mutating canonicalization.
- Ten draft unit tests cover validated save/restore/reset, exact product-only JSON keys, corrupt/obsolete/oversized/duplicate data without silent writes, blocked/quota storage, supplied shared snapshot priority without local reads and private/injected-field rejection. Prior reducer tests now require strict external duplicate rejection while retaining idempotent accessory actions.
- Six new browser tests cover restore after refresh; exclusion of fictional quote contact values/viewer preferences; immediate reset followed by reload; $369 small/tray 2D dimensions and summary; no visible default-estimate flash during hydration; explicit discard of corrupt/obsolete/injected drafts; storage blocked/quota usability; rapid edits coalescing to one deferred write and flushing a final edit before a fast refresh.
- Existing 24 checks still pass, including lighting/price independence, touch emulation/scroll/form usability, scene/camera reset, all size/accessory subsets, context failure/2D fallback, material retry/stale downloads, bounded repeated changes, idle and navigation teardown, lazy loading and JavaScript-disabled catalog access.

## Review fixes

Initial browser review found early DOM observations could precede stylesheet visibility rules. Pending default selections now have inline visibility:hidden; a noscript override preserves static catalog access. Final hydration test records only the restored $439 estimate when visible, with no page errors.

The multi-case invalid-draft test originally seeded another raw value while the outgoing configurator was mounted; its intentional teardown flush then replaced that fixture. Each case now navigates out before seeding. Invalid data itself stays untouched during edits until explicit discard. Final full browser suite passes.

## Visual evidence

In screenshots/:

- `restored-{1440,390,360}.png`: walnut/all-accessory $539 selection, itemized subtotal/surcharges and local restore notice.
- `invalid-{1440,390,360}.png`: invalid-draft warning, discard action and usable defaults.
- `unavailable-390.png`: blocked-storage session with small desk/tray $369.

Inspected restored mobile itemization and desktop recovery. `viewport-review.json` records browser version, six width/state audits, no horizontal overflow and no page errors. No Canvas is mounted before explicit 3D request; existing lazy behavior is preserved. Desktop Chrome viewport emulation is not physical-phone testing.

## Scope and limits

[Pricing/draft contract](../../PRICING-AND-DRAFTS.md) defines version rules, payload fields and supplied shared-snapshot precedence. This step tests the pure shared-input contract; actual public shared URL loading/API/database and server-authoritative recalculation remain Step 7. No remote save is implied by local draft status. No quote data is saved or submitted. Abrupt browser/process termination can still prevent a pending exit flush; there is no multi-tab synchronization. Physical phone/Safari/Android, deployed storage and hardware performance remain unverified.
