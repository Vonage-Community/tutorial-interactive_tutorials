import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import relativeLinks from 'astro-relative-links';
import vonageIntegration from './vonage-toolbar/integration.ts';

import markdoc from '@astrojs/markdoc';

// https://astro.build/config
export default defineConfig({
  integrations: [
    relativeLinks(),
    vonageIntegration,
    starlight({
      title: 'Vonage Onboarding',
      tableOfContents: true,
      pagefind: false,
      // social: {
      // 	github: 'https://github.com/withastro/starlight',
      // },
      // sidebar: [
      // 	{
      // 		label: 'Guides',
      // 		items: [
      // 			// Each item here is one entry in the navigation menu.
      // 			{ label: 'Example Guide', slug: 'guides/example' },
      // 		],
      // 	},
      // 	{
      // 		label: 'Reference',
      // 		autogenerate: { directory: 'reference' },
      // 	},
      // ],
    }),
    markdoc(),
  ],
});
