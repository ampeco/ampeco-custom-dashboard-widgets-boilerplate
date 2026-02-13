---
name: deploy
description: |
  Interactive guide for deploying your AMPECO custom widget to production.
  Walks through hosting platform setup, environment variables, widget registration,
  and deployment verification.
  Trigger keywords: "deploy", "production", "vercel", "hosting", "go live"
allowed-tools: Read, Glob, Grep, Bash, WebFetch, AskUserQuestion
---

# Deploy Your AMPECO Custom Widget

This skill guides you through deploying your custom widget to production.

---

## Deployment Flow

Follow these steps in order:

### Step 1: Hosting Platform Selection

Currently supported:
- **Vercel** (recommended) - one-click deploy, pre-configured

Ask the user which platform they want to use. If they haven't chosen yet, recommend Vercel for its simplicity.

---

### Step 2: Vercel Deployment

#### Option A: One-Click Deploy (New Project)

If the user is deploying for the first time or wants to use the deploy button:

1. The repo includes a deploy button in README.md
2. Guide them to customize the button URL with their repo info:
   - Replace `YOUR_USERNAME` with their GitHub username/org
   - Replace `ampeco-custom-widget-template` with their repo name

**Deploy Button URL structure:**
```
https://vercel.com/new/clone?repository-url=https://github.com/{username}/{repo}&env=AMPECO_BASE_DOMAIN,AMPECO_API_TOKEN,NPM_TOKEN
```

#### Option B: Manual Vercel Setup (Existing Project)

If connecting an existing repository:

1. **Import Project**
   - Go to https://vercel.com/new
   - Select "Import Git Repository"
   - Choose the repository containing their widget code
   - Vercel auto-detects Next.js framework

2. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build` (from vercel.json)
   - Output Directory: Leave default (`.next`)
   - Install Command: `npm install`

3. **Proceed to Environment Variables** (Step 3)

---

### Step 3: Environment Variables

Guide the user to configure these in Vercel Settings > Environment Variables:

| Variable | Description | Example | Validation |
|----------|-------------|---------|------------|
| `AMPECO_BASE_DOMAIN` | Production tenant hostname (no https://) | `company.charge.ampeco.tech` | Must NOT include `https://` or trailing `/` |
| `AMPECO_API_TOKEN` | Production API token from AMPECO | `sk_live_xxxx...` | Should start with `sk_live_` for production |
| `NPM_TOKEN` | GitHub PAT with `read:packages` scope | `ghp_xxxx...` | Required for installing `@ampeco/ampeco-ui` |

**Important checks:**
- Set variables for **Production** environment (optionally Preview/Development)
- `AMPECO_BASE_DOMAIN` is bare hostname only (e.g., `demo.charge.ampeco.tech` NOT `https://demo.charge.ampeco.tech/`)
- Production API token should start with `sk_live_` (not `sk_test_`)
- NPM_TOKEN needs `read:packages` scope at minimum

**Common mistakes to detect:**
- Including `https://` in AMPECO_BASE_DOMAIN
- Including trailing slash in domain
- Using test API token for production
- Using wrong NPM token scope

After setting variables, trigger a redeploy in Vercel.

---

### Step 4: Widget Registration in AMPECO

After deployment completes, the user needs to register or update the widget in AMPECO.

**Get the production URL:**
- From Vercel dashboard: `https://{project-name}.vercel.app`
- Or custom domain if configured

**Navigate in AMPECO:**
1. Log in to the **production** AMPECO tenant
2. Go to **Marketplace** > **Catalog** > **Custom Widgets**

**If updating existing widget (was localhost):**
1. Find the widget used during development
2. Edit it
3. Update "URL to embed" from localhost to production HTTPS URL
4. Ensure "Enable admin user impersonation" is checked
5. Save changes

**If creating new widget:**
1. Click "Create Custom Widget"
2. Fill in:
   - **Name**: Descriptive name for the widget
   - **URL to embed**: `https://{your-vercel-domain}/dashboard` (or your route)
   - **Width**: Full width or 1/3 (depending on widget type)
   - **Height**: Auto or fixed pixels
   - **Enable admin user impersonation**: MUST be enabled

**Critical settings:**
- URL MUST use HTTPS (required for iframe embedding)
- Admin user impersonation MUST be enabled for API calls to work

---

### Step 5: Verification

Guide the user through verification:

1. **Open Widget from AMPECO**
   - Navigate to where the widget appears in AMPECO backend
   - Click to load the widget in iframe

2. **Check Widget Loads**
   - Widget should display without errors
   - Data should load correctly (filtered by user permissions)

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for:
     - No CORS errors
     - No CSP errors
     - No authentication errors
     - Successful API calls in Network tab

4. **Verify API Authorization**
   - In Network tab, check API requests
   - Authorization header should be: `Bearer {api_token}:{jwt_token}`
   - API responses should return 200 OK

**Troubleshooting common issues:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Blank iframe | CSP blocking | Check frame-ancestors in response headers |
| 401 errors | Wrong API token | Verify AMPECO_API_TOKEN is production token |
| CORS errors | Missing CORS config | Check Next.js middleware allows AMPECO domains |
| No data | Impersonation disabled | Enable "Admin user impersonation" in AMPECO |

---

## Verification Checklist

Before considering deployment complete, verify:

- [ ] Vercel deployment successful (green status)
- [ ] Environment variables set for Production
- [ ] Widget registered in AMPECO with production URL
- [ ] Admin user impersonation enabled
- [ ] Widget loads without errors
- [ ] Data displays correctly
- [ ] No console errors (CORS, CSP, auth)
- [ ] API calls return 200 OK

---

## Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard
**AMPECO Widget Registration:** Marketplace > Catalog > Custom Widgets

**Environment Variables:**
```
AMPECO_BASE_DOMAIN=company.charge.ampeco.tech
AMPECO_API_TOKEN=sk_live_xxxxx
NPM_TOKEN=ghp_xxxxx
```

**Production URL Format:**
```
https://{project-name}.vercel.app/{route}
```

**Widget URL Examples:**
- Dashboard: `https://my-widget.vercel.app/dashboard`
- Listings: `https://my-widget.vercel.app/listings`
- Single Widget: `https://my-widget.vercel.app/widget`