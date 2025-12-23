# DEMA Group Implementation Guide

## Project Structure

```
dema-group-strategy/
├── apps/
│   ├── portal/               # Main customer portal
│   ├── admin/               # Internal admin interface
│   └── api/                 # Backend API
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── validation/          # Shared validation rules
│   ├── utils/              # Shared utilities
│   └── types/              # Shared TypeScript types
└── docs/                   # Documentation
```

## Core Principles

### 1. Type Safety
- Use TypeScript for all code
- Define strict interfaces for data models
- Validate API requests/responses with Zod
- Use discriminated unions for state management

### 2. Component Design
- Follow atomic design principles
- Implement proper prop typing
- Use composition over inheritance
- Maintain single responsibility

### 3. State Management
- Use Zustand for global state
- Implement proper state hydration
- Handle side effects consistently
- Maintain clear state boundaries

## Implementation Standards

### 1. Component Template
```typescript
import { FC, memo } from 'react';
import { useTranslation } from 'next-i18next';
import { useStore } from '@/store';
import { cn } from '@/utils/styles';

interface Props {
  data: DataType;
  onAction: (id: string) => void;
  className?: string;
}

export const ComponentName: FC<Props> = memo(({
  data,
  onAction,
  className
}) => {
  const { t } = useTranslation();
  const store = useStore();

  // Handlers
  const handleAction = () => {
    // Implementation
  };

  // Render helpers
  const renderItem = (item: ItemType) => {
    // Implementation
  };

  return (
    <div className={cn('base-classes', className)}>
      {/* Implementation */}
    </div>
  );
});

ComponentName.displayName = 'ComponentName';
```

### 2. Hook Template
```typescript
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

interface Options {
  initialValue?: string;
  config?: Config;
}

export const useCustomHook = ({
  initialValue = '',
  config = {}
}: Options = {}) => {
  // State
  const [state, setState] = useState(initialValue);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ['key', state],
    queryFn: () => api.fetch(state)
  });

  // Effects
  useEffect(() => {
    // Side effects
  }, [state]);

  // Handlers
  const handleChange = useCallback((value: string) => {
    setState(value);
  }, []);

  return {
    state,
    data,
    isLoading,
    handleChange
  };
};
```

### 3. API Route Template
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { withAuth } from '@/middleware/auth';
import { withValidation } from '@/middleware/validation';
import { logger } from '@/utils/logger';

const schema = z.object({
  // Validation schema
});

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export default withAuth(withValidation(schema)(handler));
```

### 4. Store Template
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface State {
  data: Data[];
  status: 'idle' | 'loading' | 'error';
  error: Error | null;
}

interface Actions {
  addData: (item: Data) => void;
  removeData: (id: string) => void;
  setError: (error: Error) => void;
}

export const useStore = create<State & Actions>()(
  persist(
    immer((set) => ({
      // Initial state
      data: [],
      status: 'idle',
      error: null,

      // Actions
      addData: (item) =>
        set((state) => {
          state.data.push(item);
        }),

      removeData: (id) =>
        set((state) => {
          state.data = state.data.filter(
            item => item.id !== id
          );
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
          state.status = 'error';
        })
    })),
    {
      name: 'store-name',
      version: 1
    }
  )
);
```

### 5. Validation Template
```typescript
import { z } from 'zod';
import { isValidVAT } from '@/utils/validation';

export const addressSchema = z.object({
  street: z.string().min(1),
  number: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().regex(/^\d{4}$/),
  country: z.enum(['BE', 'NL', 'FR', 'DE'])
});

export const companySchema = z.object({
  name: z.string().min(2),
  vatNumber: z.string().refine(isValidVAT),
  address: addressSchema,
  type: z.enum(['customer', 'supplier', 'partner'])
});

export const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1)
  })),
  billingAddress: addressSchema,
  shippingAddress: addressSchema.optional(),
  notes: z.string().optional()
});

export type Address = z.infer<typeof addressSchema>;
export type Company = z.infer<typeof companySchema>;
export type Order = z.infer<typeof orderSchema>;
```

### 6. Middleware Template
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { rateLimit } from '@/utils/rate-limit';
import { logger } from '@/utils/logger';

export function withMiddleware(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Rate limiting
      await rateLimit(req, res);

      // Authentication
      const token = await getToken({ req });
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Request logging
      logger.info({
        method: req.method,
        url: req.url,
        userId: token.sub
      });

      // Execute handler
      await handler(req, res);

    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
```

### 7. Testing Template
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  const mockData = {
    // Test data
  };

  const mockHandler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <ComponentName
        data={mockData}
        onAction={mockHandler}
      />
    );

    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(
      <ComponentName
        data={mockData}
        onAction={mockHandler}
      />
    );

    await fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalledWith(mockData.id);
  });

  it('handles error states', () => {
    render(
      <ComponentName
        data={null}
        onAction={mockHandler}
      />
    );

    expect(screen.getByText('error')).toBeInTheDocument();
  });
});
```

## Quality Checklist

### 1. Code Quality
- [ ] TypeScript strict mode enabled
- [ ] No any types used
- [ ] ESLint rules followed
- [ ] Prettier formatting applied
- [ ] No console.log statements
- [ ] Error boundaries implemented
- [ ] Performance optimizations applied

### 2. Testing
- [ ] Unit tests for components
- [ ] Integration tests for features
- [ ] E2E tests for critical flows
- [ ] Test coverage >80%
- [ ] Mocks properly typed
- [ ] Edge cases covered

### 3. Documentation
- [ ] Component props documented
- [ ] Functions documented
- [ ] Types documented
- [ ] README updated
- [ ] API endpoints documented
- [ ] Examples provided

### 4. Security
- [ ] Input validation
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Authentication
- [ ] Authorization
- [ ] Data sanitization

### 5. Accessibility
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Color contrast
- [ ] Screen reader support
- [ ] Focus management
- [ ] Error announcements
