# Quick Start Guide

## 1. Copy to GitHub

This project is now completely standalone. You can:
1. Create a new GitHub repository
2. Copy this entire folder into it
3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

## 2. Setup GitHub Pages

### In your GitHub repo Settings → Pages:
1. Source: Deploy from a branch
2. Branch: `main`
3. Folder: `/root` (if you'll use GitHub Actions)
4. Click Save

### For custom domain:
1. Go to Settings → Pages
2. Enter your domain in "Custom domain" field
3. Check "Enforce HTTPS"
4. Update the `public/CNAME` file with your domain before pushing

## 3. Configure Your Domain

Replace `example.com` in `public/CNAME` with your actual domain:

```
your-domain.com
```

Then in your domain registrar's DNS settings, add:

**A records:**
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**For www subdomain, add CNAME:**
```
CNAME -> yourusername.github.io
```

## 4. Deploy

The GitHub Actions workflow will automatically:
- Build your project on every push
- Deploy to GitHub Pages
- Use your custom domain

**Check deployment status:**
- GitHub repo → Actions tab → See deployment workflow

## 5. Local Development

```bash
npm install
npm run dev        # Local dev server at http://localhost:5173
npm run build      # Build for production
npm run serve      # Preview production build
```

## Done! 🎉

Your app will be live at:
- `your-domain.com` (if custom domain configured)
- `yourusername.github.io/REPO_NAME` (default GitHub Pages URL)

See `DEPLOY_GITHUB_PAGES.md` for detailed documentation.
