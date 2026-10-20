# Product story and search discovery

The landing remains server-rendered HTML with the existing lightweight SVG desk poster. It now explains customization, materials, dimensions, the three-step workflow and concept FAQs. All sizes, frame colours and accessories are described as available; prices come from the catalog. No sales, stock, certification or review claims were added.

Primary links open `/configure`. The final enquiry link opens `/configure#quote-draft`; navigation and summary work without loading the optional 3D renderer. Native details/summary FAQs work without JavaScript. Interactive configuration/submission still requires JavaScript. The short poster entrance and material hover detail respect reduced motion; content never waits for an animation.

## Public metadata

`src/lib/site.ts` pins the canonical origin to https://formstudioo.vercel.app. Both `/` and `/configure` have their own title, description, canonical, Open Graph and Twitter metadata. Change this origin if the production domain changes.

`/opengraph-image` serves one 1200 × 630 PNG social card generated from local code by Next ImageResponse. It uses the established palette and typography without a new illustration, AI image generation, external image request or new dependency. It is generated/cached at build time. Social platforms may cache previews after deployment.

`/sitemap.xml` includes only `/` and `/configure`, without invented last-modified timestamps or generated design URLs. `/robots.txt` excludes admin/API paths. Shared `/s/[publicId]` pages retain noindex metadata and are omitted from the sitemap; they are not blocked from crawling so crawlers can read that directive. Admin noindex and server authentication remain separate controls. Canonical URLs are defined only for the public explanatory routes, not inherited from the home page onto private/generated routes.

Existing analytics remains optional and excludes admin routes and contact fields. No new custom events or contact payloads were introduced.

## Verification and release

See evidence/step-10/README.md. Deploy these changes before checking live metadata or submitting the sitemap to search engines. Indexing and third-party social preview refresh are not guaranteed by local tests. No deployment, Google Search Console account change, screenshots or video recording was performed. A portfolio interaction walkthrough belongs to release preparation.

Official APIs: [Next metadata](https://nextjs.org/docs/app/api-reference/file-conventions/metadata), [Open Graph image routes](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image), [sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap).
