import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import relativeLinks from 'astro-relative-links';
import myIntegration from './my-toolbar-app/my-integration.ts';

// https://astro.build/config
export default defineConfig({
  integrations: [
    relativeLinks(),
    myIntegration,
    starlight({
      title: 'Vonage Onboarding',
      tableOfContents: false,
      pagefind: false,
    }),
  ],
});
