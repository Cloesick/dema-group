// DHL API Integration
// Docs: https://developer.dhl.com/api-reference

interface DHLConfig {
  apiKey: string
  sandbox?: boolean
}

export class DHLClient {
  private baseUrl: string

  constructor(private config: DHLConfig) {
    this.baseUrl = config.sandbox
      ? 'https://api-sandbox.dhl.com'
      : 'https://api-eu.dhl.com'
  }

  async trackShipment(trackingNumber: string) {
    const response = await fetch(
      `${this.baseUrl}/track/shipments?trackingNumber=${trackingNumber}`,
      {
        headers: {
          'DHL-API-Key': this.config.apiKey,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`DHL tracking failed: ${response.status}`)
    }

    const data = await response.json()
    return this.normalizeResponse(data)
  }

  async createShipment(shipmentData: {
    shipper: { name: string; address: object }
    recipient: { name: string; address: object }
    packages: Array<{ weight: number }>
    productCode: string
  }) {
    const response = await fetch(`${this.baseUrl}/shipping/v1/orders`, {
      method: 'POST',
      headers: {
        'DHL-API-Key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productCode: shipmentData.productCode,
        pickup: { isRequested: false },
        consignee: shipmentData.recipient,
        shipper: shipmentData.shipper,
        content: {
          packages: shipmentData.packages,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DHL shipment failed: ${error}`)
    }

    return response.json()
  }

  private normalizeResponse(data: any) {
    const shipment = data.shipments?.[0]
    if (!shipment) return null

    return {
      trackingNumber: shipment.id,
      carrier: 'dhl',
      status: this.mapStatus(shipment.status?.statusCode),
      estimatedDelivery: shipment.estimatedTimeOfDelivery,
      events: shipment.events?.map((e: any) => ({
        timestamp: e.timestamp,
        status: e.description,
        location: `${e.location?.address?.addressLocality}, ${e.location?.address?.countryCode}`,
      })),
    }
  }

  private mapStatus(statusCode: string): string {
    const mapping: Record<string, string> = {
      'pre-transit': 'pending',
      transit: 'in_transit',
      'out-for-delivery': 'out_for_delivery',
      delivered: 'delivered',
      failure: 'exception',
    }
    return mapping[statusCode] || 'in_transit'
  }
}

export function createDHLClient(): DHLClient {
  return new DHLClient({
    apiKey: process.env.DHL_API_KEY || '',
    sandbox: process.env.NODE_ENV !== 'production',
  })
}
