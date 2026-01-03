import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

function validateEnv() {
  try {
    const env = envSchema.parse(process.env);
    console.log('Environment validation successful:', env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:', error.errors);
      process.exit(1);
    }
  }
}

validateEnv();
