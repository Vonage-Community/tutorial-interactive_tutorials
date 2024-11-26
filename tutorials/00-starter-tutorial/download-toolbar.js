console.log('download toolbar application files');

import fs from 'fs/promises';

async function downloadFile(url, filename) {
  console.log('downloading: ', filename);
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    await fs.mkdir('./vonage-toolbar', { recursive: true }); // Create the downloads directory if it doesn't exist
    await fs.writeFile(
      `./vonage-toolbar/${filename}`,
      Buffer.from(buffer),
      (err) => {
        if (err) {
          console.error('Error writing file:', err);
        } else {
          console.log('File downloaded and written successfully!');
        }
      }
    );
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}

downloadFile(
  'https://raw.githubusercontent.com/conshus/onboarding-tutorials/refs/heads/main/toolbar-app/integration.ts',
  'integration.ts'
);

downloadFile(
  'https://raw.githubusercontent.com/conshus/onboarding-tutorials/refs/heads/main/toolbar-app/app.ts',
  'app.ts'
);
