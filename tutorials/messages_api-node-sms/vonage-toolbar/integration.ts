import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { exec } from 'child_process';
import util from 'util';
import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import path from 'path';
export default {
  name: 'vonage-onboarding-integration',
  hooks: {
    'astro:config:setup': ({ addDevToolbarApp }) => {
      addDevToolbarApp({
        id: 'vonage-toolbar-app',
        name: 'Vonage Toolbar App',
        icon: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Vonage</title><path d="M9.279 11.617l-4.54-10.07H0l6.797 15.296a.084.084 0 0 0 .153 0zm9.898-10.07s-6.148 13.868-6.917 15.565c-1.838 4.056-3.2 5.07-4.588 5.289a.026.026 0 0 0 .004.052h4.34c1.911 0 3.219-1.285 5.06-5.341C17.72 15.694 24 1.547 24 1.547z" fill="white"/></svg>',
        entrypoint: fileURLToPath(new URL('./app.ts', import.meta.url)),
      });
    },
    'astro:server:setup': ({ toolbar }) => {
      
      toolbar.on('vonage-app:config-check', async (data:any) => {
        try {
          const filePath = 'tutorial-config.json';
          const fileData = await fs.readFile(filePath, 'utf8');
          const config = JSON.parse(fileData);
          toolbar.send('config-checked', {
            found: true,
            tutorial: config,
          });
        
        } catch (err) {
          if (err.code === 'ENOENT') {
            console.error('Config file not found.');
            toolbar.send('config-checked', {
              found: false,
              tutorial: {},
            });
          } else {
            console.error('Error reading config file:', err);
            toolbar.send('config-checked', {
              found: false,
              tutorial: {},
            });
          }
        }
      });

      toolbar.on('vonage-app:generate', async (data: any) => {
        try {
          // create tutorial-config.json file
          toolbar.send('server-status', {
            status: 'Creating configuration file (tutorial-config.json)',
          });
          const configData = JSON.stringify(data.tutorial, null, 2);
          await fs.writeFile('tutorial-config.json', configData);

          // Zip up the whole project folder without the node_module folder and name it the slug generated from the title
          toolbar.send('server-status', {
            status: 'Zipping up project... could take a minute',
          });
          const zip = new AdmZip();
          let exclude = ['node_modules', 'dist'];
          const sourceDir = './';
          const zipFile = './public/product_name-language-topic.zip';
          await zip.addLocalFolderPromise(sourceDir, {
            filter: (filePath) => !exclude.some((ex) => filePath.includes(ex)),
          });
          await zip.writeZipPromise(zipFile);
          console.log(`Zip file ${zipFile} created successfully!`);
          // display link to download project zip file in toolbar.
          toolbar.send('server-status', { status: 'Complete!' });
        } catch (error) {
          console.error('Error:', error);
        }
      });
    },
  },
} satisfies AstroIntegration;
