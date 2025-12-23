# Implementation Guide

## Development Setup

### Environment Setup
```bash
# 1. Clone repository
git clone git@github.com:dema-group/dema-group-strategy.git

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Start development servers
pnpm dev
```

### Project Structure
```
dema-group-strategy/
├── apps/
│   ├── portal/             # Main customer portal
│   ├── admin/             # Admin dashboard
│   └── api/               # Backend API
├── packages/
│   ├── ui/                # Shared UI components
│   ├── core/              # Core business logic
│   └── config/            # Shared configuration
├── docs/                  # Documentation
└── scripts/              # Build and utility scripts
```

## Coding Standards

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": ["./tsconfig.json"]
  },
  "plugins": ["@typescript-eslint", "react-refresh"],
  "rules": {
    "react-refresh/only-export-components": [
      "warn",
      { "allowConstantExport": true }
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

## Component Development

### Component Template
```typescript
import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { cn } from '@/utils/cn';

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ComponentTemplate({
  title,
  description,
  children,
  className
}: Props): JSX.Element {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Component logic
  }, []);

  return (
    <div className={cn('component-base', className)}>
      <h2 className="text-2xl font-bold">{t(title)}</h2>
      {description && (
        <p className="text-gray-600">{t(description)}</p>
      )}
      <div className="content-wrapper">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
```

### Hook Template
```typescript
import { useState, useEffect, useCallback } from 'react';

interface Options<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useDataFetching<T>({
  initialData,
  onSuccess,
  onError
}: Options<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch data
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      setError(err as Error);
      onError?.(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  return {
    data,
    error,
    isLoading,
    fetchData
  };
}
```

## API Development

### Route Template
```typescript
import { z } from 'zod';
import { createRouter } from '@/server/createRouter';
import { prisma } from '@/server/db';
import { createSelectSchema } from '@/utils/validation';

const inputSchema = z.object({
  id: z.string().uuid(),
  data: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive'])
  })
});

const outputSchema = createSelectSchema(['id', 'name', 'status']);

export const router = createRouter()
  .query('getItem', {
    input: z.object({
      id: z.string().uuid()
    }),
    output: outputSchema,
    resolve: async ({ input }) => {
      return await prisma.item.findUnique({
        where: { id: input.id },
        select: outputSchema.parse
      });
    }
  })
  .mutation('updateItem', {
    input: inputSchema,
    output: outputSchema,
    resolve: async ({ input }) => {
      return await prisma.item.update({
        where: { id: input.id },
        data: input.data,
        select: outputSchema.parse
      });
    }
  });
```

### Middleware Template
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/utils/auth';

export async function middleware(
  request: NextRequest
): Promise<NextResponse> {
  try {
    // 1. Extract token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      throw new Error('Missing token');
    }

    // 2. Verify token
    const payload = await verifyAuth(token);

    // 3. Check permissions
    const hasAccess = await checkPermissions(
      payload.userId,
      request.nextUrl.pathname
    );
    if (!hasAccess) {
      throw new Error('Insufficient permissions');
    }

    // 4. Add user context
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);

    // 5. Continue to handler
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // 6. Handle errors
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unauthorized'
      }),
      {
        status: 401,
        headers: {
          'content-type': 'application/json',
        },
      }
    );
  }
}

export const config = {
  matcher: '/api/:path*',
};
```

## Testing

### Unit Test Template
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentUnderTest } from './ComponentUnderTest';

describe('ComponentUnderTest', () => {
  it('renders correctly', () => {
    render(<ComponentUnderTest />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const onAction = vi.fn();
    render(<ComponentUnderTest onAction={onAction} />);

    const button = screen.getByRole('button');
    await fireEvent.click(button);

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    render(<ComponentUnderTest isLoading />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('handles errors gracefully', () => {
    render(<ComponentUnderTest error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});
```

### Integration Test Template
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestClient } from '@/utils/testClient';
import { prisma } from '@/server/db';
import type { TestContext } from '@/utils/types';

describe('API Integration', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  it('creates and retrieves data', async () => {
    // 1. Create test data
    const created = await ctx.client.mutation('createItem', {
      name: 'Test Item',
      status: 'active'
    });
    expect(created.id).toBeDefined();

    // 2. Retrieve data
    const retrieved = await ctx.client.query('getItem', {
      id: created.id
    });
    expect(retrieved).toEqual(created);

    // 3. Verify database state
    const dbItem = await prisma.item.findUnique({
      where: { id: created.id }
    });
    expect(dbItem).toBeDefined();
  });

  it('handles concurrent operations', async () => {
    // 1. Create initial state
    const item = await ctx.client.mutation('createItem', {
      name: 'Concurrent Test',
      status: 'active'
    });

    // 2. Perform concurrent updates
    const updates = await Promise.all([
      ctx.client.mutation('updateItem', {
        id: item.id,
        data: { name: 'Update 1' }
      }),
      ctx.client.mutation('updateItem', {
        id: item.id,
        data: { name: 'Update 2' }
      })
    ]);

    // 3. Verify final state
    const final = await ctx.client.query('getItem', {
      id: item.id
    });
    expect(final.name).toBe(updates[1].name);
  });
});
```

## Deployment

### Production Checklist
```typescript
interface DeploymentCheck {
  category: string;
  checks: Array<{
    name: string;
    status: 'passed' | 'failed' | 'pending';
    details?: string;
  }>;
}

const deploymentChecks: DeploymentCheck[] = [
  {
    category: 'Build',
    checks: [
      { name: 'TypeScript compilation', status: 'pending' },
      { name: 'Unit tests', status: 'pending' },
      { name: 'Integration tests', status: 'pending' },
      { name: 'Bundle size', status: 'pending' }
    ]
  },
  {
    category: 'Security',
    checks: [
      { name: 'Dependency audit', status: 'pending' },
      { name: 'Environment variables', status: 'pending' },
      { name: 'API security', status: 'pending' },
      { name: 'CORS configuration', status: 'pending' }
    ]
  },
  {
    category: 'Performance',
    checks: [
      { name: 'Lighthouse scores', status: 'pending' },
      { name: 'Bundle optimization', status: 'pending' },
      { name: 'API response times', status: 'pending' },
      { name: 'Database indexes', status: 'pending' }
    ]
  }
];
```

### Deployment Script
```typescript
import { execSync } from 'child_process';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['production', 'staging']),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  API_URL: z.string().url()
});

async function deploy(): Promise<void> {
  try {
    // 1. Validate environment
    const env = envSchema.parse(process.env);

    // 2. Run checks
    console.log('Running pre-deployment checks...');
    execSync('pnpm test', { stdio: 'inherit' });
    execSync('pnpm build', { stdio: 'inherit' });

    // 3. Database migrations
    console.log('Running database migrations...');
    execSync('pnpm prisma migrate deploy', { stdio: 'inherit' });

    // 4. Deploy application
    console.log('Deploying application...');
    execSync(`pnpm deploy:${env.NODE_ENV}`, { stdio: 'inherit' });

    // 5. Run post-deployment checks
    console.log('Running post-deployment checks...');
    await validateDeployment();

    console.log('Deployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

async function validateDeployment(): Promise<void> {
  // Health check
  const health = await fetch(process.env.API_URL + '/health');
  if (!health.ok) {
    throw new Error('Health check failed');
  }

  // Performance check
  const metrics = await fetch(process.env.API_URL + '/metrics');
  const { responseTime } = await metrics.json();
  if (responseTime.p95 > 1000) {
    throw new Error('Performance check failed');
  }
}

deploy();
```

## Monitoring

### Metrics Collection
```typescript
interface MetricsConfig {
  endpoint: string;
  interval: number;
  metrics: Array<{
    name: string;
    type: 'counter' | 'gauge' | 'histogram';
    labels?: string[];
  }>;
}

const metricsConfig: MetricsConfig = {
  endpoint: '/metrics',
  interval: 10000,
  metrics: [
    {
      name: 'http_requests_total',
      type: 'counter',
      labels: ['method', 'path', 'status']
    },
    {
      name: 'http_request_duration_seconds',
      type: 'histogram',
      labels: ['method', 'path']
    },
    {
      name: 'system_memory_usage',
      type: 'gauge'
    }
  ]
};
```

### Alert Configuration
```typescript
interface AlertConfig {
  name: string;
  condition: string;
  threshold: number;
  duration: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  channels: string[];
}

const alertConfigs: AlertConfig[] = [
  {
    name: 'High Error Rate',
    condition: 'rate(http_requests_total{status=~"5.."}[5m]) > 0.01',
    threshold: 0.01,
    duration: '5m',
    severity: 'error',
    channels: ['slack', 'email']
  },
  {
    name: 'High Response Time',
    condition: 'http_request_duration_seconds{quantile="0.95"} > 1',
    threshold: 1,
    duration: '5m',
    severity: 'warning',
    channels: ['slack']
  }
];
```
