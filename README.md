# AMPECO Custom Dashboard Widgets Boilerplate

Production-ready Next.js template for building custom widgets that embed in AMPECO backend.

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ampeco-custom-widget-template&env=AMPECO_BASE_DOMAIN,AMPECO_API_TOKEN&envDescription=Required%20environment%20variables%20for%20AMPECO%20integration&envLink=https://github.com/YOUR_USERNAME/ampeco-custom-widget-template%23environment-configuration&project-name=my-ampeco-widget&repository-name=my-ampeco-widget&demo-title=AMPECO%20Custom%20Widget%20Template&demo-description=Production-ready%20template%20for%20building%20custom%20widgets%20with%20JWT%20auth%20and%20API%20integration&demo-url=https://ampeco-partner-fleet-dashboard-4smv7.ondigitalocean.app)

### Option 1: Generate with Vercel

Follow the steps in the [Vercel documentation](https://vercel.com/docs/deploy-button#generate-your-own) to generate your own deploy button.

### Option 2: Setting Up the Deploy Button

To customize the deploy button for your repository:

1. **Fork or create your repository** on GitHub with this template code

2. **Replace placeholders in the deploy button URL**:

   - `YOUR_USERNAME` → Your GitHub username or organization
   - `ampeco-custom-widget-template` → Your repository name
   - `my-ampeco-widget` → Your preferred project/repository name

3. **Customize the deploy button URL** (optional):

   - `project-name` - Name shown in Vercel dashboard
   - `repository-name` - GitHub repository name
   - `demo-title` - Title for the demo preview
   - `demo-description` - Description for the demo preview
   - `demo-url` - URL to your deployed demo (optional)

4. **Environment variables** are pre-configured in the button:

   - `AMPECO_BASE_DOMAIN` - Your AMPECO tenant domain
   - `AMPECO_API_TOKEN` - Your AMPECO API token

5. **Example customized URL**:

   ```text
   https://vercel.com/new/clone?repository-url=https://github.com/your-org/your-repo-name&env=AMPECO_BASE_DOMAIN,AMPECO_API_TOKEN&project-name=my-widget&repository-name=my-widget
   ```

**Note:** The deploy button will automatically:

- Clone your repository to Vercel
- Prompt for environment variables during setup
- Configure the project with the specified settings
- Deploy your widget application

## Manual Deployment

This project deploys with Vercel's GitHub integration. Configure it as follows:

### Required environment variables

- `AMPECO_BASE_DOMAIN` – your AMPECO tenant domain (e.g., `demo.charge.ampeco.tech`)
- `AMPECO_API_TOKEN` – AMPECO API token

### Recommended environment variables

- `WIDGET_ORIGIN` – public origin of the deployed widget (e.g., `https://my-widget.vercel.app`): the scheme, host and port of the **URL to embed** in AMPECO. With it, a JWT is accepted only when it was issued for this widget. Without it, the audience check is not strict and the server logs a warning at startup. See [Widget Configuration](INTEGRATION_GUIDE.md#widget-configuration).

### Vercel setup (one-click deploy)

1. In Vercel → Project → Settings → Environment Variables, add the above variables (Production, Preview, Development).
2. Redeploy. Vercel will expose the variables at build/runtime.

### Notes

- If you need these values in the browser, expose them as `NEXT_PUBLIC_*`. Currently they are server-side only.
- Avoid committing `.env.local`; it should stay untracked.

## 📖 Documentation

- [Integration Guide](INTEGRATION_GUIDE.md) - Step-by-step setup instructions, examples, and troubleshooting
- [AI Development Context](CLAUDE.md) - Context for AI development agents
- [AMPECO UI Documentation](https://ampeco.github.io/ampeco-backend-ui-package/) - Complete UI documentation
- [AMPECO API Documentation](https://developers.ampeco.com/) - Complete API reference
