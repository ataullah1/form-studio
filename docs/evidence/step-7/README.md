# Step 7 backend evidence

Date: 2026-10-20. Local PostgreSQL only; no cloud account change, production migration, commit, push or deployment.

## Verification

- `pnpm check`: lint, TypeScript, **79 unit tests** and optimized production build passed without needing database secrets for the build.
- Production browser/integration suite with local runtime DB, shared secret and isolated test-owner URL: **37 passed (1.2m)**. Existing thirty scene/configuration/draft/interaction tests retained.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm test:sharing`: creates a new disposable localhost Postgres cluster, simulated Supabase roles, applies migration, builds and runs seven sharing checks, then stops/removes the cluster. Verified on PostgreSQL 18.6. Final run includes refined read-only page copy and migration-metadata access revocation; all seven passed.
- Seven DB tests verify cross-browser persistence/current $534 server estimate, read-only source versus Edit a copy/local draft, public field allowlist/no fictional quote contact leakage, six concurrent idempotent retries creating one row and conflicting payload 409, immutable UPDATE rejection, unknown/duplicate/injected contact/price/schema input rejection, bounded/invalid body/media-origin handling, shared atomic 10-client/100-global minute limits, ignored spoofed non-Vercel IP headers, unknown/unsupported snapshot states and narrow runtime/anon/authenticated grants.
- The ambiguous-save test commits on the server but replaces its response with an error. UI retains the selected design, emits no premature link, retries the same key and resolves the existing row once.
- Two new pure tests verify the retained v1 resolver/recomputed price and explicit unsupported catalog/schema/removed-ID handling. Actual v2 catalog does not yet exist; no fake historical catalog was invented.
- Initial browser save exposed Next's internal localhost request URL differing from browser authority. Origin check now uses incoming Host rather than that internal URL; foreign Origin remains rejected. Final complete suite passed after the fix.

## Visual / failure evidence

- screenshots/shared-{1440,390,360}.png and edit-copy-{1440,390,360}.png: source page and copy editor. Final stills regenerated after read-only copy refinement.
- screenshots/unconfigured-save.png and unconfigured-review.json: separate app process with DB/secret unset returns 503, retains walnut selection and produces no share link.
- viewport-review.json: headless Chrome 155.0.8059.85, desktop/emulated mobile widths, no page errors or horizontal overflow; 3D still lazy.
- public-response.json: a real local test snapshot's explicit public allowlist. Public IDs are fictional local fixtures, not deployed links. No request key, fingerprint, contact value or secret included.

Inspected mobile shared layout. These are desktop Chrome emulations, not real-device/Supabase/Vercel acceptance.

## Security and scope limits

Migration/runtime privileges and rate counters were exercised against real local PostgreSQL under a restricted role. Supabase's actual Data API/pooler/TLS, hosted ingress-IP handling, multi-region latency and production environment remain unverified. The counters/locks reside in Postgres, not process memory; tests use concurrent requests within the local app rather than a deployed multi-region load test. Supabase setup/migration/deployment instructions are in [SHARING.md](../../SHARING.md).

Only immutable public product configurations are stored. Quote/admin/email workflow, real order/payment and production provisioning remain outside Step 7. Existing real-phone material review remains pending. Test clusters/app processes created for review are stopped after verification.
