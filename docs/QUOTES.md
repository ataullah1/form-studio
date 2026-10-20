# Private demo quote requests

The configurator submits its current canonical design with explicitly consented contact details. This is a demonstration enquiry, not an order; no email is sent. Use fictional contact details when reviewing it.

## Deployment

1. Apply migrations with `pnpm db:migrate` using the owner DIRECT_URL. Runtime DATABASE_URL must use the restricted pooled role described in SHARING.md.
2. Keep SHARE_RATE_LIMIT_SECRET stable for retry fingerprints and rate identities.
3. Copy CRON_SECRET from ignored local .env into **Vercel Production** environment settings. It was generated locally; never publish it or prefix it NEXT_PUBLIC_. Use at least 32 random characters.
4. Deploy the code and vercel.json. Vercel registers the daily `/api/internal/cleanup` schedule in production and sends the secret as a Bearer authorization header. Check invocation logs and monitor successful cleanup runs. Never log request bodies or authorization headers.

Quote persistence returns 503 without a configured cleanup secret and on Vercel preview deployments. Local development works with configured secrets. Adding the secret alone does not prove the scheduled job is active: verify it after deployment. No deployment was performed by this implementation.

## Request contract

`POST /api/quotes` accepts JSON up to 16 KiB with a UUIDv4 Idempotency-Key header: configuration, contact (name/email/company/country/message), empty website honeypot, consent=true, optional sourcePublicId and optional priceConfirmation. Strict allowlists reject unknown fields; optional clientTotalCents is validated but ignored. The server recalculates the current catalog estimate.

New writes return 201; matching retries return 200 and the same opaque reference and recorded estimate. Same-key changed payload returns 409. Stale shared-source estimates return 409 with the current offer, requiring an explicit confirmation before persistence. The client retains its key across uncertain responses and preserves fields on failure; only confirmed success clears contact fields. Contact values are neither echoed in validation errors nor stored in browser storage.

Invalid requests return 400, unsupported media 415, oversized bodies 413, rate limits 429 with Retry-After, and unavailable service 503. Foreign origins are rejected. There is no public quote listing, detail or reference-lookup endpoint. A receipt is not authentication.

## Persistence and abuse limits

A transaction locks the idempotency key, checks its HMAC fingerprint, prices the design and inserts metadata plus private contact rows atomically. Both timestamps use database defaults. A failed contact insert rolls back metadata. No application contact logging or custom analytics events are added.

Runtime can select/insert quote metadata but only insert contact rows; it cannot read contacts, update statuses or delete rows directly. RLS and explicit grants exclude public/browser roles. Owner access remains privileged. Metadata includes design, price, source, reference and keyed fingerprint; it contains no raw contact fields and stays private after contact cleanup. The restricted Google-authenticated admin inbox is described in ADMIN.md.

Atomic database buckets permit five quote requests per client and twenty globally per minute, independently of save/share limits. HMAC identity follows the existing trusted-ingress policy. Honeypot, consent, validation and size limits supplement these quotas.

## Contact retention

Contacts expire five days after insertion. The daily authenticated cleanup deletes expired contacts, leaving a buffer toward a seven-day deletion target. The SQL SECURITY DEFINER function has a fixed search path, grants runtime only execution, and also prunes old rate buckets. The endpoint uses constant-time secret comparison and returns only a deletion count.

This target depends on a healthy deployed schedule. Disabled jobs or prolonged outages can delay deletion: monitor runs and recover promptly. Expiry is eligibility for deletion, not an automatic PostgreSQL timer. Metadata remains for deduplication and future private administration; database backups follow the provider's separate retention policy.

For a manual local invocation, load the ignored .env securely and request GET /api/internal/cleanup with Authorization: Bearer CRON_SECRET. Avoid putting secrets in terminal output, source files, screenshots or shared command history.

Official schedule behavior: [Vercel cron management](https://vercel.com/docs/cron-jobs/manage-cron-jobs), [plan limits and scheduling precision](https://vercel.com/docs/cron-jobs/usage-and-pricing). Daily Hobby schedules may execute within the scheduled hour; production deployment is required.

## Verification

`pnpm check` validates lint, types, unit tests and build. `pnpm test:sharing` runs seven sharing, ten quote, eight admin and five personal-account checks against a fresh disposable local PostgreSQL cluster; `--all` runs the full 66-browser-test suite. The harness overrides database credentials, applies migrations, runs under restricted runtime grants and removes its cluster afterward. Never seed demo contacts into the live database for these checks.
