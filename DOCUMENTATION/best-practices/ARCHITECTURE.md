# DEMA Group Architecture Best Practices

## 1. Data Validation & Security

### User Input Validation
```typescript
// Always use Zod for schema validation
const userSchema = z.object({
  email: z.string().email(),
  vatNumber: z.string().regex(/^[A-Z]{2}\d+$/),
  companySize: z.enum(['1-10', '11-50', '51-200', '201+']),
  industry: z.enum(['manufacturing', 'construction', 'wholesale'])
});

// Validate at multiple levels
- API endpoints (server-side)
- Form submissions (client-side)
- Database operations (pre-save hooks)
- Service layer (business logic)
```

### Security Measures
```typescript
// Rate limiting per endpoint and IP
const rateLimiter = {
  auth: { points: 5, duration: '15m' },
  api: { points: 100, duration: '1h' },
  critical: { points: 3, duration: '1h' }
};

// GDPR compliance
const dataProtection = {
  retention: { customer: '7y', order: '10y' },
  encryption: ['personalData', 'financialData'],
  consent: ['marketing', 'analytics', 'thirdParty']
};

// Access control
const rbacRules = {
  roles: ['admin', 'manager', 'employee', 'customer'],
  resources: ['orders', 'products', 'customers'],
  operations: ['create', 'read', 'update', 'delete']
};
```

## 2. Component Architecture

### Smart vs Presentational
```typescript
// Smart Component (Container)
const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { isLoading, error } = useOrderData();
  
  return <OrderList orders={orders} />;
};

// Presentational Component
const OrderList = ({ orders }: { orders: Order[] }) => (
  <div>
    {orders.map(order => <OrderItem order={order} />)}
  </div>
);
```

### Reusable Components
```typescript
// Base components with consistent styling
const Button = styled.button`
  ${props => buttonVariants[props.variant]}
  ${props => buttonSizes[props.size]}
`;

// Form components with built-in validation
const FormField = ({ 
  name, 
  validation,
  transform 
}: FormFieldProps) => {
  const { register, error } = useFormContext();
  return (
    <Field
      {...register(name, validation)}
      transform={transform}
      error={error}
    />
  );
};
```

## 3. State Management

### Global State
```typescript
// Use Zustand for global state
const useStore = create<AppState>((set) => ({
  user: null,
  cart: [],
  preferences: {},
  setUser: (user) => set({ user }),
  addToCart: (item) => set(state => ({
    cart: [...state.cart, item]
  }))
}));

// Persist important state
const usePersistStore = create(
  persist(
    (set) => ({
      theme: 'light',
      language: 'nl'
    }),
    { name: 'user-preferences' }
  )
);
```

### Local State
```typescript
// Use hooks for complex local state
const useFormState = (initialValues) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  return {
    values,
    errors,
    touched,
    setFieldValue: (field, value) => {...},
    setFieldTouched: (field) => {...}
  };
};
```

## 4. API Integration

### API Client
```typescript
// Typed API client
const api = createClient<ApiSchema>({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  interceptors: {
    request: [addAuthToken, addLanguageHeader],
    response: [handleErrors, transformResponse]
  }
});

// Resource-based modules
const ordersApi = {
  list: () => api.get('/orders'),
  create: (data: OrderInput) => api.post('/orders', data),
  update: (id: string, data: Partial<Order>) => 
    api.patch(`/orders/${id}`, data)
};
```

### Error Handling
```typescript
// Centralized error handling
const errorHandler = {
  network: (error: NetworkError) => {
    logger.error(error);
    notify.error('Connection failed');
  },
  validation: (error: ValidationError) => {
    return error.details.reduce((acc, err) => ({
      ...acc,
      [err.field]: err.message
    }), {});
  },
  business: (error: BusinessError) => {
    analytics.track('Business Rule Violation', {
      rule: error.rule,
      context: error.context
    });
  }
};
```

## 5. Performance Optimization

### Code Splitting
```typescript
// Route-based splitting
const routes = {
  '/products': lazy(() => import('./pages/Products')),
  '/orders': lazy(() => import('./pages/Orders')),
  '/customers': lazy(() => import('./pages/Customers'))
};

// Feature-based splitting
const ProductConfigurator = lazy(() => 
  import('./features/configurator')
);
```

### Caching Strategy
```typescript
// API response caching
const cache = {
  products: { ttl: '1h', revalidate: true },
  categories: { ttl: '24h', revalidate: false },
  prices: { ttl: '15m', revalidate: true }
};

// Static data generation
const staticPaths = {
  '/products': { revalidate: 3600 },
  '/categories': { revalidate: 86400 }
};
```

## 6. Testing Strategy

### Unit Tests
```typescript
// Component testing
describe('OrderForm', () => {
  it('validates required fields', () => {});
  it('calculates totals correctly', () => {});
  it('handles submission', () => {});
});

// Business logic testing
describe('PriceCalculator', () => {
  it('applies volume discounts', () => {});
  it('handles currency conversion', () => {});
  it('includes VAT correctly', () => {});
});
```

### Integration Tests
```typescript
// API integration tests
describe('Order API', () => {
  it('creates order with valid data', () => {});
  it('validates input', () => {});
  it('handles business rules', () => {});
});

// End-to-end flows
describe('Checkout Flow', () => {
  it('completes purchase', () => {});
  it('handles payment failure', () => {});
  it('sends confirmation', () => {});
});
```

## 7. Monitoring & Analytics

### Performance Monitoring
```typescript
// Page load metrics
const metrics = {
  FCP: 'First Contentful Paint',
  LCP: 'Largest Contentful Paint',
  FID: 'First Input Delay',
  CLS: 'Cumulative Layout Shift'
};

// Business metrics
const kpis = {
  conversion: ['visits', 'adds_to_cart', 'purchases'],
  engagement: ['time_on_site', 'pages_per_visit'],
  performance: ['revenue', 'aov', 'margin']
};
```

### Error Tracking
```typescript
// Error boundaries
class AppErrorBoundary extends ErrorBoundary {
  onError(error: Error) {
    logger.error(error);
    analytics.track('Error', {
      type: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}

// API error tracking
const errorTracker = {
  capture: (error: ApiError) => {
    logger.error({
      endpoint: error.endpoint,
      status: error.status,
      response: error.response
    });
  }
};
```

## 8. Internationalization

### Translation System
```typescript
// Strongly typed translations
type Translations = {
  common: {
    save: string;
    cancel: string;
    delete: string;
  };
  products: {
    list: {
      title: string;
      empty: string;
    };
  };
};

// Translation loader
const loadTranslations = async (
  language: string
): Promise<Translations> => {
  const translations = await import(
    `./translations/${language}.json`
  );
  return translations.default;
};
```

### Number & Date Formatting
```typescript
// Currency formatting
const formatPrice = (
  amount: number,
  currency: string,
  locale: string
) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
};

// Date formatting
const formatDate = (
  date: Date,
  format: DateFormat,
  locale: string
) => {
  return new Intl.DateTimeFormat(locale, {
    ...dateFormats[format]
  }).format(date);
};
```

## 9. Documentation

### Code Documentation
```typescript
/**
 * Calculates the total price including discounts and taxes
 * @param {OrderItem[]} items - List of order items
 * @param {Customer} customer - Customer information for tax calculation
 * @param {Discounts} discounts - Available discounts
 * @returns {PriceBreakdown} Detailed price breakdown
 */
function calculateTotal(
  items: OrderItem[],
  customer: Customer,
  discounts: Discounts
): PriceBreakdown {
  // Implementation
}
```

### API Documentation
```typescript
/**
 * @api {post} /orders Create Order
 * @apiGroup Orders
 * @apiParam {OrderItem[]} items Order items
 * @apiParam {string} customerId Customer ID
 * @apiSuccess {Order} order Created order
 * @apiError {ValidationError} 400 Invalid input
 * @apiError {AuthError} 401 Unauthorized
 */
async function createOrder(
  req: Request,
  res: Response
): Promise<void> {
  // Implementation
}
```

## 10. Development Workflow

### Git Workflow
```bash
# Branch naming
feature/add-product-configurator
bugfix/fix-price-calculation
hotfix/security-vulnerability

# Commit messages
feat: add product configurator
fix: correct price calculation
docs: update API documentation
refactor: improve error handling
```

### Code Review Checklist
```markdown
1. Security
   - Input validation
   - Authentication/Authorization
   - Data protection

2. Performance
   - Query optimization
   - Bundle size
   - Render efficiency

3. Maintainability
   - Code organization
   - Documentation
   - Test coverage

4. User Experience
   - Error handling
   - Loading states
   - Accessibility
```
