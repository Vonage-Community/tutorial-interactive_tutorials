import { defineConfig } from 'astro/config';

import markdoc from '@astrojs/markdoc';
import starlight from '@astrojs/starlight';
import relativeLinks from 'astro-relative-links';
import vonageIntegration from './vonage-toolbar/integration.ts';

// https://astro.build/config
export default defineConfig({
  integrations: [
    relativeLinks(),
    vonageIntegration,
    starlight({
      title: 'Vonage Onboarding',
      tableOfContents: false,
      pagefind: false,
    }),
    markdoc({ allowHTML: true })
  ],
  vite: {
    server: {
      fs: {
        strict: false
      }
    }
  }
});
