# Personal Google accounts — 2026-10-20

Added public login, personal saved-design/request dashboard and session-bound ownership while retaining private admin allowlist checks. See ../../ACCOUNTS.md.

- Prisma generation, lint/typecheck, production build and **116 unit tests** passed. Five new OAuth-service tests verify non-admin sessions/dashboard routing, allowed owner inbox routing, public-login intent, consumed-flow rejection and no session after invalid token verification. Existing RSA Google claim/signature tests remain in the suite.
- Final disposable PostgreSQL production-browser command: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' pnpm test:sharing --account`: **47 passed (44.6s)**.
- Five account checks cover distinct users' saved designs/requests, unowned guest records, foreign-request 404, no public ownership leakage, client ownership injection rejection, cross-account idempotency conflict, expired-session 401 instead of guest writes, fixed callback/dashboard intent, private noindex/no-store/no-Analytics, logout revocation and user-visible status refresh after an actual admin mutation.
- Existing admin/share/quote/foundation/discovery checks passed, including four responsive widths, no-JavaScript HTML, no-WebGL quote persistence, current-price confirmation and private grants. All fixtures and mutations stayed in disposable local PostgreSQL. No live enquiry/contact fixtures were created.
- Initial affected run passed 29/30; the remaining account assertion used exact link text despite the link also containing a status span. Scoped it by the request href. Final run above includes the fix and added status-refresh check.
- Final lint/typecheck and diff checks passed. No full 66-test rerun; renderer/performance implementation was unchanged. No image generation or screenshots.

The additive Neon migration and live privilege-inspection result are recorded below. Google-provider authorization by a real second account, deployed cookies and audience restrictions remain deployment acceptance. OAuth-service tests use verified-identity stubs and local session fixtures; there is no production auth bypass endpoint. No commit, push or deployment.

Neon migration `202610200004_user_dashboard` applied successfully. The first migration attempt returned a generic schema-engine connection error; a read-only owner probe connected successfully, then migration retry with a 20-second connection budget succeeded. No credentials or .env values changed. Live inspection confirmed the ownership/flow columns exist, the restricted server role can read saved designs, and public runtime contact SELECT remains denied. Inspection read schema/privileges only, not private enquiries.
