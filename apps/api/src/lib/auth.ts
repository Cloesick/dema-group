import { NextRequest } from 'next/server'
import crypto from 'crypto'

// API Key validation
export async function validateApiKey(request: NextRequest): Promise<{
  valid: boolean
  companyId?: string
  error?: string
}> {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey) {
    return { valid: false, error: 'API key required' }
  }
  
  // In production, this would query the database
  // For now, use environment variables
  const apiKeys: Record<string, string> = {
    [process.env.DEMA_API_KEY || 'dema_dev_key']: 'dema',
    [process.env.FLUXER_API_KEY || 'fluxer_dev_key']: 'fluxer',
    [process.env.BELTZ247_API_KEY || 'beltz247_dev_key']: 'beltz247',
    [process.env.DEVISSCHERE_API_KEY || 'devisschere_dev_key']: 'devisschere',
    [process.env.ACCU_API_KEY || 'accu_dev_key']: 'accu',
  }
  
  const companyId = apiKeys[apiKey]
  
  if (!companyId) {
    return { valid: false, error: 'Invalid API key' }
  }
  
  return { valid: true, companyId }
}

// Webhook signature verification
export function verifyWebhookSignature(
  body: string,
  signature: string | null,
  companyId: string
): boolean {
  if (!signature) return false
  
  const secrets: Record<string, string> = {
    dema: process.env.WEBHOOK_SECRET_DEMA || 'whsec_dema_dev',
    fluxer: process.env.WEBHOOK_SECRET_FLUXER || 'whsec_fluxer_dev',
    beltz247: process.env.WEBHOOK_SECRET_BELTZ247 || 'whsec_beltz247_dev',
    devisschere: process.env.WEBHOOK_SECRET_DEVISSCHERE || 'whsec_devisschere_dev',
    accu: process.env.WEBHOOK_SECRET_ACCU || 'whsec_accu_dev',
  }
  
  const secret = secrets[companyId]
  if (!secret) return false
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

// Rate limiting (simple in-memory, use Redis in production)
const rateLimits = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = rateLimits.get(identifier)
  
  if (!record || record.resetAt < now) {
    rateLimits.set(identifier, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }
  
  record.count++
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt }
}
