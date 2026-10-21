# Architecture

## Product state

`src/lib/catalog` defines the available sizes, finishes, frame colours and accessories. `validateConfig` rejects unknown fields and versions, and normalizes accessory order. Pricing uses integer cents and is recalculated on the server.

The configurator keeps its current selection in a browser-local draft. Undo/Redo retains at most fifty edits in memory. Camera, room, floor, quality, lamp power and comparison state stay out of saved product configurations. Contact fields are never written to browser storage.

Public share links are immutable snapshots. Editing a shared design starts a copy; it does not change the original. A shared snapshot takes precedence over a local draft. Sign-in resume stores only a validated, short-lived product selection and uses signed, allowlisted return destinations.

## Rendering

The server renders the page, controls and 2D schematic. Three.js is loaded only when a visitor opens a 3D preview. One demand-rendered Canvas owns the model, materials and camera controls. Rendering pauses while idle, offscreen or document-hidden. Low quality caps DPR at 1, decodes wood maps at 512px and disables shadows.

Geometry is authored in metres. Camera fitting accounts for portrait screens and selected accessories. The room uses simple planes and baseboards; dimension labels use HTML anchored to model coordinates. Preview downloads render and capture a PNG once; HTML dimension labels are excluded.

Texture failures retain the product selection and offer a neutral surface/retry. Missing WebGL, a failed renderer, context loss or startup timeout falls back to a 2D view without removing the configuration or quote form.

## Accounts and persistence

Google sign-in uses a server-side authorization-code flow with PKCE, state and nonce. Sessions use opaque HttpOnly cookies with hashed tokens and an eight-hour database expiry. Customers see their own newly saved designs and requests; guest records are not claimed later. Admin access additionally requires a verified Google subject ID in the owner allowlist.

PostgreSQL uses the private `app` schema and separate migration, runtime and admin-web roles. Customers are isolated by explicit server-side ownership predicates, not by a PostgreSQL role per customer. Public responses omit contact details, ownership, fingerprints and idempotency keys.

Save and quote submissions validate bounded JSON, enforce rate limits and use idempotency keys. Quote metadata and contact insertion are transactional. Admin status changes require the current version; stale updates cannot overwrite a newer status. History is written in the same transaction.

Contact rows expire after five days. Daily authenticated cleanup deletes expired contacts and auth records and prunes rate buckets. Private contact reads exclude expired rows even before physical deletion. Cleanup health and provider backup retention need operational monitoring.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Product landing and optional interactive hero |
| `/configure` | Desk builder |
| `/s/[publicId]` | Public saved design; `?edit=1` opens a copy |
| `/login` | Customer sign-in |
| `/dashboard` | Personal designs and requests |
| `/dashboard/quotes/[reference]` | Owned request details |
| `/admin/login` | Owner sign-in |
| `/admin/quotes` | Owner inbox |
| `/admin/quotes/[reference]` | Request details and status history |

Private routes are dynamic, no-store and noindex. Analytics excludes account and admin routes. The app sends no custom analytics events containing contact fields.
