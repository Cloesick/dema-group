import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Webhook receiver for ERP inventory updates
// Receives real-time stock changes from company ERP systems

interface ERPWebhookPayload {
  event: 'stock.updated' | 'stock.reserved' | 'stock.released' | 'stock.received' | 'stock.adjusted'
  companyId: string
  timestamp: string
  data: {
    sku: string
    previousQuantity?: number
    newQuantity: number
    changeQuantity?: number
    reason?: string
    warehouseId?: string
    referenceId?: string // Order ID, PO number, etc.
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-webhook-signature')
    const webhookId = request.headers.get('x-webhook-id')
    const companyId = request.headers.get('x-company-id')
    
    const body = await request.text()
    
    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature, companyId)) {
      console.error('[Webhook] Invalid signature')
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    const payload: ERPWebhookPayload = JSON.parse(body)
    
    console.log(`[Webhook] Received ${payload.event} from ${payload.companyId}:`, {
      sku: payload.data.sku,
      newQuantity: payload.data.newQuantity,
    })
    
    // Process the webhook based on event type
    switch (payload.event) {
      case 'stock.updated':
        await handleStockUpdate(payload)
        break
      case 'stock.reserved':
        await handleStockReserved(payload)
        break
      case 'stock.released':
        await handleStockReleased(payload)
        break
      case 'stock.received':
        await handleStockReceived(payload)
        break
      case 'stock.adjusted':
        await handleStockAdjusted(payload)
        break
      default:
        console.warn(`[Webhook] Unknown event type: ${payload.event}`)
    }
    
    return NextResponse.json({
      success: true,
      webhookId,
      processed: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Webhook] Error processing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

function verifyWebhookSignature(
  body: string,
  signature: string | null,
  companyId: string | null
): boolean {
  if (!signature || !companyId) return false
  
  // Get the webhook secret for this company
  const secrets: Record<string, string> = {
    dema: process.env.WEBHOOK_SECRET_DEMA || 'dev_secret_dema',
    fluxer: process.env.WEBHOOK_SECRET_FLUXER || 'dev_secret_fluxer',
    beltz247: process.env.WEBHOOK_SECRET_BELTZ247 || 'dev_secret_beltz247',
    devisschere: process.env.WEBHOOK_SECRET_DEVISSCHERE || 'dev_secret_devisschere',
    accu: process.env.WEBHOOK_SECRET_ACCU || 'dev_secret_accu',
  }
  
  const secret = secrets[companyId]
  if (!secret) return false
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

async function handleStockUpdate(payload: ERPWebhookPayload) {
  // TODO: Update database with new stock level
  // TODO: Broadcast to connected clients via WebSocket/SSE
  // TODO: Update search index
  console.log(`[Stock Update] ${payload.data.sku}: ${payload.data.newQuantity}`)
}

async function handleStockReserved(payload: ERPWebhookPayload) {
  // Stock reserved for an order
  // TODO: Update reserved quantity in database
  console.log(`[Stock Reserved] ${payload.data.sku}: -${payload.data.changeQuantity}`)
}

async function handleStockReleased(payload: ERPWebhookPayload) {
  // Reserved stock released (order cancelled)
  // TODO: Update reserved quantity in database
  console.log(`[Stock Released] ${payload.data.sku}: +${payload.data.changeQuantity}`)
}

async function handleStockReceived(payload: ERPWebhookPayload) {
  // New stock received from supplier
  // TODO: Update quantity and trigger notifications
  console.log(`[Stock Received] ${payload.data.sku}: +${payload.data.changeQuantity}`)
}

async function handleStockAdjusted(payload: ERPWebhookPayload) {
  // Manual stock adjustment (inventory count, damage, etc.)
  // TODO: Log adjustment with reason
  console.log(`[Stock Adjusted] ${payload.data.sku}: ${payload.data.newQuantity} (${payload.data.reason})`)
}
