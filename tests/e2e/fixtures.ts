import { test as base } from '@playwright/test';

// Local Next servers do not serve Vercel's platform-owned analytics endpoint.
// Stub only that script so product tests stay offline and send no analytics data.
export const test = base.extend({
  page: async ({ page }, providePage) => {
    await page.route('**/_vercel/insights/script.js', route => route.fulfill({
      contentType: 'application/javascript',
      body: '// Vercel Analytics platform script omitted in local product tests.',
    }));
    await providePage(page);
  },
});
export { expect } from '@playwright/test';
