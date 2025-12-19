# Technology Stack

## Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.x | React framework with App Router |
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Node.js** | 18+ | Runtime |

## Styling

| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS |
| **shadcn/ui** | Component library |
| **Lucide React** | Icons |

## State Management

| Technology | Purpose |
|------------|---------|
| **Zustand** | Client state (cart, quotes) |
| **React Context** | Language, theme |

## AI & Search

| Technology | Purpose |
|------------|---------|
| **OpenAI GPT-4** | Product assistant chatbot |
| **Client-side search** | Product filtering |

## Data

| Technology | Purpose |
|------------|---------|
| **JSON files** | Product data storage |
| **PDF.js** | PDF rendering |

## Email

| Technology | Purpose |
|------------|---------|
| **Nodemailer** | SMTP email sending |
| **Resend** | Alternative email service |

## Authentication (Optional)

| Technology | Purpose |
|------------|---------|
| **NextAuth.js** | Authentication |
| **Firebase** | Auth provider |

## Development

| Tool | Purpose |
|------|---------|
| **ESLint** | Linting |
| **Prettier** | Formatting |
| **Jest** | Testing |
| **Turbopack** | Fast builds |

## Deployment

| Service | Purpose |
|---------|---------|
| **Vercel** | Hosting |
| **GitHub** | Version control |
| **GitHub Actions** | CI/CD |

## Dependencies Summary

```json
{
  "dependencies": {
    "next": "^14.2.3",
    "react": "^18",
    "react-dom": "^18",
    "zustand": "^4.5.0",
    "openai": "^4.x",
    "lucide-react": "^0.344.0",
    "tailwind-merge": "^2.2.1",
    "clsx": "^2.1.0",
    "pdfjs-dist": "^4.x",
    "nodemailer": "^6.x"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^18",
    "tailwindcss": "^3.4.1",
    "eslint": "^8",
    "jest": "^29"
  }
}
```

## Why This Stack?

| Choice | Rationale |
|--------|-----------|
| **Next.js** | SSR for SEO, API routes, Vercel integration |
| **Tailwind** | Fast styling, no CSS files to manage |
| **Zustand** | Simpler than Redux, sufficient for our needs |
| **JSON files** | No database needed for static catalog |
| **OpenAI** | Best-in-class NLP for product search |

## Future Considerations

| Current | Future | When |
|---------|--------|------|
| JSON files | PostgreSQL (Supabase) | >50K products |
| Client search | Meilisearch | >10K products |
| No auth | Supabase Auth | Customer accounts |
| No payments | Mollie/Stripe | E-commerce |

---

*Last Updated: December 2024*
