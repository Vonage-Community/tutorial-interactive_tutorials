const fs = require('fs-extra');
const path = require('path');
const unzipper = require('unzipper');
const { execSync } = require('child_process');

// --- CONFIGURATION ---
const REPO_OWNER = process.env.GITHUB_REPOSITORY_OWNER || "YourUsername";
const REPO_NAME = process.env.GITHUB_REPOSITORY? process.env.GITHUB_REPOSITORY.split('/')[1] : "YourRepo";
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const TUTORIALS_BASE = path.join(__dirname, '../tutorials');
const DEVCONTAINER_BASE = path.join(__dirname, '../.devcontainer');

async function main() {
    // 1. Detect Zip File
    if (!fs.existsSync(UPLOADS_DIR)) return console.log("No uploads directory found.");
    const files = fs.readdirSync(UPLOADS_DIR).filter(f => f.endsWith('.zip'));
    
    if (files.length === 0) return console.log("No zip files to process.");
    // console.log('files[0]: ',files[0])
    // Process the first found zip file
    const zipFilename = files[0];
    const tutorialName = path.basename(zipFilename, '.zip').replace(/[^a-zA-Z0-9-_]/g, ''); // Sanitize name
    const targetDir = path.join(TUTORIALS_BASE, tutorialName);
    
    console.log(`🚀 Processing Tutorial: ${tutorialName}`);

    // 2. Extract Content
    // Ensure clean target directory
    if (fs.existsSync(targetDir)) fs.removeSync(targetDir);
    fs.ensureDirSync(targetDir);

    await fs.createReadStream(path.join(UPLOADS_DIR, zipFilename))
      .pipe(unzipper.Extract({ path: targetDir }))
      .promise();
    
    console.log("✅ Extraction complete.");

    // Locate Project Root & Check package.json
    // Sometimes zips contain a root folder (e.g. my-app/package.json) instead of files at root.
    let projectRoot = targetDir;
    
    // Check if package.json exists at extraction root
    if (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
        console.log("ℹ️  package.json not found at root. Checking for nested directory...");
        // If not, check if there is a single subdirectory containing it
        let subdirs = fs.readdirSync(targetDir).filter(f => fs.statSync(path.join(targetDir, f)).isDirectory());
        console.log('subdirs.length before: ',subdirs.length);
        // FIX: Ignore the __MACOSX folder if it exists
        subdirs = subdirs.filter(dir => dir !== '__MACOSX');
        console.log('subdirs.length after: ',subdirs.length);
        if (subdirs.length === 1) {
            const nestedDir = path.join(targetDir, subdirs[0]);
            if (fs.existsSync(path.join(nestedDir, 'package.json'))) {
                console.log(`ℹ️  Found nested root in '${subdirs[0]}'. Flattening structure...`);
                // Move contents up to targetDir
                fs.copySync(nestedDir, targetDir);
                fs.removeSync(nestedDir);
            }
            // console.log(`ℹ️  Found project in subdirectory: ${subdirs}`);
        }
    } 


    // Explicit Check
    if (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
        console.error("❌ Error: package.json not found. Is this a valid Node.js project?");
        // Exit with error to fail the GitHub Action
        process.exit(1);
    }


    // 3. Load Tutorial Configuration
    const configPath = path.join(targetDir, 'tutorial-config.json');
    if (!fs.existsSync(configPath)) {
        console.error("❌ Error: tutorial-config.json not found in zip root.");
        throw new Error("tutorial-config.json missing in zip!");
        process.exit(1);
    }
    const tutorialConfig = fs.readJsonSync(configPath);

    // --- 3b. CLONE EXTERNAL REPOSITORY into project subfolder ---
    const projectDir = path.join(targetDir, 'project');
    let hasExternalApp = false;

    // Ensure project dir exists even if we don't clone (for setup script destination)
    fs.ensureDirSync(projectDir);

    if (tutorialConfig.repository) {
        console.log(`🌐 Cloning external source: ${tutorialConfig.repository}`);
        const tempDir = path.join(__dirname, '../temp_clone');
        
        // Clean temp dir
        if (fs.existsSync(tempDir)) fs.removeSync(tempDir);
        fs.ensureDirSync(tempDir);

        try {
            // Clone to temp folder
            execSync(`git clone ${tutorialConfig.repository} .`, { cwd: tempDir, stdio: 'inherit' });
            
            // Remove .git folder so it becomes just a pile of files, not a sub-repo
            fs.removeSync(path.join(tempDir, '.git'));
            
            // Copy files to targetDir, but DO NOT overwrite existing files 
            // (Preserves your tutorial-config.json and steps folder)
            fs.copySync(tempDir, projectDir, { overwrite: false });
            
            console.log("✅ External code cloned into /project subfolder.");
            hasExternalApp = true;
        } catch (err) {
            console.error("❌ Failed to clone external repository:", err);
            // We don't exit here, in case the zip has enough content to run anyway
        } finally {
            fs.removeSync(tempDir);
        }
    }    

    // --- NEW: SETUP SCRIPT MIGRATION ---
    // Check for setup-tutorial.js OR setup-project.js in root and move to project/setup-project.js
    const legacySetup = path.join(targetDir, 'setup-tutorial.js');
    const newSetup = path.join(targetDir, 'setup-project.js');
    const destSetup = path.join(projectDir, 'setup-project.js');
    let hasSetupScript = false;

    // Helper to check and move
    const processSetupFile = (srcPath) => {
        const content = fs.readFileSync(srcPath, 'utf8').trim();
        if (content.length > 0) {
            fs.moveSync(srcPath, destSetup, { overwrite: true });
            console.log("📦 Found active setup script -> project/setup-project.js");
            return true;
        } else {
            // If empty, just remove it so it doesn't clutter
            fs.removeSync(srcPath);
            console.log("ℹ️  Setup script is empty. Skipping setup steps.");
            return false;
        }
    };

    if (fs.existsSync(legacySetup)) {
        hasSetupScript = processSetupFile(legacySetup);
    } else if (fs.existsSync(newSetup)) {
        hasSetupScript = processSetupFile(newSetup);
    }

    // --- CONFIGURE ROOT PACKAGE.JSON ---
    const rootPackageJson = path.join(targetDir, 'package.json');
    
    if (fs.existsSync(rootPackageJson)) {
        const pkg = fs.readJsonSync(rootPackageJson);
        
        pkg.devDependencies = pkg.devDependencies || {};
        pkg.devDependencies["http-server"] = "^14.1.1";
        // We add live-server as a fallback for pure frontend tutorials
        if (tutorialConfig.panels && tutorialConfig.panels.includes('browser') && !hasExternalApp) {
             pkg.devDependencies["live-server"] = "^1.2.2";
        }
        
        pkg.scripts = pkg.scripts || {};
        
        // 1. The Tutorial Server Script (Runs in background)
        pkg.scripts["start:tutorial"] = "http-server steps -p 1234 --cors -c-1";
        
        // 2. The Post-Install Script (Installs project deps)
        if (hasExternalApp) {
            pkg.scripts["postinstall"] = "cd project && npm install";
        }

        fs.writeJsonSync(rootPackageJson, pkg, { spaces: 2 });
        console.log("📦 Root package.json configured.");
    }

    // 4. Build Astro Starlight Project
    console.log("🔨 Building Astro Starlight project...");
    try {
        // Install dependencies and build. 
        // Assumes the zip root is the Astro project root.
        execSync('npm install && npm run build', { 
            cwd: targetDir, 
            stdio: 'inherit' 
        });
        
        // Move the 'dist' folder to 'steps' as requested
        const buildDir = path.join(targetDir, 'dist'); 
        const stepsDir = path.join(targetDir, 'steps');
        if (fs.existsSync(buildDir)) {
            fs.moveSync(buildDir, stepsDir, { overwrite: true });
            console.log("✅ Build successful. Output moved to /steps.");
        } else {
            console.error("⚠️  Build finished but 'dist' folder was not found.");
        }
    } catch (e) {
        console.error("❌ Astro build failed:", e.message);
        // We continue to generate files even if build fails, to allow debugging
    }

    // 5. Generate User Files (Boilerplate e.g., index.html, app.js)
    if (tutorialConfig.files && Array.isArray(tutorialConfig.files)) {
        tutorialConfig.files.forEach(fileName => {
            const filePath = path.join(targetDir, fileName);
            // if (!fs.existsSync(filePath)) {
                // fs.outputFileSync automatically creates directories if the filename includes them (e.g. "css/style.css")
                // If the filename is just "index.html", it simply creates it in the root.
                fs.outputFileSync(filePath, `\n`);
                // fs.writeFileSync(filePath, `\n`);
                console.log(`📄 Created placeholder: ${fileName}`);
            // }
        });
    }
    
    // 6. Generate Dynamic devcontainer.json
    await generateDevContainer(tutorialName, tutorialConfig, hasExternalApp, hasSetupScript);

    // 7. Generate README with Launch Button
    // This deep link points to the specific devcontainer configuration folder
    const deepLink = `https://codespaces.new/${REPO_OWNER}/${REPO_NAME}?devcontainer_path=.devcontainer/${tutorialName}/devcontainer.json`;
    
    const readmeContent = `
# ${tutorialName}

This tutorial environment has been automatically generated.

## Start Learning
Click the button below to launch a configured Codespace for this tutorial.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](${deepLink})

### Environment Details
- **Tutorial Steps**: Available in the preview pane (Port 1234).
- **Your Workspace**: Located in \`tutorials/${tutorialName}\`.
- **Project Code**: Located in \`tutorials/${tutorialName}/project\`.
    `;
    fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent);

    // 8. Cleanup
    fs.removeSync(path.join(UPLOADS_DIR, zipFilename));
    console.log("🧹 Cleanup complete. Zip file removed.");
}


function generateTasksJson(targetDir) {
    const vscodeDir = path.join(targetDir, '.vscode');
    fs.ensureDirSync(vscodeDir);

    const tasksConfig = {
        "version": "2.0.0",
        "tasks": [
            {
                "label": "Start Tutorial Environment",
                "type": "npm",
                "script": "start", // Runs the 'npm start' script we injected earlier
                "isBackground": true, // Keeps it running in background but visible in terminal
                "problemMatcher": {
                    "owner": "custom",
                    "pattern": {
                        "regexp": "^$"
                    },
                    "background": {
                        "activeOnStart": true,
                        "beginsPattern": "Starting up",
                        "endsPattern": "Available on"
                    }
                },
                "presentation": {
                    "reveal": "always",
                    "panel": "dedicated",
                    "group": "terminals"
                },
                "runOptions": {
                    "runOn": "folderOpen" // This makes it start automatically!
                }
            }
        ]
    };

    fs.writeFileSync(
        path.join(vscodeDir, 'tasks.json'),
        JSON.stringify(tasksConfig, null, 4)
    );
    console.log("✅ Generated .vscode/tasks.json");
}


async function generateDevContainer(name, config, hasExternalApp, hasSetupScript) {
    const devContainerDir = path.join(DEVCONTAINER_BASE, name);
    fs.ensureDirSync(devContainerDir);

    // --- CONSTRUCT THE DAISY CHAIN COMMAND ---
    // 1. Start Tutorial Server (Backgrounded & Silenced)

    // We use npx (or direct path) to run http-server directly, bypassing package.json scripts
    // This guarantees we serve the static 'steps' folder and never trigger 'astro dev'
    let commandChain = "nohup ./node_modules/.bin/http-server steps -p 1234 --cors -c-1 > /dev/null 2>&1 & ";

    // 2. Prepare the directory
    if (hasSetupScript) {
        commandChain += "echo '' && cd project && node setup-project.js && ";
    } else if (hasExternalApp) {
        commandChain += "cd project && ";
    }

    // 3. Start Application
    if (hasExternalApp) {
        // --- Print the URL in the terminal after server starts ---
        // We use $CODESPACE_NAME to build the standard GitHub Codespaces URL.
        // We sleep for 4 seconds so this message appears AFTER the server startup logs.
        const urlMsg = `\\n\\n🚀 APPLICATION READY:\\nhttps://\${CODESPACE_NAME}-3000.app.github.dev\\n\\n`;
        // commandChain += `nohup sh -c "sleep 4 && echo '${urlMsg}'" > /dev/null 2>&1 & `;
        // commandChain += `(nohup sh -c "sleep 4 && echo '${urlMsg}'" > /dev/null 2>&1 &) && `;
        commandChain += `(sleep 4 && echo -e "${urlMsg}" &) && `;

        // --- RESTORED: Your working 'gh' fix for visibility ---
        // You mentioned this was the only way it worked, so we keep it!
        const visibilityCmd = "gh codespace ports visibility 3000:public -c $CODESPACE_NAME";
        // commandChain += `nohup sh -c "sleep 5 && ${visibilityCmd}" > /dev/null 2>&1 & `;
        commandChain += `(nohup sh -c "sleep 5 && ${visibilityCmd}" > /dev/null 2>&1 &) && `;

        // Run the project's start script (This blocks the terminal)
        commandChain += "npm start";
    } else if (config.panels && config.panels.includes('browser')) {
        // Fallback: If no external app but browser requested, run live-server (from root)
        // Note: We need to be careful with 'cd' above. 
        // If we didn't cd into project, we run this from root.
        if (!hasSetupScript) {

            const visibilityCmd = "gh codespace ports visibility 8080:public -c $CODESPACE_NAME";
             commandChain += `(nohup sh -c "sleep 5 && ${visibilityCmd}" > /dev/null 2>&1 &) && `;
             
             // We can also print the link for the frontend fallback if you like
             const urlMsg = `\\n\\n🚀 PREVIEW READY:\\nhttps://\${CODESPACE_NAME}-8080.app.github.dev\\n\\n`;
            //  commandChain += `(nohup sh -c "sleep 4 && echo '${urlMsg}'" > /dev/null 2>&1 &) && `;
             commandChain += `(sleep 4 && echo -e "${urlMsg}" &) && `;

            //  commandChain += "live-server --port=8080 --no-browser > /dev/null 2>&1 & wait";
             commandChain += "./node_modules/.bin/live-server --port=8080 --no-browser > /dev/null 2>&1 & wait";
        }
    } else {
        // If nothing else to run, just wait to keep container alive
        commandChain += "wait";
    }

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
        "__MACOSX",
        "README.md",
        "markdoc.config.mjs",
        "project/setup-project.js" // Hide the moved setup script
    ];

    const filesExclude = {};
    const userFiles = config.files || [];

    defaultHidden.forEach(file => {
        if (!userFiles.includes(file)) {
            filesExclude[file] = true;
        }
    });

    // --- CONSTRUCT OPEN FILES LIST ---
    // 1. Get 'files' (The ones we created/touched)
    const filesToCreate = config.files || [];
    
    // 2. Get 'openFiles' (The ones existing in the repo we just want to open)
    const filesToOpen = config.openFiles || [];
    
    // 3. Merge them and remove duplicates
    // We do NOT add logic to prepend 'project/'. We trust the config is explicit.
    const uniqueFiles = [...new Set([...filesToCreate, ...filesToOpen])];


    const devContainerConfig = {
        "name": `Tutorial: ${name}`,
        "image": "mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm",
        "workspaceFolder": `/workspaces/${REPO_NAME}/tutorials/${name}`,
        
        "waitFor": "onCreateCommand",
        "updateContentCommand": "npm install",
        "postCreateCommand": "",
        
        // THE MAGIC CHAIN
        "postAttachCommand": commandChain, 

        "forwardPorts": forwardPortsList,

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
                "openFiles": uniqueFiles.filter(f => f !== "README.md")
            }
        },
        "portsAttributes": portsAttributes
    };

    fs.writeFileSync(path.join(devContainerDir, 'devcontainer.json'), JSON.stringify(devContainerConfig, null, 4));
    console.log(`✅ Generated devcontainer configuration in .devcontainer/${name}`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
