import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/auth'

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
    referenceId?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-webhook-signature')
    const webhookId = request.headers.get('x-webhook-id')
    const companyId = request.headers.get('x-company-id')

    const body = await request.text()

    // Verify signature
    if (!companyId || !verifyWebhookSignature(body, signature, companyId)) {
      console.error('[Webhook] Invalid signature')
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const payload: ERPWebhookPayload = JSON.parse(body)

    console.log(`[Webhook] ${payload.event} from ${payload.companyId}:`, {
      sku: payload.data.sku,
      newQuantity: payload.data.newQuantity,
    })

    // TODO: Process with Prisma
    // await prisma.stockMovement.create({ data: {...} })
    // await prisma.stock.update({ where: {...}, data: {...} })

    // TODO: Broadcast real-time update
    // await broadcastStockUpdate(payload)

    return NextResponse.json({
      success: true,
      webhookId,
      processed: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
