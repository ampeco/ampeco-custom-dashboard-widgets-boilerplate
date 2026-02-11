---
name: setup
description: Interactive setup wizard for AMPECO Custom Dashboard Widgets boilerplate. Guides through environment variables, dependency installation, dev server startup, and widget registration.
disable-model-invocation: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - AskUserQuestion
  # All setup phase scripts (patterns use * prefix to match both relative and absolute paths)
  - Bash(bash *setup/scripts/check-env.sh*)
  - Bash(bash *setup/scripts/verify-domain.sh*)
  - Bash(bash *setup/scripts/install-deps.sh*)
  - Bash(bash *setup/scripts/verify-dev-server.sh*)
  - Bash(bash *setup/scripts/kill-port.sh*)
  - Bash(bash *setup/scripts/write-env.sh*)
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

**Important — use the setup scripts for ALL shell operations:**
All bash commands are wrapped in scripts under `.claude/skills/setup/scripts/`. Always use `bash .claude/skills/setup/scripts/<script>.sh [args]` instead of running raw shell commands. This ensures all commands are pre-allowed and the user is not prompted for permission.

Available scripts:
- `check-env.sh` — Phase 0: environment detection (node, npm, .env, node_modules)
- `verify-domain.sh <domain>` — Phase 1: sanitize domain and check JWKS endpoint
- `install-deps.sh [--legacy-peer-deps]` — Phase 2a: npm install + verify
- `verify-dev-server.sh [port]` — Phase 2b: start dev server, health check, stop (default port: 3000)
- `kill-port.sh <port>` — Kill process on a given port
- `write-env.sh <domain> <api_token>` — Phase 1d: write .env file (creates or updates)

---

## Phase 0: Environment Detection

Run the environment check script:

```bash
bash .claude/skills/setup/scripts/check-env.sh
```

The script outputs `key=value` pairs. Parse them and present a formatted summary:

```
Setup Status:
  Node.js:       v22.15.0 (meets >= 20.9.0)
  npm:           10.9.2
  .env:          exists (AMPECO_BASE_DOMAIN set, AMPECO_API_TOKEN set)
  node_modules:  exists (@ampeco/ampeco-ui installed)
```

- If `node_version=not_found` or the version is below `20.9.0`, stop and tell the user to install/upgrade Node.js (recommend `nvm` or the official installer). Do NOT proceed past this phase.
- If `--skip-check` is passed, skip this phase entirely.
- If `--resume` is passed, use this detection to determine which phases to skip.

---

## Phase 1: Environment Variables

**Goal:** Create or update `.env` with all required variables.

### Step 1a: Check existing `.env`

If `.env` does NOT exist (check-env reported `env_file=not_found`):
- It will be created in Step 1d after collecting all values. No need to copy `.env.example`.

If `.env` already exists:
- Read it and show which variables are set (mask secrets)
- Ask if the user wants to update it or keep it (this is the only confirmation needed since we'd be overwriting existing values)

### Step 1b: `AMPECO_BASE_DOMAIN`

**Directly ask for the value** — do NOT use AskUserQuestion here. Just output a text prompt like:

> Please enter your AMPECO tenant domain (e.g., `demo.charge.ampeco.tech`, without `https://`):

The user will type their domain as the next message. Once received, verify connectivity:

```bash
bash .claude/skills/setup/scripts/verify-domain.sh "<user_input>"
```

The script sanitizes the input (strips protocol and trailing slashes) and checks the JWKS endpoint. Parse the output:
- `sanitized_domain=<clean_domain>` — use this value for `.env`
- `http_status=200` — domain is reachable, JWKS works
- `http_status=404` or `403` — domain reachable but JWKS not found. Warn but allow proceeding.
- `http_status=000` or connection error — domain not reachable. Ask the user to double-check.

### Step 1c: `AMPECO_API_TOKEN`

**Directly ask for the value** — do NOT use AskUserQuestion here. Just output a text prompt like:

> Please enter your AMPECO API token (found at: **AMPECO Dashboard → Settings → API Tokens**):

The user will paste their token as the next message. Mask it when confirming.

### Step 1d: Write `.env`

Use the write-env script to create (or update) the `.env` file — do NOT use the Write tool (it triggers a permission prompt):

```bash
bash .claude/skills/setup/scripts/write-env.sh "<sanitized_domain>" "<api_token>"
```

The script outputs `result=created` or `result=updated`. After writing, show the contents with masked secrets:

```
.env created:
  AMPECO_BASE_DOMAIN=<sanitized_domain>
  AMPECO_API_TOKEN=<first4>...<last4>
  NODE_ENV=development
```

---

## Phase 2: Install Dependencies & Start Dev Server

### Step 2a: npm install

Run the install script:

```bash
bash .claude/skills/setup/scripts/install-deps.sh
```

Parse the output:
- `install_exit_code=0` and `ampeco_ui=installed` — success
- `install_exit_code!=0` — check for ERESOLVE errors in the output, suggest running with `--legacy-peer-deps`:

```bash
bash .claude/skills/setup/scripts/install-deps.sh --legacy-peer-deps
```

Ask the user before running the fallback.

### Step 2b: Verify dev server

Run the dev server verification script (it starts the server, health-checks it, and stops it automatically):

```bash
bash .claude/skills/setup/scripts/verify-dev-server.sh
```

Parse the output:

- **`port_status=in_use`** with `port_pid=<pid>`: The port is occupied. Use `AskUserQuestion` to offer choices:
  - **Kill the process**: Run `bash .claude/skills/setup/scripts/kill-port.sh <port>`, then re-run verify
  - **Use a different port**: Re-run with an alternate port, e.g. `bash .claude/skills/setup/scripts/verify-dev-server.sh 3001`
  - **Skip verification**: Move on without verifying

- **`health_check=ok`**: Success. Tell the user: "The dev server starts correctly. When you're ready to develop, start it in a separate terminal with `npm run dev`."

- **`health_check=failed`**: Show the dev server log from the output and help troubleshoot.

---

## Phase 3: Widget Registration in AMPECO

**Goal:** Guide the user through installing, configuring, and adding their widget to a dashboard.

This phase is informational — provide step-by-step instructions:

1. **Install and configure the Custom Widget:**
   - Log into your AMPECO tenant at `https://<AMPECO_BASE_DOMAIN>`
   - Go to **Marketplace → Catalog** and find **Custom Widget**
   - Click **Install** (skip if already installed)
   - Configure the widget:
   - **Name:** A descriptive name (e.g., "My Custom Dashboard")
   - **URL:** `http://localhost:3000/dashboard` (or whichever route you want to display)
   - **Enable Impersonation:** Toggle ON — this lets the widget make API calls on behalf of the logged-in admin, so data is automatically filtered by their permissions
   - **Sandbox options:** Enable **Allow Scripts**, **Allow Forms**, **Allow Same Origin** — these are required for the iframe to run JavaScript, submit forms, and communicate with the parent page

2. **Add the widget to a Dashboard:**
   - Navigate to **System → Dashboards**
   - Click **Edit** on the dashboard where you want the widget (e.g., Main Dashboard)
   - Select the **Widgets** tab
   - Add the custom widget you just created
   - Click **Update Dashboard** to save

3. **Verify it works:**
   - Navigate to the dashboard you just edited (e.g., `https://<AMPECO_BASE_DOMAIN>/admin/dashboards/main` for the Main Dashboard)
   - You should see the widget loaded in an iframe with data

---

## Phase 4: Troubleshooting & Wrap-up

If the widget doesn't load or shows errors, guide through these checks:

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
