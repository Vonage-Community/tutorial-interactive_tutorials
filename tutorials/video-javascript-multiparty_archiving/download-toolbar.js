import fs from 'fs/promises';

async function downloadFile(url, filename) {
  console.log('downloading: ', filename);
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    await fs.mkdir('./vonage-toolbar', { recursive: true }); 
    
    await fs.writeFile(
      `./vonage-toolbar/${filename}`,
      Buffer.from(buffer)
    );
    
    console.log(`✅ File ${filename} downloaded and written successfully!`);
    
  } catch (error) {
    console.error(`❌ Error downloading/writing ${filename}:`, error);
  }
}

async function main() {
  console.log('download toolbar application files');

  await Promise.all([
    downloadFile(
      'https://raw.githubusercontent.com/vonage-community/tutorial-interactive_tutorials/refs/heads/main/toolbar-app/vonage-toolbar/integration.ts',
      'integration.ts'
    ),
    downloadFile(
      'https://raw.githubusercontent.com/vonage-community/tutorial-interactive_tutorials/refs/heads/main/toolbar-app/vonage-toolbar/app.ts',
      'app.ts'
    )
  ]);
  
  console.log('🎉 All downloads complete. Starting Astro...');
}

main();
