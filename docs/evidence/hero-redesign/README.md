# Homepage hero redesign

The old two-column layout combined a wide gutter with baked-in image whitespace, technical dimension borders and competing microcopy. The desk occupied a small fraction of the composition. The new shared image surface puts the desk alongside the headline, keeps the supplied oak/black concept image, removes technical annotations and adds a concise product strip. Starting price is calculated from the current catalogue ($349).

Files: src/app/page.tsx and the hero rules in src/app/globals.css. Existing fonts, palette, navigation, lower sections and server functionality are retained. No new dependencies, imagery or client JavaScript. The priority WebP uses responsive sizes; an explicit stage/aspect ratio reserves layout space. No measured LCP improvement is claimed.

Reviewed browser screenshots against before-1440.png. Actual installed Chrome checks at 320, 375, 390, 768, 1024 and 1440 px found no horizontal overflow and loaded the hero image at every width. Tablet uses contain to retain the entire desk; mobile stacks copy/CTA above the product. CTA navigates to /configure; account navigation reaches /login. Keyboard focus is visible; reduced motion disables the entrance animation. See review.json and hero-*.png. Final refinement matches the surface to the supplied image top-edge colour.

Lint passed with the existing logout-navigation warning; TypeScript and production build passed. Browser checks use desktop Chrome emulation, not real mobile hardware. Authentication, database writes, saved designs, quotes and admin flows were not rerun for this presentation-only change. No commit, deployment or production data changes.
