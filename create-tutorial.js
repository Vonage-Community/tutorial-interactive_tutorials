import fs from 'fs/promises';
import path from 'path';
import readline from 'readline/promises';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TUTORIALS_DIR = path.join(__dirname, 'tutorials');
const STARTER_DIR = path.join(TUTORIALS_DIR, '00_Starter-Tutorial');

// Folders/files to skip when copying the starter template
const SKIP = new Set(['.astro', 'node_modules', 'vonage-toolbar', 'dist']);

const NAME_PATTERN = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/;
const NAME_EXAMPLE = 'product_name-language-topic  (e.g. messages_api-node-sms)';

function toTitle(name) {
    return name
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}

async function copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    for (const entry of await fs.readdir(src, { withFileTypes: true })) {
        if (SKIP.has(entry.name)) continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

async function replaceInFile(filePath, replacements) {
    let content = await fs.readFile(filePath, 'utf8');
    for (const [from, to] of replacements) {
        content = content.replaceAll(from, to);
    }
    await fs.writeFile(filePath, content);
}

async function getTutorialName() {
    // Accept name as CLI argument: npm run create-tutorial -- my-tutorial
    const arg = process.argv[2];
    if (arg) {
        if (!NAME_PATTERN.test(arg)) {
            console.error(`\n❌ Invalid name "${arg}". Use lowercase letters, numbers, hyphens, and underscores.`);
            console.error(`   Format: ${NAME_EXAMPLE}\n`);
            process.exit(1);
        }
        return arg;
    }

    // Interactive prompt
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        while (true) {
            const name = (await rl.question(`\nTutorial name (${NAME_EXAMPLE}): `)).trim();
            if (!name) {
                console.log('  Name cannot be empty.');
                continue;
            }
            if (!NAME_PATTERN.test(name)) {
                console.log('  Use only lowercase letters, numbers, hyphens, and underscores.');
                continue;
            }
            return name;
        }
    } finally {
        rl.close();
    }
}

async function main() {
    console.log('\n🎓 Vonage Tutorial Creator\n');

    const name = await getTutorialName();
    const title = toTitle(name);
    const dest = path.join(TUTORIALS_DIR, name);

    // Guard: already exists
    try {
        await fs.access(dest);
        console.error(`\n❌ "${name}" already exists at tutorials/${name}\n`);
        process.exit(1);
    } catch {
        // Expected — folder does not exist yet
    }

    console.log(`\n📋 Creating tutorial: ${name}`);
    console.log(`   Title:  ${title}`);
    console.log(`   Folder: tutorials/${name}\n`);

    // 1. Copy starter template
    await copyDir(STARTER_DIR, dest);
    console.log('✅ Copied starter template');

    // 2. Update astro.config.mjs title
    await replaceInFile(path.join(dest, 'astro.config.mjs'), [
        ['Vonage Onboarding', title],
    ]);
    console.log('✅ Updated astro.config.mjs');

    // 3. Update index.mdx
    await replaceInFile(path.join(dest, 'src/content/docs/index.mdx'), [
        ['Starter Tutorial', title],
        ['Get started building a tutorial.', `Get started with ${title}.`],
        ['Starting a tutorial!', `Starting ${title}!`],
    ]);
    console.log('✅ Updated index.mdx');

    // 4. Update 01-welcome.md
    await replaceInFile(path.join(dest, 'src/content/docs/01-welcome.md'), [
        ['Starter Tutorial', title],
        ['This is a paragraph about what the tutorial contains.', `Welcome to the ${title} tutorial.`],
    ]);
    console.log('✅ Updated 01-welcome.md');

    // 5. Update README.md
    await replaceInFile(path.join(dest, 'README.md'), [
        ['Starter Onboarding Tutorial', title],
        ['This is a starter tutorial.', `Tutorial: ${title}`],
    ]);
    console.log('✅ Updated README.md');

    // 6. Update package.json name
    await replaceInFile(path.join(dest, 'package.json'), [
        ['"vonage-interactive-tutorial"', `"${name}"`],
    ]);
    console.log('✅ Updated package.json');

    console.log('\n✅ Tutorial created successfully!\n');

    // Ask if they want to start editing right away
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    let startEditing = false;
    try {
        const answer = (await rl.question('🚀 Start editing now? (Y/n): ')).trim().toLowerCase();
        startEditing = answer === '' || answer === 'y' || answer === 'yes';
    } finally {
        rl.close();
    }

    if (startEditing) {
        console.log('');
        spawn('node', ['edit-tutorial.js', name], {
            cwd: __dirname,
            stdio: 'inherit',
        });
    } else {
        console.log(`
Next steps:

   cd tutorials/${name}
   npm run dev

   Or run: npm run edit-tutorial -- ${name}
`);
    }
}

main().catch(err => {
    console.error('\n❌', err.message);
    process.exit(1);
});
