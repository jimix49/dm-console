# Deploying to GitHub Pages

This project is now configured to deploy to GitHub Pages. Follow these steps to set it up:

## Setup Instructions

### 1. Create a GitHub Repository
- Go to [GitHub.com](https://github.com) and create a new repository
- Name it `dm-console` (or your preferred name)
- Do NOT initialize with README, gitignore, or license (you'll push existing code)

### 2. Prepare Your Local Repository
```bash
cd your-project-directory
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dm-console.git
git push -u origin main
```

### 3. Configure GitHub Pages

**If using GitHub Organization or User Page (deploy to root domain):**
- Set base path in `vite.config.ts` to `"/"` (already done)
- Build and the dist folder will deploy to `yourusername.github.io`

**If using GitHub Project Page (deploy to subdirectory):**
- Update `vite.config.ts` base path: `base: "/dm-console/"`
- This will deploy to `yourusername.github.io/dm-console`

### 4. Enable GitHub Pages

In your GitHub repository:
1. Go to **Settings** → **Pages**
2. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)` if you'll use GitHub Actions, or `/dist` if manually deploying
3. Click **Save**

### 5. Option A: Automatic Deployment with GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Then:
1. Commit and push the workflow file
2. GitHub Actions will automatically build and deploy on each push to main

### 6. Option B: Manual Deployment

Build locally and push the dist folder:

```bash
npm install
npm run build
git add dist -f
git commit -m "Deploy to GitHub Pages"
git push
```

Then in GitHub settings, set the source to `/dist` folder.

## Build & Preview Locally

Before deploying, test the build locally:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Preview the built version
npm run serve
```

## Development

For local development:

```bash
npm run dev
```

This starts a development server at `http://localhost:5173`

## Using a Custom Domain

### 1. Purchase a Domain
Purchase a domain from a registrar like Namecheap, GoDaddy, etc.

### 2. Configure DNS Records

Point your domain to GitHub Pages by adding these DNS records:

**For Apex Domain (example.com):**
Add these A records:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Add this AAAA record (IPv6):
```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

**For Subdomain (www.example.com):**
Add a CNAME record:
```
CNAME: www.example.com -> yourusername.github.io
```

### 3. Add CNAME File to Repository

Create a `public/CNAME` file with your domain:

```
example.com
```

Or if using subdomain:
```
www.example.com
```

The build process will include this in the `dist` folder.

### 4. Update GitHub Pages Settings

In your repository Settings → Pages:
1. Under "Custom domain", enter your domain (e.g., `example.com`)
2. Check "Enforce HTTPS"
3. Save

GitHub will automatically create the CNAME file and verify your domain.

### 5. Wait for DNS Propagation

DNS changes can take 24-48 hours to fully propagate. You can check status at:
- https://dnschecker.org/

### Troubleshooting

**Domain not resolving?**
- Wait for DNS propagation (can take up to 48 hours)
- Verify DNS records are correctly set
- Check that CNAME file is in repository

**HTTPS certificate not appearing?**
- Wait 10-15 minutes after configuring custom domain
- Go back to Settings → Pages to trigger certificate generation
- Uncheck and recheck "Enforce HTTPS"

## Notes

- The project no longer depends on Replit-specific packages
- Base path is set to `/` by default (suitable for User Pages)
- Update `base: "/dm-console/"` in `vite.config.ts` if deploying as a project page
- The `dist` folder contains the production build ready for GitHub Pages
- Works as a standalone project - just copy/paste into any GitHub repo
