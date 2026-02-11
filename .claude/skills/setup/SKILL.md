---
name: setup
description: Interactive setup wizard for AMPECO Custom Dashboard Widgets boilerplate. Guides through environment variables, dependency installation, dev server startup, and widget registration.
disable-model-invocation: true
allowed-tools: Bash(*), Read, Write(.env), Grep, Glob, AskUserQuestion
---

# /setup — AMPECO Custom Widget Local Development Setup Wizard

You are an interactive setup wizard. Guide the user step-by-step through configuring this AMPECO Custom Dashboard Widgets boilerplate for local development.

**Arguments:** `$ARGUMENTS`
- `--skip-check` — Skip the environment detection phase and go straight to Phase 1.
- `--resume` — Detect what's already configured, skip completed steps, and resume from the first incomplete phase.

**Behavior rules:**
- Be interactive: confirm each step before proceeding. Don't rush ahead.
- Detect existing state: if something is already configured correctly, acknowledge it and offer to skip or reconfigure.
- Never log full secrets. Mask tokens by showing only the first 4 and last 4 characters (e.g., `sk_l...xxxx`).
- Do NOT ask for confirmation before writing files. Once the user has provided the required values, just write the file and show what was written (with masked secrets). Only ask if you're about to **overwrite** an existing `.env` that already has different values.
- If a step fails, explain the likely cause, suggest a fix, and ask the user if they want to retry or skip.
- Use the `AskUserQuestion` tool for binary or multiple-choice decisions (e.g., "Skip to Phase 2?", "Kill process on port 3000?", "Update existing .env or keep it?"). This gives the user clickable options instead of requiring free-form text input.
- Read `.claude/skills/setup/setup-reference.md` for detailed troubleshooting when errors occur.

---

## Phase 0: Environment Detection

Run these checks and present a status summary table.

**Important:** When running checks in parallel with the Bash tool, ensure every command exits with code 0 — even when detecting "not found" states. If one parallel Bash call exits non-zero, sibling calls will cascade-fail with "Sibling tool call errored". Use `|| echo "not found"` or `|| true` patterns to guarantee exit code 0.

1. **Node.js**: Run `node --version`. Require `>= 20.9.0` (from `package.json` engines field). If missing or too old, stop and tell the user to install/upgrade Node.js (recommend `nvm` or the official installer). Do NOT proceed past this phase if Node.js is missing or below the required version.

2. **npm**: Run `npm --version` to confirm it's available.

3. **Existing `.env`**: Use the Read tool to check if `.env` exists in the project root. If it exists, note which variables are already set (without revealing secret values — mask them). If the file doesn't exist, the Read tool will return an error — that's fine, just report it as "not found".

4. **`node_modules`**: Check if the directory exists and if `@ampeco/ampeco-ui` is installed inside it (`node_modules/@ampeco/ampeco-ui/package.json`).

Present the results as a summary, for example:

```
Setup Status:
  Node.js:       v22.15.0 (meets >= 20.9.0)
  npm:           10.9.2
  .env:          exists (AMPECO_BASE_DOMAIN set, AMPECO_API_TOKEN set)
  node_modules:  exists (@ampeco/ampeco-ui installed)
```

If `--skip-check` is passed, skip this phase entirely.
If `--resume` is passed, use this detection to determine which phases to skip.

---

## Phase 1: Environment Variables

**Goal:** Create or update `.env` with all required variables.

### Step 1a: Check existing `.env`

If `.env` does NOT exist:
- It will be created in Step 1d after collecting all values. No need to copy `.env.example`.

If `.env` already exists:
- Read it and show which variables are set (mask secrets)
- Ask if the user wants to update it or keep it (this is the only confirmation needed since we'd be overwriting existing values)

### Step 1b: `AMPECO_BASE_DOMAIN`

1. Ask the user for their AMPECO tenant domain.
2. **Sanitize the input:**
   - Strip `https://` or `http://` prefix if present
   - Strip trailing `/` if present
   - Note: The runtime `normalizeDomain()` in `lib/config/ampeco.ts` strips protocol but does NOT strip trailing slashes, so we must catch that here.
3. **Verify connectivity:** Test the domain by fetching the JWKS endpoint. Use `-k` to skip SSL verification since dev environments (e.g., `.dev.ampeco.tech`) often have self-signed or invalid certificates:

```bash
curl -sk -o /dev/null -w "%{http_code}" "https://<domain>/.well-known/jwks.json"
```

   - **200**: Domain is reachable and the JWKS endpoint works.
   - **404/403**: Domain is reachable but JWKS endpoint not found. Warn but allow proceeding.
   - **000 or connection error**: Domain is not reachable. Ask the user to double-check.

### Step 1c: `AMPECO_API_TOKEN`

1. Ask the user for their AMPECO API token. Tell them it can be found at: **AMPECO Dashboard → Settings → API Tokens**.
2. When confirming, mask the token value.

### Step 1d: Write `.env`

Write (or update) the `.env` file with the required variables:

```
AMPECO_BASE_DOMAIN=<sanitized_domain>
AMPECO_API_TOKEN=<api_token>
NODE_ENV=development
```

Show the contents with masked secrets after writing.

---

## Phase 2: Install Dependencies & Start Dev Server

### Step 2a: npm install

1. Run `npm install`:

```bash
npm install
```

2. Handle common failures:
   - **ERESOLVE / dependency conflicts**: Suggest `npm install --legacy-peer-deps`. Ask before running.
   - **Missing build tools (macOS)**: If native module compilation fails, suggest installing Xcode CLI tools: `xcode-select --install`

3. Verify success by checking that `node_modules/@ampeco/ampeco-ui` exists.

### Step 2b: Verify dev server

**Goal:** Start the dev server temporarily to verify it works, then stop it and tell the user how to start it manually.

1. Check if port 3000 is already in use:

```bash
lsof -i :3000 -t
```

   - If a process is found, tell the user and ask if they want to kill it before proceeding.

2. Start the dev server in the background using the Bash tool with `run_in_background: true`:

```bash
npm run dev
```

   Note: This runs `next dev --turbo` (Turbopack). If port 3000 was in use, use `npm run dev -- --port <port>`.

3. Wait a few seconds for the server to start, then verify with a health check:

```bash
curl -s http://localhost:3000/api/health
```

   - Expected response: `{"status":"ok","timestamp":"...","service":"ampeco-custom-widget-template"}`
   - If the health check fails, wait a few more seconds and retry (the server may still be compiling).
   - If it still fails, read the background task output for error details.

4. Once the health check passes, **stop the dev server** by killing the process on port 3000:

```bash
lsof -ti :3000 | xargs kill
```

5. Tell the user: "The dev server starts correctly. When you're ready to develop, start it in a separate terminal with `npm run dev`."

---

## Phase 3: Widget Registration in AMPECO

**Goal:** Guide the user through registering their widget in the AMPECO tenant.

This phase is informational — provide step-by-step instructions:

1. **Navigate to the Marketplace:**
   - Log into your AMPECO tenant at `https://<AMPECO_BASE_DOMAIN>`
   - Go to **Marketplace** (in the left sidebar)
   - Click **Catalog**

2. **Find or install Custom Widgets:**
   - Look for **Custom Widgets** in the catalog
   - If not installed, click **Install**

3. **Create a new widget:**
   - Go to **Marketplace → Custom Widgets** (after installation)
   - Click **Create Widget** (or **Add**)
   - Fill in the details:
     - **Name:** Give your widget a descriptive name (e.g., "My Custom Dashboard")
     - **URL:** `http://localhost:3000/dashboard` (or whichever route you want to display)
     - **Enable Impersonation:** Toggle ON (recommended — this enables automatic data filtering based on admin permissions)

4. **Configure sandbox options:**
   - Enable: **Allow Scripts**, **Allow Forms**, **Allow Same Origin**
   - These are needed for the iframe to function properly

5. **Assign to a resource:**
   - Choose where the widget appears (e.g., Dashboard)
   - Save the configuration

6. Tell the user: "After saving, navigate to the resource where you assigned the widget. You should see the widget loaded in an iframe."

---

## Phase 4: Verification & Wrap-up

### Verify end-to-end

Guide the user through verifying everything works:

1. "Open the AMPECO page where you assigned the widget. The widget should load inside an iframe."
2. "If you see data loading, everything is working correctly!"

### Troubleshoot common issues

If the widget doesn't work, guide through these checks:

- **"Missing JWT token" error:** The widget URL needs to be loaded through the AMPECO iframe (which appends the JWT token). Directly visiting `http://localhost:3000/dashboard` will show this error — that's expected.
- **JWT verification failed:** Check that `AMPECO_BASE_DOMAIN` matches the tenant that issued the JWT. Also check that the widget's audience URL matches your dev server URL.
- **API 401/403 errors:** Verify `AMPECO_API_TOKEN` is correct and the token has the required permissions. If impersonation is enabled, ensure the widget registration has impersonation toggled on.
- **Blank iframe / CSP errors:** Check browser console for Content Security Policy errors. The AMPECO tenant needs to allow `http://localhost:3000` in its CSP.
- **CORS errors:** The dev server should handle CORS for local development. Check browser console for specifics.

### Final summary

Print a summary with all configured values (mask secrets):

```
Setup Complete!

  Tenant:          https://<domain>
  API Token:       sk_l...xxxx
  Dev Server:      http://localhost:3000
  Health Check:    http://localhost:3000/api/health

Useful commands:
  npm run dev          Start the development server
  npm run build        Build for production
  npm run lint         Run the linter
  npm run type-check   Run TypeScript type checks

Documentation:
  CLAUDE.md            Project context for AI agents
  README.md            Project documentation
  AMPECO API Docs:     https://developers.ampeco.com/
```
