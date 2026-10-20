# Immutable shared designs — Step 7

## Current implementation

- POST `/api/configurations`: raw validated ProductConfiguration JSON, `Content-Type: application/json`, UUID v4 `Idempotency-Key`. No prices/contact fields accepted. Valid input is canonicalized and estimated again on the server.
- Success returns only `{ publicId, path }`: 201 on creation, 200 for the same key/payload retry. Different payload with that key returns 409. Unknown fields/duplicate accessories/versions return 400; JSON body is streamed with a 4096-byte cap (413), media type 415, foreign Origin 403, throttling 429 with Retry-After, unconfigured/unavailable backend 503. Origin is checked against the incoming Host because Next can expose an internal localhost URL.
- Public ID has 24 random bytes encoded as a 32-character base64url string. It is a public reference, not an authorization secret. There is no public listing, update or delete route.
- GET `/api/configurations/[publicId]` returns a field allowlist: public ID, configuration, schema/catalog version, stored estimate and creation time. It excludes request keys, fingerprints, rate identity and all quote data. Missing ID is 404; unavailable catalog/options is 410. Successful responses are no-store.
- `/s/[publicId]` is a server-resolved read-only product page with explicit saved/current illustrative estimates and an Edit a copy action. `?edit=1` mounts Configurator with the resolved snapshot before any local draft lookup. Unedited shared sources do not overwrite local drafts; product edits save a local copy. The original row remains unchanged. Unknown IDs and unavailable catalog versions have explicit friendly states; database unavailability is not presented as a missing design.
- Save UI retains a request key for retrying the same configuration. A timeout or unconfirmed result never shows a success link; retries resolve an already committed row. Links refer to the captured saved selection, and disappear from the result area when the current design differs. Clipboard fallback is a selectable read-only link field. Nothing sends quote fields.

## Postgres ownership and abuse controls

Prisma 7.10.1 + its PostgreSQL adapter use the private `app` schema. Migration creates a NOLOGIN `form_studio_runtime` role. App runtime gets schema usage, SELECT/INSERT on snapshots and SELECT/INSERT/UPDATE on rate buckets; it is not owner and has no snapshot update/delete grant. RLS policies permit only that runtime role. Schema/table access is revoked from PUBLIC and optional existing `anon`/`authenticated` browser roles. A trigger also rejects snapshot updates/deletes, even from the migration owner during normal DML. Do not grant runtime membership to browser roles or expose `app` through PostgREST.

Transaction-scoped advisory locking by normalized idempotency key serializes cross-instance retries. A persisted SHA-256 of canonical product JSON detects conflicts; neither it nor the key is public. Price is calculated from server catalog facts inside the snapshot transaction.

Rate limits are shared atomic Postgres upserts, using the database clock: 10 valid save attempts per client per fixed minute and 100 globally. Counters commit before snapshot writes, so retry/conflict requests also count. A failed limit rolls its counter transaction back. Vercel ingress IP is read only when `VERCEL=1`, from its overwritten x-forwarded-for header; non-Vercel ingress ignores spoofable headers and shares a conservative client bucket. Client identity is HMAC-SHA256 with a server-only secret, never a raw IP. Other trusted proxy deployments need an explicit reviewed ingress adapter before per-client limits are useful. Global limits still apply everywhere. These limits protect writes, not a general CDN DDoS guarantee.

One bounded connection pool (max 3) per Node process; database access is lazy so no credentials are needed to build or browse a local-only configurator. Missing configuration fails closed with an honest share error. No remote migration runs during app startup/build. Old counter rows can be removed by the database owner (not browser/runtime):

```sql
DELETE FROM app.rate_buckets WHERE window_start < CURRENT_TIMESTAMP - INTERVAL '1 day';
```

Schedule that maintenance when deploying; no scheduled cleanup/account service is provisioned here. Snapshot data has no contact PII and is immutable; this step does not add quote records or retention jobs for future quote contacts.

## Neon / Vercel setup — connection still required

Neon is the selected provider, replacing the original Supabase plan. The existing Prisma PostgreSQL adapter uses standard TCP and works with Neon's PostgreSQL endpoints; no Neon HTTP driver or account SDK is required. The Neon connection, owner migration and restricted runtime grants have been verified. Vercel deployment remains user-controlled. Keep credentials in ignored .env or provider environment settings, not chat/Git/NEXT_PUBLIC_ variables.

1. In [Neon Console](https://console.neon.tech), create/select the intended project, branch and database. Choose a region appropriate to the app deployment. Use the same branch/database for both URLs; separate preview environments should use their own branch and credentials.
2. Copy .env.example to ignored .env. In Neon Connect, select the owner role and turn **Connection pooling off**. Copy that direct URL into DIRECT_URL. The sample host/region/database are placeholders; use the actual values Neon supplies. URL-encode passwords and keep TLS certificate verification (`sslmode=verify-full`).
3. Review the private-schema migration, then apply it to that selected database:

   ```sh
   pnpm db:migrate
   ```

4. The migration creates a restricted SQL role named form_studio_runtime with NOLOGIN and its app grants/RLS policies. In Neon SQL Editor, connected as the owner, enable that existing role with its own generated password:

   ```sql
   ALTER ROLE form_studio_runtime WITH LOGIN PASSWORD 'YOUR_UNIQUE_RUNTIME_PASSWORD';
   ```

   Keep this role SQL-created. Neon's Console/CLI/API-created roles receive elevated neon_superuser membership; do not use an elevated owner role for runtime traffic or add that membership to this role. No owner/BYPASSRLS privileges are needed for the app.
5. Set DATABASE_URL to that runtime role's credentials, same branch/database, and the **pooled endpoint** (`-pooler` hostname, port 5432). Neon uses the plain role name `form_studio_runtime`, without a project-ref username suffix. Use Connect's actual endpoint; replace owner credentials privately when constructing the restricted-role URL. Verify connectivity with this role before deploying.
6. Generate SHARE_RATE_LIMIT_SECRET with `openssl rand -hex 32`. In Vercel, set DATABASE_URL and SHARE_RATE_LIMIT_SECRET for the appropriate environments. Keep DIRECT_URL in local/secure migration tooling rather than normal runtime. No Supabase API key or Neon API key is needed by application code. App tables should not be exposed through a browser Data API.
7. Commit/push/deploy yourself, then Save & share, open in another browser and Edit a copy. Check the runtime role cannot update snapshots and failed saves retain the design. Neon's hosted pooler/TLS/cold starts, Vercel ingress and live deployment remain unverified until real connection settings are configured.

Neon suspends idle computes depending on configuration; a cold connection may need a retry. The UI preserves the save key for an unconfirmed request so retrying cannot create duplicate snapshots. Existing connection/request timeouts fail honestly, with the selected design retained.

## Catalog lifecycle

The published visual catalog currently has only version 1. `resolveSnapshot` retains an explicit v1 resolver; unknown schema/catalog or removed visual IDs return unavailable instead of substituting defaults. When introducing catalog 2, retain the v1 resolver and its facts/visual IDs, add an explicit conversion/compatibility path for making a current copy and label saved versus current estimates separately. Do not rewrite existing snapshots or present an old saved price as today's quote. There is no invented legacy catalog fixture claimed as supported.

## Local database verification

`pnpm check` needs no database. Default `pnpm test:e2e` skips the database sharing/quote tests unless TEST_DATABASE_URL is explicitly supplied. To reproduce real persistence tests safely, have PostgreSQL tools (`initdb`, `pg_ctl`, `createdb`, `psql`) on PATH and installed Playwright Chromium (or an installed Chrome path):

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm test:sharing
# Full 61-browser-test suite using a newly created disposable database:
pnpm test:sharing --all
```

The script creates a fresh localhost-only trust-authenticated cluster on an available port, generates a test-only secret, creates untrusted browser-role fixtures, applies migrations, enables the restricted runtime role, builds, runs tests, then stops/removes its own cluster. It does not use existing project DB credentials. Test fixtures refuse databases outside localhost/form_studio_step7. Keep port 4173 free for Playwright's owned app server. Browser tests check independent sessions, local-draft precedence, itemized server price/privacy, concurrent idempotency/conflict, mutation rejection, body/error handling, atomic client/global limits, spoofed ingress headers, unknown/stale catalogs, role grants and ambiguous-save retry.

## Official references checked

- [Prisma PostgreSQL v7](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql)
- [Prisma configuration](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference)
- [Neon connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Neon role permissions and SQL-created roles](https://neon.com/docs/manage/roles)
- [Neon connections](https://neon.com/docs/connect/connect-from-any-app)
- [Vercel request headers](https://vercel.com/docs/headers/request-headers)

Step 8 adds nine private quote tests to the seven sharing checks in the default disposable-database harness. Quote deployment also requires CRON_SECRET; see [QUOTES.md](QUOTES.md).

Step 9 adds eight admin checks (25 default database checks; 61 with --all). The harness creates a separate restricted admin role and local-only hashed session fixtures. See [ADMIN.md](ADMIN.md).
