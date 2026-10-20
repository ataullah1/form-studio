# Step 9 verification — 2026-10-20

Private Google login and owner inbox implementation; setup instructions in ../../ADMIN.md.

- `pnpm check`: lint, TypeScript, **110 unit tests** and production build passed. Unit coverage includes real RSA-signed identity fixtures, wrong issuer/audience/nonce/authorized-party/expiry and forged signatures.
- Disposable PostgreSQL production-browser integration: **24 passed (13.3s)** — eight admin, nine quote and seven sharing checks. Tests cover logged-out/non-allowlisted/expired sessions; original private detail and escaped contact text; twenty-row pagination; private cache headers/no admin Analytics; concurrent status version conflicts and replay; stale-tab UI refresh; origin/logout revocation; Google state/nonce/PKCE binding; expired-contact RLS; restricted grants; history-failure rollback.
- Initial integration run passed 22/24. Scoped the denial assertion away from Next's route announcer and gave status selects explicit accessible labels; final run passed all 24.
- Final lint/typecheck rerun passed after those accessibility changes. `git diff --check` passed.
- Neon migration `202610200003_admin_inbox` applied successfully. Separate restricted admin role credential stored only in ignored mode-600 .env; live ACL verification recorded below. No live contact data, enquiries or sessions were seeded, read or changed.
- No screenshots or generated images. Existing quote success test no longer captures a screenshot on every run. No full 54-test rerun; affected database workflows and unit/build checks passed.

Google OAuth client creation, actual Google authorization, production allowlist, callback cookies and deployed Vercel behavior remain owner setup/acceptance work. Automated tests use isolated owner-inserted session fixtures, never a production login bypass. No commit/push/deployment performed.

Live ACL verification passed: form_studio_admin_web can SELECT contacts and UPDATE quote status, but cannot DELETE contacts or UPDATE configuration. Public form_studio_runtime cannot SELECT contacts or admin sessions. Verification queried privileges only; contact rows were not read.

## Login 403 correction

Reproduced the actual local browser form POST: the admin no-referrer policy caused Origin: null, which correctly failed the strict origin check. Changed admin response headers and metadata to same-origin referrer policy; cross-origin destinations still receive no referrer. The same local browser probe now sends Origin: http://localhost:3000. The origin guard was not relaxed.

Replaced the synthetic login-start API test with a real browser button/form submission (only the Google destination is stubbed). Final targeted `pnpm test:sharing --admin`: eight passed (5.4s), including genuine browser origin and PKCE/state/nonce checks; production build, lint and typecheck passed. No provider credentials or actual Google authorization used in tests. No screenshots captured. Live deployed /admin/login and login-start endpoint returned 404 during this check, so this fix requires deployment for that host.

## Transient login 503 diagnosis

Local login POST reproduced 503 from the shared database-backed rate limiter. Both restricted PostgreSQL roles initially timed out even with a seven-second diagnostic connection deadline. DNS/TCP and certificate-verified TLS succeeded; subsequent 20-second-budget probes connected all three roles successfully in about 1.7 seconds. The local login POST subsequently returned 303 to accounts.google.com (about 7.9 seconds). No provider authorization was attempted. These observations confirm transient connection delay, but do not distinguish compute startup from network/provider latency.

Raised runtime/admin PostgreSQL connection deadlines from five to fifteen seconds and Prisma transaction acquisition budget to fifteen seconds (ten-second transaction execution deadline). Admin login now reports an admin-specific unavailable message rather than referring to a saved design. Typecheck and diff checks passed. Existing globally cached development pools require a dev-server restart to adopt the new limits. No credentials changed, no contact data accessed, and no screenshot generated.
