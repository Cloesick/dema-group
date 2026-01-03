import { z } from 'zod'

const envSchema = z.object({
  // Add required environment variables
  NODE_ENV: z.enum(['development', 'production', 'test']),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  VERCEL_URL: z.string().optional(),
})

export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env)
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { fieldErrors } = error.flatten()
      const errorMessages = Object.entries(fieldErrors)
        .map(([field, errors]) => `${field}: ${errors?.join(', ')}`)
        .join('\n  ')
      
      throw new Error(`❌ Invalid environment variables:\n  ${errorMessages}`)
    }
    throw error
  }
}
