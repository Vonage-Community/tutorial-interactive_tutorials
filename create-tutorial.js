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

async function writeTutorialConfig(dest, config) {
    await fs.writeFile(
        path.join(dest, 'tutorial-config.json'),
        JSON.stringify(config, null, 2)
    );
}

async function main() {
    console.log('\n🎓 Vonage Tutorial Creator\n');

    // Single readline instance — collect ALL answers before any async scaffolding
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const ask = (q) => rl.question(q);
    const yesNo = async (question, defaultYes = true) => {
        const hint = defaultYes ? '(Y/n)' : '(y/N)';
        const answer = (await ask(`${question} ${hint}: `)).trim().toLowerCase();
        if (answer === '') return defaultYes;
        return answer === 'y' || answer === 'yes';
    };
    const collectList = async (prompt) => {
        const items = [];
        while (true) {
            const value = (await ask(prompt)).trim();
            if (!value) break;
            items.push(value);
        }
        return items;
    };

    let name, title, dest, config, startEditing;

    try {
        // --- Tutorial name ---
        name = process.argv[2];
        if (name) {
            if (!NAME_PATTERN.test(name)) {
                console.error(`\n❌ Invalid name "${name}". Use lowercase letters, numbers, hyphens, and underscores.`);
                console.error(`   Format: ${NAME_EXAMPLE}\n`);
                process.exit(1);
            }
        } else {
            while (true) {
                name = (await ask(`Tutorial name (${NAME_EXAMPLE}): `)).trim();
                if (!name) { console.log('  Name cannot be empty.'); continue; }
                if (!NAME_PATTERN.test(name)) { console.log('  Use only lowercase letters, numbers, hyphens, and underscores.'); continue; }
                break;
            }
        }

        title = toTitle(name);
        dest = path.join(TUTORIALS_DIR, name);

        // Guard: already exists
        try {
            await fs.access(dest);
            console.error(`\n❌ "${name}" already exists at tutorials/${name}\n`);
            process.exit(1);
        } catch { /* expected */ }

        // --- Toolbar config: steps 1–4 (ask before scaffolding so stdin stays open) ---
        console.log(`\n📋 Tutorial: ${name}  (${title})`);
        console.log('⚙️  Answer a few questions to configure it:\n');

        // Step 1: Panels
        const panels = [];
        if (await yesNo('Step 1: Does this tutorial need a Terminal panel?')) panels.push('terminal');
        if (await yesNo('Step 1: Does this tutorial need a Preview Browser panel?', false)) panels.push('browser');

        // Step 2: External repository
        console.log('');
        const repository = (await ask('Step 2: External repository URL? (press Enter to skip): ')).trim();

        // Step 3: Starter files
        console.log('\nStep 3: Starter files (pre-populated files with scaffolding code).');
        console.log('        Press Enter with no input when done.');
        const starterFiles = await collectList('  Starter file: ');

        // Step 4: Files to open
        console.log('\nStep 4: Files to open in the editor when the tutorial starts.');
        console.log('        Press Enter with no input when done.');
        const openFiles = await collectList('  File to open: ');

        config = { files: [], openFiles, panels, repository, starterFiles, capabilities: [], version: '0.0.1', filename: name };

        // Ask about editing before closing readline
        console.log('');
        startEditing = await yesNo('🚀 Start editing when ready?');
    } finally {
        rl.close();
    }

    // --- Scaffold (after all input collected) ---
    console.log(`\n📂 Creating tutorials/${name}...\n`);

    await copyDir(STARTER_DIR, dest);
    console.log('✅ Copied starter template');

    await replaceInFile(path.join(dest, 'astro.config.mjs'), [['Vonage Onboarding', title]]);
    console.log('✅ Updated astro.config.mjs');

    await replaceInFile(path.join(dest, 'src/content/docs/index.mdx'), [
        ['Starter Tutorial', title],
        ['Get started building a tutorial.', `Get started with ${title}.`],
        ['Starting a tutorial!', `Starting ${title}!`],
    ]);
    console.log('✅ Updated index.mdx');

    await replaceInFile(path.join(dest, 'src/content/docs/01-welcome.md'), [
        ['Starter Tutorial', title],
        ['This is a paragraph about what the tutorial contains.', `Welcome to the ${title} tutorial.`],
    ]);
    console.log('✅ Updated 01-welcome.md');

    await replaceInFile(path.join(dest, 'README.md'), [
        ['Starter Onboarding Tutorial', title],
        ['This is a starter tutorial.', `Tutorial: ${title}`],
    ]);
    console.log('✅ Updated README.md');

    await replaceInFile(path.join(dest, 'package.json'), [
        ['"vonage-interactive-tutorial"', `"${name}"`],
    ]);
    console.log('✅ Updated package.json');

    await writeTutorialConfig(dest, config);
    console.log('✅ Created tutorial-config.json');

    console.log('\n✅ Tutorial created successfully!\n');

    if (startEditing) {
        spawn('node', ['edit-tutorial.js', name], { cwd: __dirname, stdio: 'inherit' });
    } else {
        console.log(`Next steps:\n\n   npm run edit-tutorial -- ${name}\n`);
    }
}

main().catch(err => {
    console.error('\n❌', err.message);
    process.exit(1);
});

