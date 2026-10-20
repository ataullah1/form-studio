# Private Google-authenticated inbox

Step 9 adds `/admin/login`, a private paginated `/admin/quotes` inbox, quote details and NEW / REVIEWING / CLOSED status history. No customer signup, public admin demo or email sending is included.

## Google setup

1. In [Google Cloud Console](https://console.cloud.google.com/auth/clients), create a Web application OAuth client. Configure the consent screen with your own account as a test user if the app is in Testing.
2. Add this exact authorized redirect URI: `https://formstudioo.vercel.app/api/admin/auth/callback`. For local work, create a separate client or add `http://localhost:3000/api/admin/auth/callback` and set ADMIN_ORIGIN accordingly. Credentials and redirect URI must belong to the same environment.
3. Put GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in ignored .env / Vercel Production. Set ADMIN_ORIGIN to the canonical site origin. HTTPS is required outside localhost; arbitrary return URLs are never accepted.
4. Set ADMIN_DATABASE_URL to the separate restricted pooled `form_studio_admin_web` role. Local setup prepares this credential privately; never use DIRECT_URL/owner as the web admin credential.
5. Leave ADMIN_GOOGLE_SUB_IDS empty initially. Sign in at /login and open Dashboard → Account details to find **your verified Google account ID** (`sub`). Copy that ID into ADMIN_GOOGLE_SUB_IDS, then restart/redeploy. Empty allowlist denies admin inbox access while personal dashboards remain available. This ID is not your email; use comma-separated IDs only for additional owners.

The application requests only the `openid` identity scope. No Google password, Gmail, Drive access, refresh token or provider token is stored. Google credentials cannot be generated locally: the owner must create the OAuth client. Configure all five admin variables before deployment and verify a real login afterward. Do not paste the client secret into chat or Git.

## Authentication

The server authorization-code flow uses PKCE S256, nonce and a one-time state bound to a separate HttpOnly browser cookie. Login flows expire after ten minutes; callback consumption is atomic before provider exchange. Fixed Google token/JWKS endpoints prevent client-controlled provider URLs. jose verifies RS256 signature, issuer, audience, expiration, issued-at, nonce and authorized party. The immutable Google `sub` identifies the user session. Private admin reads and mutations additionally check the server allowlist.

Opaque random session tokens live only in HttpOnly SameSite=Lax cookies (Secure on HTTPS). PostgreSQL stores their SHA-256 hashes, allowed subject ID and an eight-hour expiry. Every private service checks the database session and current allowlist. Removing a subject immediately denies subsequent reads/mutations; logout deletes the session, so replaying the cookie cannot restore access. Login initiations use database-backed quotas independently of public quote/share requests.

## Privacy and database permissions

The ordinary form_studio_runtime role still cannot read contact rows, sessions, login flows or status history. The separate form_studio_admin_web role can read private quote/contact data, manage auth rows, update only status/version columns and insert history. It has no contact insert/update/delete grant or owner/migration privileges. RLS hides contacts as soon as their five-day expiry is reached, even before cleanup physically deletes them.

Admin pages are dynamic with private no-store headers, noindex, same-origin referrer policy and denied framing. Private route data never enters localStorage. Analytics is omitted on admin routes; the public analytics beforeSend guard also drops admin URLs after navigation. Contact strings render as escaped text. Details retain their original configuration snapshot and stored estimate rather than recalculating it.

Daily cleanup also removes expired sessions and login flows. No real enquiries should appear in portfolio recordings: use fictional data in an isolated local database.

## Status mutations and stale tabs

POST `/api/admin/quotes/[reference]/status` requires a current allowed session, exact ADMIN_ORIGIN, JSON body up to 1 KiB, a known status and the current integer version. The server locks the quote, rejects stale/replayed/no-op changes with 409 and commits the status, incremented version and actor history in one transaction. History failure rolls back the change. The UI refreshes after updates/conflicts and on tab focus/visibility return; no background polling is required.

List pages contain twenty records, newest first, with status filtering. Pagination uses bounded page numbers. Expired contacts display an explicit unavailable message while private metadata/history remain.

## Validation and limits

`pnpm check` covers lint, types, unit tests and production build. `pnpm test:sharing` runs public sharing/quote regression checks plus admin checks in disposable local PostgreSQL under distinct web roles. Admin test sessions are inserted by the isolated test database owner; there is no production test-login endpoint or auth bypass. Locally signed RSA fixtures verify Google token acceptance/rejection; no actual Google account is used by tests.

A real Google authorization, deployed cookies/callback and Vercel configuration require owner-provided OAuth credentials and remain deployment acceptance checks.

References: [Google server OIDC flow and validation](https://developers.google.com/identity/openid-connect/openid-connect), [Google OIDC parameters](https://developers.google.com/identity/openid-connect/reference).

## Public accounts update

All verified Google accounts can now use `/login` and `/dashboard`; only ADMIN_GOOGLE_SUB_IDS subjects may open the admin inbox. The old first-login denied-ID bootstrap is superseded: sign in normally, then find your own verified subject under Dashboard → Account details and put it in the admin allowlist if you are the owner. The allowlist remains required for admin access. See ACCOUNTS.md.
