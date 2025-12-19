// Example: How ERP systems send stock updates to DEMA API
// This code would run on the ERP side (DEMA, Fluxer, etc.)

import crypto from 'crypto'

interface StockUpdate {
  sku: string
  quantity: number
  reservedQuantity?: number
  warehouseLocation?: string
  reason?: string
}

export class ERPWebhookSender {
  constructor(
    private webhookUrl: string,
    private webhookSecret: string,
    private companyId: string
  ) {}

  private sign(payload: string): string {
    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex')
  }

  async sendStockUpdate(event: string, data: StockUpdate) {
    const payload = JSON.stringify({
      event,
      companyId: this.companyId,
      timestamp: new Date().toISOString(),
      data,
    })

    const signature = this.sign(payload)

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': signature,
        'x-webhook-id': `wh_${Date.now()}`,
        'x-company-id': this.companyId,
      },
      body: payload,
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`)
    }

    return response.json()
  }

  // Convenience methods for common events
  async stockUpdated(sku: string, newQuantity: number, warehouseLocation?: string) {
    return this.sendStockUpdate('stock.updated', {
      sku,
      quantity: newQuantity,
      warehouseLocation,
    })
  }

  async stockReserved(sku: string, reservedQty: number, orderId: string) {
    return this.sendStockUpdate('stock.reserved', {
      sku,
      quantity: 0, // Will be calculated server-side
      reservedQuantity: reservedQty,
      reason: `Order ${orderId}`,
    })
  }

  async stockReceived(sku: string, receivedQty: number, poNumber: string) {
    return this.sendStockUpdate('stock.received', {
      sku,
      quantity: receivedQty,
      reason: `PO ${poNumber}`,
    })
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// In DEMA's ERP system:
const demaWebhook = new ERPWebhookSender(
  'https://api.demagroup.be/api/v1/webhooks/inventory',
  'whsec_dema_secret_here',
  'dema'
)

// When stock changes in ERP:
await demaWebhook.stockUpdated('PUMP-001', 150, 'Roeselare-A1')

// When order is placed:
await demaWebhook.stockReserved('PUMP-001', 5, 'ORD-2024-001234')

// When goods received:
await demaWebhook.stockReceived('PUMP-001', 100, 'PO-2024-5678')


// In Fluxer's ERP system:
const fluxerWebhook = new ERPWebhookSender(
  'https://api.demagroup.be/api/v1/webhooks/inventory',
  'whsec_fluxer_secret_here',
  'fluxer'
)

await fluxerWebhook.stockUpdated('VALVE-001', 75)
*/
