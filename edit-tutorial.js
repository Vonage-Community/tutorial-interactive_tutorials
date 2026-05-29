import fs from 'fs/promises';
import path from 'path';
import readline from 'readline/promises';
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TUTORIALS_DIR = path.join(__dirname, 'tutorials');

// Entries in tutorials/ that aren't actual tutorials
const SKIP = new Set(['00_Starter-Tutorial', 'node_modules', 'package.json', 'package-lock.json', 'download-toolbar.js']);

function openBrowser(url) {
    const cmd = process.platform === 'win32' ? 'start'
        : process.platform === 'darwin' ? 'open'
        : 'xdg-open';
    try {
        execSync(`${cmd} ${url}`, { stdio: 'ignore' });
    } catch {
        console.log(`\n  ℹ️  Couldn't auto-open browser. Visit: ${url}\n`);
    }
}

async function listTutorials() {
    const entries = await fs.readdir(TUTORIALS_DIR, { withFileTypes: true });
    return entries
        .filter(e => e.isDirectory() && !SKIP.has(e.name))
        .map(e => e.name)
        .sort();
}

async function pickTutorial(tutorials) {
    if (tutorials.length === 0) {
        console.error('\n❌ No tutorials found in tutorials/. Run `npm run create-tutorial` first.\n');
        process.exit(1);
    }

    console.log('\nAvailable tutorials:\n');
    tutorials.forEach((name, i) => console.log(`  ${String(i + 1).padStart(2)}. ${name}`));

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        while (true) {
            const answer = (await rl.question('\nEnter a number or tutorial name: ')).trim();
            const byIndex = parseInt(answer, 10);
            if (!isNaN(byIndex) && byIndex >= 1 && byIndex <= tutorials.length) {
                return tutorials[byIndex - 1];
            }
            if (tutorials.includes(answer)) {
                return answer;
            }
            console.log(`  Not a valid choice. Enter a number (1–${tutorials.length}) or an exact name.`);
        }
    } finally {
        rl.close();
    }
}

async function main() {
    console.log('\n✏️  Vonage Tutorial Editor\n');

    const tutorials = await listTutorials();

    // Resolve tutorial name: argument → interactive list
    let name = process.argv[2];
    if (name) {
        if (!tutorials.includes(name)) {
            console.error(`\n❌ Tutorial "${name}" not found. Available tutorials:\n`);
            tutorials.forEach(t => console.error(`   - ${t}`));
            console.error('');
            process.exit(1);
        }
    } else {
        name = await pickTutorial(tutorials);
    }

    const tutorialDir = path.join(TUTORIALS_DIR, name);

    console.log(`\n📂 Opening: tutorials/${name}`);

    // 1. Open VS Code (non-blocking)
    try {
        execSync(`code "${tutorialDir}"`, { stdio: 'ignore' });
        console.log('✅ Opened in VS Code');
    } catch {
        console.log('⚠️  Could not open VS Code (is the `code` CLI installed?)');
    }

    // 2. Install deps if node_modules is missing
    const nodeModules = path.join(tutorialDir, 'node_modules');
    try {
        await fs.access(nodeModules);
    } catch {
        console.log('📦 Installing dependencies...');
        execSync('npm install', { cwd: tutorialDir, stdio: 'inherit' });
    }

    // 3. Spawn dev server, watch for ready signal, then open browser
    console.log('\n🚀 Starting dev server (Ctrl+C to stop)...\n');

    let browserOpened = false;
    const devServer = spawn('npm', ['run', 'dev'], {
        cwd: tutorialDir,
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
    });

    const tryOpenBrowser = (chunk) => {
        const text = chunk.toString();
        process.stdout.write(text);
        if (!browserOpened && text.includes('localhost:')) {
            browserOpened = true;
            setTimeout(() => {
                console.log('\n🌐 Opening http://localhost:4321 ...\n');
                openBrowser('http://localhost:4321');
            }, 500);
        }
    };

    devServer.stdout.on('data', tryOpenBrowser);
    devServer.stderr.on('data', (chunk) => {
        const text = chunk.toString();
        process.stderr.write(text);
        if (!browserOpened && text.includes('localhost:')) {
            tryOpenBrowser(chunk);
        }
    });

    devServer.on('close', (code) => {
        if (code !== 0 && code !== null) {
            console.error(`\n❌ Dev server exited with code ${code}\n`);
            process.exit(code);
        }
    });

    // Forward Ctrl+C cleanly
    process.on('SIGINT', () => {
        devServer.kill('SIGINT');
        process.exit(0);
    });
}

main().catch(err => {
    console.error('\n❌', err.message);
    process.exit(1);
});
