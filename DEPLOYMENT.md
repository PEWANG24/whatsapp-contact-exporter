# 🚀 Deployment Guide

Complete guide to deploy WhatsApp Contact Exporter to GitHub and Vercel with custom domain.

---

## 📦 Part 1: Push to GitHub

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and log in
2. Click the "+" icon in top-right → "New repository"
3. Repository settings:
   - **Name**: `whatsapp-contact-exporter`
   - **Description**: "Chrome extension to export WhatsApp Web contacts to CSV/JSON"
   - **Visibility**: Public (or Private if you prefer)
   - **DO NOT** initialize with README (we already have one)
4. Click "Create repository"

### Step 2: Push Your Code

Run these commands in your terminal:

```bash
cd "/Users/peterngigi/extract contacts"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-contact-exporter.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Update README on GitHub

1. Go to your repository on GitHub
2. Click on `README_GITHUB.md`
3. Rename it to `README.md` (or delete the old README.md and rename this one)
4. Commit the change

---

## 🌐 Part 2: Deploy to Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

Or use the Vercel website (easier).

### Step 2: Deploy via Vercel Website

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New" → "Project"
3. Import your `whatsapp-contact-exporter` repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: (leave empty)
   - **Output Directory**: `public`
5. Click "Deploy"

### Step 3: Configure Custom Domain

#### Option A: Using extensions.pewang.company/wa

1. In Vercel project settings, go to "Domains"
2. Add domain: `extensions.pewang.company`
3. Vercel will provide DNS records
4. Add these records to your DNS provider:
   ```
   Type: CNAME
   Name: extensions
   Value: cname.vercel-dns.com
   ```
5. Wait for DNS propagation (5-30 minutes)

#### Option B: Using a Subdomain Path

If you want `extensions.pewang.company/wa` specifically:

1. Deploy to Vercel normally
2. In your main `pewang.company` website, add a redirect/proxy:
   ```nginx
   location /wa {
       proxy_pass https://your-vercel-app.vercel.app;
   }
   ```

Or use Vercel's rewrites in your main site's `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/wa/:path*",
      "destination": "https://whatsapp-contact-exporter.vercel.app/:path*"
    }
  ]
}
```

---

## 🔧 Part 3: Vercel Configuration

Your `vercel.json` is already configured:

```json
{
  "version": 2,
  "name": "whatsapp-contact-exporter",
  "builds": [
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/wa",
      "dest": "/public/index.html"
    },
    {
      "src": "/wa/(.*)",
      "dest": "/public/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

This configuration:
- Serves files from the `public` folder
- Routes `/wa` to the main page
- Handles the extension download

---

## 📝 Part 4: Environment Setup

### Update Links in Code

Before deploying, update these files with your actual URLs:

1. **public/index.html** - Line with GitHub link:
   ```html
   <a href="https://github.com/YOUR_USERNAME/whatsapp-contact-exporter">
   ```

2. **README_GITHUB.md** - Update all repository links

### Verify Deployment

After deployment, test these URLs:
- `https://extensions.pewang.company/wa` - Main page
- `https://extensions.pewang.company/wa/extension.zip` - Download link
- `https://extensions.pewang.company/wa/docs` - Documentation

---

## 🔄 Part 5: Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update: description of changes"
git push origin main

# Vercel will automatically deploy!
```

---

## 📊 Part 6: Analytics (Optional)

### Add Vercel Analytics

1. Go to your Vercel project
2. Click "Analytics" tab
3. Enable Vercel Analytics
4. Add this to your HTML files:
   ```html
   <script defer src="/_vercel/insights/script.js"></script>
   ```

---

## 🎯 Quick Commands Reference

### Push to GitHub
```bash
cd "/Users/peterngigi/extract contacts"
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-contact-exporter.git
git push -u origin main
```

### Deploy to Vercel (CLI)
```bash
cd "/Users/peterngigi/extract contacts"
vercel
# Follow prompts
```

### Update and Redeploy
```bash
git add .
git commit -m "Your update message"
git push origin main
# Vercel auto-deploys!
```

---

## ✅ Deployment Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Vercel connected to GitHub repo
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] Deployment successful
- [ ] Test main page loads
- [ ] Test extension download works
- [ ] Test documentation page
- [ ] Update README with correct URLs

---

## 🐛 Troubleshooting

### Vercel Build Fails
- Check that `public` folder exists
- Verify `vercel.json` is valid JSON
- Check Vercel build logs for errors

### Custom Domain Not Working
- Wait 5-30 minutes for DNS propagation
- Verify DNS records are correct
- Check domain SSL certificate status

### Download Link Not Working
- Verify `extension.zip` exists in `public` folder
- Check file permissions
- Test direct URL: `https://your-domain/extension.zip`

---

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Docs**: [docs.github.com](https://docs.github.com)
- **DNS Help**: Check your domain provider's documentation

---

## 🎉 You're Done!

Your WhatsApp Contact Exporter is now:
- ✅ Version controlled on GitHub
- ✅ Deployed to Vercel
- ✅ Accessible at your custom domain
- ✅ Auto-deploys on every push

**Next Steps:**
1. Share the link with users
2. Monitor analytics
3. Collect feedback
4. Make improvements

---

**Made with ❤️ by Pewang Company**
