const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const examplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
  fs.copyFileSync(examplePath, envPath);
  console.log('Created project/.env from .env.example.');
}
