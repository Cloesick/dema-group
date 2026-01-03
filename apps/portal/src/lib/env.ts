import { z } from 'zod'
import type { ZodError, ZodIssue } from 'zod'

const envSchema = z.object({
  // Authentication
  AUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  // API Keys
  API_KEY: z.string().min(16),
  VERCEL_API_TOKEN: z.string(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string(),

  // Vercel Specific
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).default('development'),
  VERCEL_URL: z.string(),
  VERCEL_REGION: z.string(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NEXT_PUBLIC_API_URL: z.string().url(),

  // Feature Flags
  ENABLE_API_LOGGING: z.enum(['true', 'false']).transform(v => v === 'true'),
  ENABLE_PERFORMANCE_MONITORING: z.enum(['true', 'false']).transform(v => v === 'true'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Webhooks
  WEBHOOK_SECRET_DEMA: z.string(),
  WEBHOOK_SECRET_FLUXER: z.string(),
  WEBHOOK_SECRET_BELTZ247: z.string(),
  WEBHOOK_SECRET_DEVISSCHERE: z.string(),
  WEBHOOK_SECRET_ACCU: z.string(),

  // Inventory
  INVENTORY_API_KEYS: z.string().transform(v => v.split(',')),

  // Build
  ANALYZE: z.enum(['true', 'false']).transform(v => v === 'true').default(false)
})

export type Env = z.infer<typeof envSchema>

export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env)
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:')
      console.error(JSON.stringify(error.format(), null, 2))
    } else {
      console.error('❌ Unknown error validating environment variables:', error)
    }
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
    return null
  }
}
