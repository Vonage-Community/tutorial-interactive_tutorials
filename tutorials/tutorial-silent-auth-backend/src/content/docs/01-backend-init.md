---
title: "Project Setup"
description: "Create the server folder, initialise npm, install dependencies, and set up .gitignore."
step: 1
---

In this step you'll create the backend project. 

---

## Install dependencies

Open a terminal in **GitHub Codespaces** and install the project dependencies:

```bash
npm install express cors dotenv @vonage/auth @vonage/verify2
```

Here's what each package does:

| Package | Purpose |
|---------|---------|
| `express` | HTTP web framework — handles routing and middleware |
| `cors` | Allows the Android app (a different origin) to call this API |
| `dotenv` | Loads environment variables from `.env` into `process.env` |
| `@vonage/auth` | Handles JWT-based authentication with the Vonage API |
| `@vonage/verify2` | The Vonage Verify v2 SDK — start verifications, check codes |

---

## Set up `.gitignore`

Two things must never end up in git: `node_modules` and your credentials.

Create a `.gitignore` file inside `workspace/` and add the following:

```
node_modules
.env
private.key
```

Or run these commands directly in the terminal:

```bash
echo "node_modules" >> .gitignore
echo ".env" >> .gitignore
echo "private.key" >> .gitignore
```

---

## Your project structure so far

```
workspace/
├── node_modules/        ← installed packages (ignored by git)
├── server.js
├── .gitignore
└── package.json
```

---

## Checkpoint

Before moving on, confirm:

- [ ] `workspace/package.json` exists
- [ ] `workspace/node_modules/` exists and contains `express`, `@vonage/auth`, `@vonage/verify2`
- [ ] `workspace/.gitignore` has `node_modules`, `.env`, and `private.key`

Run this to confirm the key packages are present:

```bash
ls node_modules | grep -E "express|vonage|dotenv|cors"
```

You should see entries for `express`, `cors`, `dotenv`, `@vonage` (as a scoped folder).
