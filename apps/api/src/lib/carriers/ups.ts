// UPS API Integration
// Docs: https://developer.ups.com/api/reference

interface UPSConfig {
  clientId: string
  clientSecret: string
  accountNumber?: string
  sandbox?: boolean
}

interface UPSTrackingResponse {
  trackResponse: {
    shipment: Array<{
      package: Array<{
        trackingNumber: string
        activity: Array<{
          status: { type: string; description: string }
          location: { address: { city: string; country: string } }
          date: string
          time: string
        }>
        deliveryDate?: Array<{ date: string }>
      }>
    }>
  }
}

export class UPSClient {
  private baseUrl: string
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(private config: UPSConfig) {
    this.baseUrl = config.sandbox
      ? 'https://wwwcie.ups.com'
      : 'https://onlinetools.ups.com'
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const response = await fetch(`${this.baseUrl}/security/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${this.config.clientId}:${this.config.clientSecret}`
        ).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      throw new Error(`UPS auth failed: ${response.status}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
    return this.accessToken
  }

  async trackPackage(trackingNumber: string) {
    const token = await this.getAccessToken()

    const response = await fetch(
      `${this.baseUrl}/api/track/v1/details/${trackingNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          transId: `dema-${Date.now()}`,
          transactionSrc: 'DEMA Group',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`UPS tracking failed: ${response.status}`)
    }

    const data: UPSTrackingResponse = await response.json()
    return this.normalizeTrackingResponse(data)
  }

  async createShipment(shipmentData: {
    shipper: { name: string; address: object }
    recipient: { name: string; address: object }
    packages: Array<{ weight: number; dimensions?: object }>
    service: string
  }) {
    const token = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/api/shipments/v1/ship`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        transId: `dema-${Date.now()}`,
        transactionSrc: 'DEMA Group',
      },
      body: JSON.stringify({
        ShipmentRequest: {
          Shipment: {
            Shipper: shipmentData.shipper,
            ShipTo: shipmentData.recipient,
            Package: shipmentData.packages,
            Service: { Code: shipmentData.service },
          },
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`UPS shipment failed: ${error}`)
    }

    return response.json()
  }

  async registerWebhook(webhookUrl: string, events: string[]) {
    const token = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/api/track/v1/subscription`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callbackURL: webhookUrl,
        trackingNumberList: [], // Will be added per shipment
        eventTypes: events,
      }),
    })

    return response.json()
  }

  private normalizeTrackingResponse(data: UPSTrackingResponse) {
    const pkg = data.trackResponse.shipment[0]?.package[0]
    if (!pkg) return null

    return {
      trackingNumber: pkg.trackingNumber,
      carrier: 'ups',
      status: this.mapStatus(pkg.activity[0]?.status.type),
      estimatedDelivery: pkg.deliveryDate?.[0]?.date,
      events: pkg.activity.map((a) => ({
        timestamp: `${a.date}T${a.time}`,
        status: a.status.description,
        location: `${a.location.address.city}, ${a.location.address.country}`,
      })),
    }
  }

  private mapStatus(upsStatus: string): string {
    const mapping: Record<string, string> = {
      M: 'pending',
      P: 'picked_up',
      I: 'in_transit',
      O: 'out_for_delivery',
      D: 'delivered',
      X: 'exception',
    }
    return mapping[upsStatus] || 'in_transit'
  }
}

// Factory function
export function createUPSClient(): UPSClient {
  return new UPSClient({
    clientId: process.env.UPS_CLIENT_ID || '',
    clientSecret: process.env.UPS_CLIENT_SECRET || '',
    sandbox: process.env.NODE_ENV !== 'production',
  })
}
