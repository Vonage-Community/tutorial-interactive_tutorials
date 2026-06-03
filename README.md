# Vonage Interactive Onboarding Tutorials


# Method 1: (In-browser)

Preferred and quickest way to creating a tutorial:

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/fork/github/Vonage-Community/tutorial-interactive_tutorials/tree/main/toolbar-app/)

Follow the steps in the Vonage Toolbar App

![Vonage Astro Toolbar](.github/images/toolbar.png)

For a step by step guide, please see the [documentation](https://docs.google.com/document/d/169riUGAp_mgKdI8zxN0pfMsoe2OI__Jw8FLYg1vN_dg/edit?usp=sharing)

# Method 2: (Locally)

## Authoring a Tutorial

### Setup

Clone the repo and install dependencies from the root:

```bash
git clone git@github.com:Vonage-Community/tutorial-interactive_tutorials.git
cd tutorial-interactive_tutorials
npm install
```

### Create a New Tutorial

Run the create command from the repo root:

```bash
npm run create-tutorial
```

You will be prompted for a tutorial name. You can also pass the name directly:

```bash
npm run create-tutorial -- messages_api-node-whatsapp
```

> Keep to the tutorial name taxonomy, `product_name-language-topic`. For example a Messages API WhatsApp tutorial in Node.js would be `messages_api-node-whatsapp`.

This will scaffold a new tutorial folder under `tutorials/` with the correct structure and placeholder content.

### Edit an Existing Tutorial

Run the edit command from the repo root:

```bash
npm run edit-tutorial
```

This will show an interactive list of tutorials to choose from. You can also pass the name directly:

```bash
npm run edit-tutorial -- messages_api-node-whatsapp
```

The command will:
1. Open the tutorial folder in VS Code
2. Start the Astro dev server
3. Open `http://localhost:4321` in your browser automatically

Press **Ctrl+C** in the terminal to stop the dev server.

### Create the Tutorial Content

The tutorials are static websites built with [Astro](https://astro.build). Use `npm run edit-tutorial` from the repo root to open your tutorial and start the dev server automatically, or start it manually from your tutorial's folder:

```bash
cd tutorials/your-tutorial-name
npm run dev
```

You can now edit the tutorial content in the `src` folder. Tutorials support markdown, markdoc, and HTML. Once you are done, add a small synopsis to the README.md file in your tutorial's folder.

### Using AI to Draft Tutorial Content

Every tutorial includes authoring instructions that guide AI tools to produce consistent output — correct file naming, structure, frontmatter, and Markdoc components — without any per-developer setup.

#### VS Code Copilot Chat / GitHub Copilot CLI

`.github/copilot-instructions.md` is automatically loaded for every Copilot conversation in the tutorial workspace. Just describe what you want and Copilot will follow the conventions.

To create a new step using the guided prompt:
1. Open Copilot Chat in VS Code
2. Run the command **`Chat: Use Prompt...`**
3. Select **`new-step`**
4. Answer the questions (step number, name, description, code)

Copilot will create the correctly named and formatted file in `src/content/docs/`.

#### OpenCode / OpenAI Codex CLI

`AGENTS.md` in the tutorial root is automatically read by OpenCode and Codex CLI. The same naming and structure rules apply — just describe the step you want.

#### Vim, Neovim, or any other AI tool

Include `AGENTS.md` as context for your AI tool. Most plugins support a `#file:` reference or a system prompt file. For example, with avante.nvim:

```lua
-- In your Neovim config or a project .nvim.lua:
require('avante').setup({ system_prompt = vim.fn.readfile('AGENTS.md') })
```

Or simply paste the contents of `AGENTS.md` into your tool's system prompt / context window.

#### Reference example

`src/content/docs/02-step-template.md` is an annotated example of a complete, well-formed tutorial step. Use it as a starting point or reference when writing manually.

### Create the Tutorial Config

The final part of creating a tutorial is to create a configuration file. This allows for the Vonage Cloud Runtime Workspace to be created for you and set up with the correct panels and files you need. There is a small app in the astro development toolbar to help you generate this file. 

![Vonage Astro Toolbar](.github/images/toolbar.png)

This will create a `tutorial-config.json` file. For example:

```json
{
  "files": [
    "send-sms.js" // The files needed for the tutorial
  ],
  "panels": [ 
    "terminal" // The panels needed. Options are "terminal" and "browser"
  ],
  "version": "1.0.0" // The version of the tutorial
}
```

> Make sure that you update the version of the tutorial in subsequent updates to the tutorial using [semver](https://semver.org) or your publishing step will fail. 

## Publishing a Tutorial

To publish your tutorial, create a PR to the repo with your changes. You can add the "Preview" label to your PR to generate a preview deploy of your tutorial. Once your PR is approved, merge it in to kick off the publishing workflow. After a few minutes a [release](https://github.com/Vonage-Community/tutorial-interactive_tutorials/releases) will automatically be created for you. This release contains a `ws.zip`. this is the zip file you need to upload to Code Hub as part of that process.

![Tutorial Release](.github/images/release.png)

## Updating a Tutorial

To update a tutorial:

* Make changes to the `src`.
* Update the configuration file either manually or with the toolbar app.
    * Ensure the version number is updated. 
* Create a PR

The rest of the steps are the same.
