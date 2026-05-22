import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'silent-auth-tutorial',
      social: {
        github: 'https://github.com',
      },
      // Auto-generate sidebar from content files
      sidebar: [
        {
          label: 'Tutorial',
          autogenerate: { directory: 'docs' }
        }
      ],
      // Override Footer to add step navigation
      components: {
        Footer: './src/components/Footer.astro',
      },
    }),
  ],
  server: {
    port: 1234,
    host: true, // Listen on all addresses (0.0.0.0) for Codespaces compatibility
  },
});
