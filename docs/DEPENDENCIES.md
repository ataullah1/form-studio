# Step 1 dependency compatibility

Verified 2026-10-19 using stable official documentation, npm package metadata and the installed package manifests. Versions are exact in package.json, with transitive resolutions in pnpm-lock.yaml. See evidence/step-1/dependency-versions.json for the measured versions and peer/engine ranges.

| Package | Pinned version | Compatibility basis |
| --- | --- | --- |
| Next.js | 16.4.2 | App Router; React 19 satisfies Next's peer range |
| React / React DOM | 19.3.1 / 19.3.1 | Matching versions; supported by Fiber/Drei |
| React Three Fiber | 9.8.2 | React/DOM >=19 <19.4; Three >=0.156 |
| Drei | 10.7.9 | React/DOM ^19, Fiber ^9, Three >=0.159 |
| Three.js | 0.186.1 | Satisfies both 3D libraries; matching @types/three 0.186.0 |
| Tailwind CSS / PostCSS plugin | 4.3.3 | Same pinned release; imported in global CSS |
| TypeScript | 5.9.3 | Deliberately retained stable 5.x for Next/tooling compatibility |
| ESLint / Next config | 9.39.4 / 16.4.2 | React and JSX accessibility plugins in the current Next config advertise ESLint 9 peers; ESLint 10 is outside those ranges |
| Vitest | 5.0.5 | Node-only catalog checks |
| Playwright | 1.64.1 | Production-browser integration checks |
| pnpm | 11.21.0 | packageManager pin; project settings in pnpm-workspace.yaml |

The registry marks ESLint 9 as deprecated/unsupported. This is a documented tooling limitation, not an unnoticed upgrade: keep the compatible plugin set for this step; update lint tooling together when Next's React/accessibility plugin peers support the next major. No prerelease or forced peer override is used.

Node requirement for this repository is ^22.13.0, ^24.0.0 or >=26.0.0 (the intersection of pnpm/Vitest/app tooling). Verified locally with Node 26.7.0. Next alone has a lower minimum; using that minimum does not satisfy all repository tools.

Only the resolver package's native postinstall is explicitly allowed in pnpm-workspace.yaml; package installs are otherwise governed by pnpm's normal build policy. Installation uses strict peer checks. Do not use --force to bypass compatibility problems.

## Official sources used

- [Fiber installation and React major pairing](https://r3f.docs.pmnd.rs/getting-started/installation)
- [Next.js installation and requirements](https://nextjs.org/docs/app/getting-started/installation)
- [Next dynamic loading, client-only rendering and deferred modules](https://nextjs.org/docs/app/guides/lazy-loading)
- [Fiber Canvas and error/fallback guidance](https://r3f.docs.pmnd.rs/api/canvas)
- [Drei controls lifecycle and demand rendering](https://drei.docs.pmnd.rs/controls/introduction)
- [pnpm project settings](https://pnpm.io/settings)

Pinned peer ranges were verified against the installed official packages' package.json files, not inferred from the docs' latest examples. Recheck these sources and package metadata before changing versions.

## Analytics addition

Added exact `@vercel/analytics@2.0.1` using its npm metadata and the official [Next.js integration guide](https://vercel.com/docs/analytics/quickstart). Advertised peers are Next >=13 and React ^18/^19, covering this project's installed versions. Root layout mounts the `/next` component once. The earlier step-1 version snapshot is historical and has not been rewritten.

## Step 7 additions — 2026-10-20

Pinned Prisma / @prisma/client / @prisma/adapter-pg 7.10.1, pg / @types/pg 8.23.1, dotenv 18.0.8 and server-only 0.0.1 after registry/official documentation checks. Registry latest Prisma was 8.0.0-rc.23; deliberately chose the stable v7 line with matching client/adapter. Prisma's Node engine (^20.19 / ^22.12 / >=24) covers this repository's required versions. No framework/renderer upgrades.

Generated client is ignored and rebuilt by postinstall/build; Prisma migrations do not run automatically during installation/build. Explicitly allow Prisma/engine package scripts in pnpm-workspace.yaml alongside the prior native resolver. Reproducible frozen install succeeded. `prisma.config.ts` reads DIRECT_URL for migration tooling and runtime uses only DATABASE_URL through a PostgreSQL adapter, with max 3 connections per process. No database is contacted to prerender the landing/configurator.

Verified with local PostgreSQL 18.6, Node 26.7.0 and installed Chrome. Cloud Supabase pooler/TLS and Vercel integration remain pending. See SHARING.md for official references/setup.

## Provider selection update

Neon is now selected. Standard PrismaPg/pg TCP transport is retained; no Supabase or Neon API SDK is required. The pooled runtime/direct migration endpoint split is documented in SHARING.md. No dependency or schema change is needed for this provider choice. Cloud Neon connectivity remains unverified.
