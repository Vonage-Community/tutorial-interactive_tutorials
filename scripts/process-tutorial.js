const fs = require('fs-extra');
const path = require('path');
const unzipper = require('unzipper');
const { execSync } = require('child_process');

// --- CONFIGURATION ---
const REPO_OWNER = process.env.GITHUB_REPOSITORY_OWNER || "YourUsername";
const REPO_NAME = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : "YourRepo";
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const TUTORIALS_BASE = path.join(__dirname, '../tutorials');
const DEVCONTAINER_BASE = path.join(__dirname, '../.devcontainer');

async function main() {
    // 1. Detect Zip File
    if (!fs.existsSync(UPLOADS_DIR)) return console.log("No uploads directory found.");
    const files = fs.readdirSync(UPLOADS_DIR).filter(f => f.endsWith('.zip'));
    
    if (files.length === 0) return console.log("No zip files to process.");
    
    const zipFilename = files[0];
    const tutorialName = path.basename(zipFilename, '.zip').replace(/[^a-zA-Z0-9-_]/g, ''); 
    const targetDir = path.join(TUTORIALS_BASE, tutorialName);
    const tempZipDir = path.join(__dirname, '../temp_zip_staging'); 
    
    console.log(`🚀 Processing Tutorial: ${tutorialName}`);

    // 2. Extract Content to STAGING AREA
    fs.emptyDirSync(tempZipDir);
    fs.emptyDirSync(targetDir); 

    await fs.createReadStream(path.join(UPLOADS_DIR, zipFilename))
      .pipe(unzipper.Extract({ path: tempZipDir }))
      .promise();
    
    // FLATTEN LOGIC (If user zipped a folder instead of the files directly)
    const configName = 'tutorial-config.json';
    if (!fs.existsSync(path.join(tempZipDir, configName))) {
        const subdirs = fs.readdirSync(tempZipDir).filter(f => fs.statSync(path.join(tempZipDir, f)).isDirectory());
        if (subdirs.length === 1) {
            const nestedDir = path.join(tempZipDir, subdirs[0]);
            if (fs.existsSync(path.join(nestedDir, configName))) {
                console.log(`ℹ️  Found nested root. Flattening staging area...`);
                fs.copySync(nestedDir, tempZipDir);
                fs.removeSync(nestedDir);
            }
        }
    }

    console.log("✅ Zip extracted to staging area.");

    // 3. Load Tutorial Configuration
    const configPath = path.join(tempZipDir, configName);
    if (!fs.existsSync(configPath)) {
        console.error("❌ Error: tutorial-config.json not found in zip.");
        process.exit(1);
    }
    const tutorialConfig = fs.readJsonSync(configPath);

    // 4. CLONE EXTERNAL REPOSITORY (The "Base")
    const projectDir = path.join(targetDir, 'project');
    let hasExternalApp = false;
    fs.ensureDirSync(projectDir);

    if (tutorialConfig.repository) {
        console.log(`🌐 Cloning external source: ${tutorialConfig.repository}`);
        const tempCloneDir = path.join(__dirname, '../temp_clone');
        fs.emptyDirSync(tempCloneDir);

        try {
            execSync(`git clone ${tutorialConfig.repository} .`, { cwd: tempCloneDir, stdio: 'inherit' });
            fs.removeSync(path.join(tempCloneDir, '.git')); 
            fs.copySync(tempCloneDir, projectDir, { overwrite: true }); 
            console.log("✅ External code cloned into /project folder.");
            hasExternalApp = true;
        } catch (err) {
            console.error("❌ Failed to clone external repository:", err);
        } finally {
            fs.removeSync(tempCloneDir);
        }
    }

    // 5. THE OVERLAY (Apply Starter Files & Config on top of the cloned repo)
    console.log("📂 Applying starter files and configuration overlay...");
    fs.copySync(tempZipDir, targetDir, { overwrite: true });
    fs.removeSync(tempZipDir); 

    // --- SETUP SCRIPT MIGRATION & VALIDATION ---
    const legacySetup = path.join(targetDir, 'setup-tutorial.js');
    const newSetup = path.join(targetDir, 'setup-project.js');
    const destSetup = path.join(projectDir, 'setup-project.js');
    let hasSetupScript = false;

    if (fs.existsSync(legacySetup)) {
        fs.moveSync(legacySetup, destSetup, { overwrite: true });
    } else if (fs.existsSync(newSetup)) {
        fs.moveSync(newSetup, destSetup, { overwrite: true });
    }

    if (fs.existsSync(destSetup)) {
        const content = fs.readFileSync(destSetup, 'utf8').trim();
        
        if (content.length > 0) {
            hasSetupScript = true;
            console.log("📦 Valid setup script found and primed.");
        } else {
            console.log("ℹ️  Setup script is empty. Skipping setup step and cleaning up.");
            fs.removeSync(destSetup); 
            hasSetupScript = false;
        }
    }

    // 6. GENERATE BLANK FILES (Fallback for explicit blank files)
    if (tutorialConfig.files && Array.isArray(tutorialConfig.files)) {
        tutorialConfig.files.forEach(fileName => {
            const filePath = path.join(targetDir, fileName);
            fs.ensureFileSync(filePath); 
        });
    }

    // --- CONFIGURE ROOT PACKAGE.JSON ---
    const rootPackageJson = path.join(targetDir, 'package.json');
    if (fs.existsSync(rootPackageJson)) {
        const pkg = fs.readJsonSync(rootPackageJson);
        pkg.devDependencies = pkg.devDependencies || {};
        pkg.devDependencies["http-server"] = "^14.1.1";
        
        if (tutorialConfig.panels && tutorialConfig.panels.includes('browser') && !hasExternalApp) {
             pkg.devDependencies["live-server"] = "^1.2.2";
        }
        
        pkg.scripts = pkg.scripts || {};
        
        // This is kept here just in case you ever want to run it manually from the root, 
        // but the devcontainer will call the binary directly.
        pkg.scripts["start:tutorial"] = "http-server steps -p 1234 --cors -c-1";
        
        if (hasExternalApp) {
            pkg.scripts["postinstall"] = "cd project && npm install";
        }

        fs.writeJsonSync(rootPackageJson, pkg, { spaces: 2 });
    }

    // 7. Build Astro Starlight Project
    console.log("🔨 Building Astro Starlight project...");
    try {
        if (fs.existsSync(rootPackageJson)) {
            execSync('npm install && npm run build', { cwd: targetDir, stdio: 'inherit' });
            const buildDir = path.join(targetDir, 'dist'); 
            const stepsDir = path.join(targetDir, 'steps');
            if (fs.existsSync(buildDir)) {
                fs.moveSync(buildDir, stepsDir, { overwrite: true });
            }
        }
    } catch (e) {
        console.log("ℹ️  Skipping build step or build failed.");
    }

    // 8. Generate Dynamic devcontainer.json
    await generateDevContainer(tutorialName, tutorialConfig, hasExternalApp, hasSetupScript);

    // 9. Generate README
    const deepLink = `https://codespaces.new/${REPO_OWNER}/${REPO_NAME}?devcontainer_path=.devcontainer/${tutorialName}/devcontainer.json`;
    const readmeContent = `
# ${tutorialName}
Generated Tutorial Environment.

## Start Learning
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](${deepLink})

### Environment Details
- **Tutorial Steps**: Port 1234
- **Your Workspace**: \`tutorials/${tutorialName}\`
- **Project Code**: \`tutorials/${tutorialName}/project\`
    `;
    fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent);

    // 10. Cleanup
    fs.removeSync(path.join(UPLOADS_DIR, zipFilename));
    console.log("🧹 Cleanup complete.");
}

async function generateDevContainer(name, config, hasExternalApp, hasSetupScript) {
    const devContainerDir = path.join(DEVCONTAINER_BASE, name);
    fs.ensureDirSync(devContainerDir);

    // --- CONSTRUCT THE DAISY CHAIN COMMAND ---
    // 1. Start Tutorial Server (Backgrounded & Silenced)
    // We use direct path to run http-server directly, bypassing package.json scripts to avoid Astro conflicts
    let commandChain = "nohup ./node_modules/.bin/http-server steps -p 1234 --cors -c-1 > /dev/null 2>&1 & ";

    // 2. Prepare the directory
    if (hasSetupScript) {
        commandChain += "echo '' && cd project && node setup-project.js && ";
    } else if (hasExternalApp) {
        commandChain += "cd project && ";
    }

    // 3. Start Application
    if (hasExternalApp) {
        // Print the URL in the terminal after server starts
        const urlMsg = `\\n\\n🚀 APPLICATION READY:\\nhttps://\${CODESPACE_NAME}-3000.app.github.dev\\n\\n`;
        commandChain += `(sleep 4 && echo -e "${urlMsg}" &) && `;

        // 'gh' fix for visibility
        const visibilityCmd = "gh codespace ports visibility 3000:public -c $CODESPACE_NAME";
        commandChain += `(nohup sh -c "sleep 5 && ${visibilityCmd}" > /dev/null 2>&1 &) && `;

        // Run the project's start script
        commandChain += "npm start";
    } else if (config.panels && config.panels.includes('browser')) {
        // Fallback: If no external app but browser requested, run live-server (from root)
        if (!hasSetupScript) {
            const visibilityCmd = "gh codespace ports visibility 8080:public -c $CODESPACE_NAME";
            commandChain += `(nohup sh -c "sleep 5 && ${visibilityCmd}" > /dev/null 2>&1 &) && `;
             
            const urlMsg = `\\n\\n🚀 PREVIEW READY:\\nhttps://\${CODESPACE_NAME}-8080.app.github.dev\\n\\n`;
            commandChain += `(sleep 4 && echo -e "${urlMsg}" &) && `;

            commandChain += "./node_modules/.bin/live-server --port=8080 --no-browser > /dev/null 2>&1 & wait";
        }
    } else {
        // Keep container alive if nothing else is running
        commandChain += "wait";
    }

    // --- PORT CONFIGURATION ---
    const portsAttributes = {
        "1234": { "label": "Tutorial Guide", "onAutoForward": "openPreview" }
    };
    
    const forwardPortsList = ["1234"];

    if (config.panels && config.panels.includes('browser')) {
        portsAttributes["8080"] = {
            "label": "My Project Preview",
            "onAutoForward": "notify",
            "visibility": "public" 
        };
        forwardPortsList.push("8080");
    }

    if (hasExternalApp) {
        portsAttributes["3000"] = {
            "label": "My Backend Service",
            "onAutoForward": "notify",
            "visibility": "public"
        };
        forwardPortsList.push("3000");
    }

    // --- SMART FILE EXCLUSION LOGIC ---
    const defaultHidden = [
        "node_modules",
        "dist",
        "steps",
        ".devcontainer",
        ".vscode",
        "package.json",
        "package-lock.json",
        "tutorial-config.json",
        "tsconfig.json",
        "astro.config.mjs",
        ".git",
        ".DS_Store",
        "project/setup-project.js" 
    ];

    const filesExclude = {};
    
    // Create master list of explicitly allowed files
    const blankFiles = config.files || [];
    const starterFiles = config.starterFiles || [];
    const openFiles = config.openFiles || [];
    const allowedFiles = [...new Set([...blankFiles, ...starterFiles, ...openFiles])];

    defaultHidden.forEach(file => {
        if (!allowedFiles.includes(file)) {
            filesExclude[file] = true;
        }
    });

    const devContainerConfig = {
        "name": `Tutorial: ${name}`,
        "image": "mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm",
        "workspaceFolder": `/workspaces/${REPO_NAME}/tutorials/${name}`,
        "waitFor": "onCreateCommand",
        "updateContentCommand": "npm install", 
        "postCreateCommand": "",
        "postAttachCommand": commandChain, 
        
        "forwardPorts": forwardPortsList,
        "portsAttributes": portsAttributes,
        
        "features": {
             "ghcr.io/devcontainers/features/github-cli:1": {}
        },
        "customizations": {
            "vscode": {
                "extensions": [],
                "settings": {
                    "editor.formatOnSave": true,
                    "files.exclude": filesExclude
                }
            },
            "codespaces": {
                "openFiles": openFiles
            }
        }
    };

    fs.writeFileSync(path.join(devContainerDir, 'devcontainer.json'), JSON.stringify(devContainerConfig, null, 4));
    console.log(`✅ Generated devcontainer configuration in .devcontainer/${name}`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
