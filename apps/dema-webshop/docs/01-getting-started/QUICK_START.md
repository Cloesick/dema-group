# Quick Start Guide

## Prerequisites

- Node.js 18+
- npm or pnpm
- Git

## Installation

```bash
# Clone repository
git clone https://github.com/Cloesick/DemaFinal.git
cd dema-webshop

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create `.env.local` with:

```env
# Required
OPENAI_API_KEY=sk-xxx              # For AI chatbot

# Optional (for full functionality)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Firebase (if using auth)
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
```

## Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm test             # Run tests
npm run test:watch   # Tests in watch mode
```

## Project Structure

```
dema-webshop/
├── src/
│   ├── app/           # Next.js pages & API routes
│   ├── components/    # React components
│   ├── config/        # Configuration files
│   ├── contexts/      # React contexts
│   └── lib/           # Utilities
├── public/
│   ├── data/          # Product JSON files
│   ├── images/        # Static images
│   └── pdfs/          # PDF catalogs
├── scripts/           # Build & data scripts
└── docs/              # Documentation
```

## Key URLs

| URL | Description |
|-----|-------------|
| `/` | Homepage |
| `/products` | All products |
| `/catalog/[name]` | Catalog pages |
| `/makita` | Makita products |

## Next Steps

1. [Environment Setup](environment-setup.md) - Full env var guide
2. [App Structure](../02-architecture/app-structure.md) - Detailed architecture
3. [Deployment](../04-deployment/vercel-deployment.md) - Deploy to production

---

*Last Updated: December 2024*
