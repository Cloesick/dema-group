# Vercel Deployment Guide

## Overview

The DEMA webshop is deployed on Vercel with automatic deployments from GitHub.

## Quick Deploy

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import `Cloesick/DemaFinal`
4. Configure environment variables
5. Deploy

## Environment Variables

### Required

```env
OPENAI_API_KEY=sk-xxx           # AI chatbot
```

### Optional

```env
# Email (for quote requests)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="DEMA Shop" <noreply@demashop.be>

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## Build Settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node.js Version | 18.x |

## Deployment Policy

To preserve Vercel quota:
- **Scheduled deploys**: Noon and midnight
- **On-demand**: When explicitly requested
- **Commit locally** after each change
- **Push only** at scheduled times or on request

## Custom Domain

1. Go to Project Settings → Domains
2. Add `demashop.be`
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait 24-48 hours for propagation

## Troubleshooting

### Build Fails

```bash
# Test locally first
npm run build
```

Common issues:
- Missing environment variables
- TypeScript errors
- Import errors

### Large Files

If build is slow, check for large files:
```bash
# Add to .gitignore
public/data/input_pdfs_analysis_v5.json
```

### Memory Issues

For large builds:
```js
// next.config.js
module.exports = {
  experimental: {
    workerThreads: false,
    cpus: 1
  }
}
```

## Rollback

1. Go to Vercel Dashboard
2. Select deployment
3. Click "..." → "Promote to Production"

Or use CLI:
```bash
vercel rollback
```

## Monitoring

- **Vercel Analytics**: Built-in, enable in dashboard
- **Logs**: Real-time in Vercel dashboard
- **Errors**: Check Functions tab

---

*Last Updated: December 2024*
