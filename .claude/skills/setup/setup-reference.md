# Setup Troubleshooting Reference

This file contains detailed troubleshooting information for the `/setup` skill. Read this when errors occur during setup.

---

## Environment Variable Pitfalls

### `.env` File

The `/setup` wizard writes all configuration to `.env` in the project root. Next.js automatically loads this file at startup.

### Domain Format Mistakes

| Input | Problem | Correct Value |
|-------|---------|--------------|
| `https://demo.charge.ampeco.tech` | Has protocol prefix | `demo.charge.ampeco.tech` |
| `demo.charge.ampeco.tech/` | Has trailing slash | `demo.charge.ampeco.tech` |
| `https://demo.charge.ampeco.tech/` | Both issues | `demo.charge.ampeco.tech` |
| `demo.charge.ampeco.tech` | Correct | `demo.charge.ampeco.tech` |

**Why trailing slashes matter:** The `normalizeDomain()` function in `lib/config/ampeco.ts` strips `https://` and `http://` prefixes but does NOT strip trailing slashes. A trailing slash would result in URLs like `https://demo.charge.ampeco.tech//.well-known/jwks.json` (double slash), which may cause 404 errors.

### API Token Format

AMPECO API tokens typically start with a recognizable prefix. The token should be copied exactly from **AMPECO Dashboard > Settings > API Tokens**.

---

## Dev Server Issues

### Port 3000 Conflicts

Check what's using port 3000:
```bash
lsof -i :3000
```

Kill a specific process:
```bash
kill <PID>
```

Force kill if unresponsive:
```bash
kill -9 <PID>
```

Alternatively, use a different port:
```bash
npm run dev -- --port 3001
```

### Turbopack Errors

The dev script uses `next dev --turbo` (Turbopack). If Turbopack crashes:
- Check Node.js version (must be >= 20.9.0)
- Try clearing the cache: `rm -rf .next`
- Try without Turbopack temporarily: `npx next dev` (slower but more stable)

### Missing Build Tools

**macOS:** If native module compilation fails:
```bash
xcode-select --install
```

**Linux (Debian/Ubuntu):** If native module compilation fails:
```bash
sudo apt-get install build-essential
```

---

## npm Install Issues

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `ERESOLVE unable to resolve dependency tree` | Peer dependency conflicts | Try `npm install --legacy-peer-deps` |
| `ECONNREFUSED` | Can't reach npm.pkg.github.com | Check network/proxy/VPN |

---

## Widget Registration Issues

### CSP (Content Security Policy) Errors

If the browser console shows CSP errors when loading the widget iframe:
- The AMPECO tenant must allow `http://localhost:3000` (or your dev URL) in its frame-src and connect-src CSP directives
- This is typically configured on the AMPECO platform side, not in the widget
- For local development, some browsers have extensions to relax CSP (use with caution)

### CORS Errors

If you see CORS errors in the browser console:
- The Next.js dev server should allow cross-origin requests from the AMPECO tenant
- Check that the `middleware.ts` is not blocking requests
- Verify the `Origin` header matches what the AMPECO tenant sends

### JWT Audience Mismatch

The JWT token's `aud` (audience) claim must match the widget's URL. Common mismatches:
- Widget registered with `http://localhost:3000` but JWT audience is `https://localhost:3000`
- Widget registered with `http://localhost:3000` but JWT audience is `http://localhost:3001`
- Trailing path differences

### Sandbox Attributes

When registering the widget in AMPECO, these sandbox options should be enabled:
- **Allow Scripts** — Required for JavaScript execution in the iframe
- **Allow Forms** — Required for form submissions
- **Allow Same Origin** — Required for cookies and storage

Missing any of these will cause the widget to fail silently or show partial content.

---

## Quick Diagnostic Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Test AMPECO tenant connectivity
curl -s "https://<domain>/.well-known/jwks.json" | head -c 200

# Check if dev server is running
curl -s http://localhost:3000/api/health

# Check what's on port 3000
lsof -i :3000

# Verify installed packages
ls node_modules/@ampeco/ampeco-ui/package.json 2>/dev/null && echo "ampeco-ui installed" || echo "ampeco-ui NOT installed"

# Check .env contents (masked)
grep -E "^[A-Z_]+=" .env | sed 's/=.*/=***/'
```
