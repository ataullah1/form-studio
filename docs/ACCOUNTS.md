# Public Google login and personal dashboard

Anyone Google verifies can sign in at `/login` and open `/dashboard`. The existing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ADMIN_ORIGIN and ADMIN_DATABASE_URL are reused. The Google callback remains `/api/admin/auth/callback`; no extra OAuth client or callback setting is required.

Google Cloud's own audience settings still apply: if the consent app is in Testing, Google may restrict access to configured test users. Publish/configure the app's audience for the intended users in Google Cloud; application code cannot override a provider restriction.

## Use

1. Open My studio → Continue with Google.
2. In the configurator, choose the product and use Save & share. It appears in Your saved designs when saved while signed in.
3. Submit a demo quote while signed in. Your demo requests lists its reference, saved estimate and current status; open it to see the submitted configuration.
4. Use Refresh requests (or return focus to the page) after the owner changes a status. Sign out revokes the database session.

A browser-local draft is still local; it is not uploaded on every edit. Public share links remain accessible to anyone holding the link by design. The personal account list is private. Quote details/status require the owning account even when somebody knows a reference.

Existing guest activity remains unowned. Matching an email, possession of an idempotency key or later Google login does not claim old requests. Save a new design while signed in; new signed-in requests can be tracked. Contact-field retention and cleanup are unchanged; the Google subject stays with request/design metadata for account ownership. Personal quote pages show configuration/estimate/status without contact fields.

## Access model

Google token verification, one-time browser-bound state, nonce and PKCE remain unchanged. A verified non-admin now receives an eight-hour hashed database session instead of being rejected. The existing session-table/cookie names are retained for compatibility, but sessions can belong to ordinary users too.

`requireUser` checks the current database session. `requireAdmin` additionally enforces ADMIN_GOOGLE_SUB_IDS on every admin query/status mutation. That allowlist now controls only the private inbox, not permission to sign in. A non-admin entering through `/admin/login` continues to `/dashboard`; an allowed owner entering that route can reach the inbox. Dashboard → Account details shows the current user's own verified Google subject ID for owner bootstrap.

Google flow destination is stored with the flow and constrained to `/dashboard` or `/admin/quotes`; callback return URLs are not taken from client input. Logout works for all users, revokes only their current session and returns to `/login`.

Nullable owner_user_id columns bind newly saved designs/quotes to the server-resolved Google subject. APIs never accept ownership from request JSON. Matching idempotency retries must also match ownership; a different account cannot transfer/reuse a previous user's write. Guest retries remain compatible. Unknown/expired session cookies fail writes with 401 instead of silently creating guest activity.

Every dashboard query uses the authenticated subject in a bound SQL owner predicate. Private reads use the existing restricted admin-web connection with server authorization and explicit owner filtering; this is not a new PostgreSQL-per-user role/RLS system. Public runtime contact-read permissions remain denied. The migration grants the restricted server role SELECT for immutable shared designs only; it adds no contact or mutation privileges.

Dashboard/login/account-session routes have private no-store/noindex policy and suppress Analytics. Ownership IDs are omitted from the existing explicit public-share serializer. Dashboard lists are paginated in twenty-row sections; user requests are read-only. No customer signup form, password storage or status-edit capability is exposed.

## Deployment

Apply the additive migration `202610200004_user_dashboard` using the migration owner. It adds ownership columns/indexes and flow destination, without guessing ownership of existing rows. Deploy/restart the application afterward so the Prisma client and OAuth handlers match the schema. Existing credentials/Google admin allowlist stay configured; no new environment variable is introduced.

See evidence/accounts/README.md for verified runs and migration status. Google-provider login with a real second account remains deployment acceptance; automated tests use verified-identity stubs and owner-inserted local session fixtures, with no production bypass endpoint.
