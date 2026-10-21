# Deployment

The app targets Vercel with Neon PostgreSQL. Production currently uses `https://formstudioo.vercel.app`. A preview environment should have its own database branch and Google OAuth client settings.

## Environment

Copy `.env.example` for local development. Set production values in the hosting environment; none belong in client-exposed `NEXT_PUBLIC_` variables.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled connection for the restricted `form_studio_runtime` role |
| `ADMIN_DATABASE_URL` | Pooled connection for `form_studio_admin_web` |
| `DIRECT_URL` | Direct migration-owner connection; keep local or in a migration job, outside the deployed runtime |
| `SHARE_RATE_LIMIT_SECRET` | Shared secret for rate identities and quote fingerprints |
| `CRON_SECRET` | Separate secret authenticating scheduled cleanup |
| `ADMIN_ORIGIN` | Exact app origin, without a path, query or fragment |
| `GOOGLE_CLIENT_ID` | Google web application client ID |
| `GOOGLE_CLIENT_SECRET` | Server-side OAuth client secret |
| `ADMIN_GOOGLE_SUB_IDS` | Comma-separated Google subject IDs allowed into the owner inbox |

Generate each application secret separately with `openssl rand -hex 32`. Use the same rate-limit secret across deployed instances. An empty owner allowlist blocks admin access while customer sign-in remains available.

## New database setup

Use the same database and branch for the direct and pooled URLs. Review `prisma/migrations`, then run `pnpm db:migrate` explicitly with `DIRECT_URL` pointing to the intended database. Builds and application startup do not run migrations.

The migrations create SQL roles with restricted grants and `NOLOGIN`. As the migration owner, enable `form_studio_runtime` and `form_studio_admin_web` with separate passwords using `ALTER ROLE ... WITH LOGIN PASSWORD ...`. Set their pooled connection strings as the two runtime URLs. Do not use migration-owner credentials for web traffic or elevate these roles to database-owner privileges.

For an existing deployment, inspect migration status before applying anything. Never run the browser test harness against the production database.

## Google login

Create a Google OAuth web client with the app's consent-screen name and the exact callback:

```text
https://formstudioo.vercel.app/api/admin/auth/callback
```

For local development, add `http://localhost:3000/api/admin/auth/callback` and set `ADMIN_ORIGIN=http://localhost:3000`. Credentials, callback and app origin must match the same environment. Google's audience/publishing settings must permit the intended users.

Any permitted verified Google account can use `/login`. After signing in, find your verified account ID under My studio → Account details. Add that numeric `sub` to `ADMIN_GOOGLE_SUB_IDS` to grant owner access. The allowlist uses subject IDs, not email addresses.

## Release checks

1. Run the checks in [testing](testing.md) and review the Git diff.
2. Set production environment values and deploy the build. Changing the domain also requires updating `src/lib/site.ts`, `ADMIN_ORIGIN` and Google callback settings.
3. Verify a real customer login, logout and owner login on the deployed origin.
4. Save a design, open its public link and edit a copy. Verify account ownership and submit a fictional demo request; confirm its status from the owner inbox.
5. Check the scheduled job in `vercel.json`: `/api/internal/cleanup`, daily at `0 0 * * *` UTC. Confirm authenticated execution and monitor failures. The five-day contact expiry/seven-day deletion target depends on healthy cleanup and does not control provider backups. Quote submission is disabled on Vercel Preview deployments because they cannot rely on the production cleanup schedule.
6. Enable Vercel Web Analytics if desired. Private account/admin pages are excluded by application code.
7. Check iPhone/Safari and Android/Chrome: touch orbit, portrait/landscape, normal page scrolling, low-quality mode and fallback. Software-WebGL tests do not establish real-device FPS.

This is a demo enquiry workflow, not checkout or email delivery. Keep public demonstrations free of real customer information.
