# DEMA Group Security Guidelines

## 1. Authentication & Authorization

### JWT Implementation
```typescript
const jwtConfig = {
  accessToken: {
    expiresIn: '15m',
    algorithm: 'RS256'
  },
  refreshToken: {
    expiresIn: '7d',
    algorithm: 'RS256'
  }
};

const sessionConfig = {
  maxAge: 24 * 60 * 60,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const
};
```

### Role-Based Access Control
```typescript
enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  CUSTOMER = 'customer'
}

interface Permission {
  action: 'create' | 'read' | 'update' | 'delete';
  resource: string;
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    { action: 'create', resource: '*' },
    { action: 'read', resource: '*' },
    { action: 'update', resource: '*' },
    { action: 'delete', resource: '*' }
  ],
  [Role.MANAGER]: [
    { action: 'read', resource: '*' },
    { action: 'update', resource: 'orders' },
    { action: 'update', resource: 'products' }
  ]
  // ... other roles
};
```

## 2. Data Protection

### Personal Data Handling
```typescript
interface PersonalData {
  email: string;
  phone?: string;
  address?: Address;
  vatNumber?: string;
}

const personalDataFields = [
  'email',
  'phone',
  'address',
  'vatNumber'
] as const;

const dataRetentionPeriods = {
  customer: 7 * 365, // 7 years
  order: 10 * 365,   // 10 years
  invoice: 10 * 365, // 10 years
  log: 90           // 90 days
};
```

### Encryption
```typescript
const encryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltLength: 64
};

const hashingConfig = {
  algorithm: 'argon2id',
  memoryCost: 4096,
  timeCost: 3,
  parallelism: 1
};
```

## 3. API Security

### Rate Limiting
```typescript
const rateLimits = {
  auth: {
    points: 5,
    duration: 900, // 15 minutes
    blockDuration: 3600 // 1 hour
  },
  api: {
    points: 100,
    duration: 60,
    blockDuration: 300
  }
};

const ipWhitelist = [
  // Office IPs
  '192.168.1.0/24',
  // VPN IPs
  '10.0.0.0/8'
];
```

### Request Validation
```typescript
const requestValidation = {
  headers: {
    required: [
      'x-api-key',
      'x-request-id'
    ],
    optional: [
      'x-forwarded-for',
      'user-agent'
    ]
  },
  sanitization: {
    allowedTags: [],
    allowedAttributes: {},
    allowedSchemes: ['http', 'https']
  }
};
```

## 4. Monitoring & Logging

### Security Events
```typescript
enum SecurityEvent {
  LOGIN_SUCCESS = 'login.success',
  LOGIN_FAILURE = 'login.failure',
  PASSWORD_CHANGE = 'password.change',
  ACCESS_DENIED = 'access.denied',
  DATA_EXPORT = 'data.export',
  ADMIN_ACTION = 'admin.action'
}

interface SecurityLog {
  event: SecurityEvent;
  userId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, unknown>;
}
```

### Alert Thresholds
```typescript
const alertThresholds = {
  loginFailures: {
    count: 5,
    window: 900, // 15 minutes
    action: 'BLOCK_IP'
  },
  dataExports: {
    count: 3,
    window: 3600, // 1 hour
    action: 'NOTIFY_ADMIN'
  },
  apiErrors: {
    count: 100,
    window: 300, // 5 minutes
    action: 'SCALE_UP'
  }
};
```

## 5. Error Handling

### Error Types
```typescript
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

class ValidationError extends AppError {
  constructor(details: unknown) {
    super(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      details
    );
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTH_ERROR', 401);
  }
}
```

### Error Responses
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
  timestamp: string;
}

const errorHandler = (
  error: Error,
  req: Request,
  res: Response
) => {
  const requestId = req.headers['x-request-id'];
  const timestamp = new Date().toISOString();

  if (error instanceof AppError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      },
      requestId,
      timestamp
    });
  }

  // Log unexpected errors
  logger.error(error);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    },
    requestId,
    timestamp
  });
};
```

## 6. Secure Configuration

### Environment Variables
```typescript
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'API_KEY'
] as const;

const validateEnv = () => {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing ${envVar}`);
    }
  }
};

const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

## 7. Security Testing

### Test Cases
```typescript
describe('Security', () => {
  describe('Authentication', () => {
    it('blocks invalid credentials', async () => {});
    it('enforces password policy', async () => {});
    it('handles token expiry', async () => {});
  });

  describe('Authorization', () => {
    it('enforces role permissions', async () => {});
    it('validates resource access', async () => {});
    it('logs unauthorized attempts', async () => {});
  });

  describe('Rate Limiting', () => {
    it('blocks excessive requests', async () => {});
    it('respects IP whitelist', async () => {});
    it('resets counters correctly', async () => {});
  });
});
```

### Security Checklist
```markdown
## Pre-deployment Security Checklist

1. Authentication
   - [ ] Password policy enforced
   - [ ] MFA configured
   - [ ] Session management secure

2. Authorization
   - [ ] Role permissions validated
   - [ ] Resource access controlled
   - [ ] Audit logging enabled

3. Data Protection
   - [ ] Sensitive data encrypted
   - [ ] PII properly handled
   - [ ] Data retention configured

4. API Security
   - [ ] Rate limiting active
   - [ ] Input validation complete
   - [ ] Security headers set

5. Infrastructure
   - [ ] TLS configured
   - [ ] Network security reviewed
   - [ ] Monitoring active
```
