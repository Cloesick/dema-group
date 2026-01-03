#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧹 Clearing Vercel deployment cache..."

# Remove local cache
rm -rf .next
rm -rf .vercel/cache
rm -rf .vercel/output

echo "${GREEN}✅ Local cache cleared${NC}"

# Clear node_modules
echo "📦 Cleaning dependencies..."
rm -rf node_modules
pnpm store prune
pnpm install

echo "${GREEN}✅ Dependencies reinstalled${NC}"

# Clear Vercel project cache (requires Vercel CLI)
if command -v vercel &> /dev/null; then
  echo "🔄 Clearing Vercel project cache..."
  vercel env pull .env.local
  vercel deploy --prod --force
  echo "${GREEN}✅ Vercel cache cleared and fresh deployment triggered${NC}"
else
  echo "${RED}⚠️  Vercel CLI not found. Please install it with: npm i -g vercel${NC}"
  echo "Then run: vercel deploy --prod --force"
fi

echo "
${GREEN}Cache clearing complete! Next steps:${NC}
1. Go to Vercel dashboard
2. Open project settings
3. Clear build cache manually if needed
4. Trigger a new deployment"
