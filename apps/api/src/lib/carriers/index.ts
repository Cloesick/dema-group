// Carrier Integration Hub
// Unified interface for all carrier APIs

import { createUPSClient, UPSClient } from './ups'
import { createDHLClient, DHLClient } from './dhl'

export type Carrier = 'ups' | 'dhl' | 'postnl' | 'bpost' | 'fedex' | 'dpd' | 'gls'

export interface TrackingResult {
  trackingNumber: string
  carrier: Carrier
  status: string
  estimatedDelivery?: string
  actualDelivery?: string
  events: Array<{
    timestamp: string
    status: string
    location: string
  }>
}

export interface ShipmentRequest {
  carrier: Carrier
  shipper: {
    name: string
    company?: string
    street: string
    city: string
    postalCode: string
    country: string
    phone?: string
    email?: string
  }
  recipient: {
    name: string
    company?: string
    street: string
    city: string
    postalCode: string
    country: string
    phone?: string
    email?: string
  }
  packages: Array<{
    weight: number // kg
    length?: number // cm
    width?: number // cm
    height?: number // cm
    description?: string
  }>
  service?: string // carrier-specific service code
  reference?: string // your order ID
}

export interface ShipmentResult {
  trackingNumber: string
  carrier: Carrier
  labelUrl?: string
  estimatedDelivery?: string
}

class CarrierHub {
  private ups: UPSClient | null = null
  private dhl: DHLClient | null = null

  getUPS(): UPSClient {
    if (!this.ups) {
      this.ups = createUPSClient()
    }
    return this.ups
  }

  getDHL(): DHLClient {
    if (!this.dhl) {
      this.dhl = createDHLClient()
    }
    return this.dhl
  }

  async track(carrier: Carrier, trackingNumber: string): Promise<TrackingResult | null> {
    switch (carrier) {
      case 'ups':
        return this.getUPS().trackPackage(trackingNumber)
      case 'dhl':
        return this.getDHL().trackShipment(trackingNumber)
      case 'postnl':
        return this.trackPostNL(trackingNumber)
      case 'bpost':
        return this.trackBpost(trackingNumber)
      default:
        throw new Error(`Carrier ${carrier} not implemented`)
    }
  }

  async createShipment(request: ShipmentRequest): Promise<ShipmentResult> {
    switch (request.carrier) {
      case 'ups':
        const upsResult = await this.getUPS().createShipment({
          shipper: { name: request.shipper.name, address: request.shipper },
          recipient: { name: request.recipient.name, address: request.recipient },
          packages: request.packages,
          service: request.service || '03', // UPS Ground
        })
        return {
          trackingNumber: upsResult.ShipmentResponse?.ShipmentResults?.ShipmentIdentificationNumber,
          carrier: 'ups',
          labelUrl: upsResult.ShipmentResponse?.ShipmentResults?.PackageResults?.[0]?.ShippingLabel?.GraphicImage,
        }

      case 'dhl':
        const dhlResult = await this.getDHL().createShipment({
          shipper: { name: request.shipper.name, address: request.shipper },
          recipient: { name: request.recipient.name, address: request.recipient },
          packages: request.packages,
          productCode: request.service || 'N', // DHL Express
        })
        return {
          trackingNumber: dhlResult.shipmentTrackingNumber,
          carrier: 'dhl',
          labelUrl: dhlResult.documents?.[0]?.url,
        }

      default:
        throw new Error(`Carrier ${request.carrier} shipment not implemented`)
    }
  }

  // PostNL - Netherlands
  private async trackPostNL(trackingNumber: string): Promise<TrackingResult | null> {
    const apiKey = process.env.POSTNL_API_KEY
    if (!apiKey) throw new Error('POSTNL_API_KEY not configured')

    const response = await fetch(
      `https://api.postnl.nl/shipment/v2/status/barcode/${trackingNumber}`,
      {
        headers: { apikey: apiKey },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const shipment = data.CurrentStatus?.Shipment

    return {
      trackingNumber,
      carrier: 'postnl',
      status: this.mapPostNLStatus(shipment?.Status?.StatusCode),
      events: shipment?.OldStatuses?.map((s: any) => ({
        timestamp: s.TimeStamp,
        status: s.StatusDescription,
        location: s.LocationCode || 'Netherlands',
      })) || [],
    }
  }

  // Bpost - Belgium
  private async trackBpost(trackingNumber: string): Promise<TrackingResult | null> {
    const apiKey = process.env.BPOST_API_KEY
    if (!apiKey) throw new Error('BPOST_API_KEY not configured')

    const response = await fetch(
      `https://api.bpost.be/services/trackedmail/item/${trackingNumber}`,
      {
        headers: { Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}` },
      }
    )

    if (!response.ok) return null

    const data = await response.json()

    return {
      trackingNumber,
      carrier: 'bpost',
      status: this.mapBpostStatus(data.status),
      events: data.events?.map((e: any) => ({
        timestamp: e.date,
        status: e.status,
        location: e.location || 'Belgium',
      })) || [],
    }
  }

  private mapPostNLStatus(code: string): string {
    const mapping: Record<string, string> = {
      '1': 'pending',
      '2': 'in_transit',
      '3': 'out_for_delivery',
      '4': 'delivered',
      '5': 'exception',
    }
    return mapping[code] || 'in_transit'
  }

  private mapBpostStatus(status: string): string {
    const mapping: Record<string, string> = {
      ANNOUNCED: 'pending',
      IN_TRANSIT: 'in_transit',
      OUT_FOR_DELIVERY: 'out_for_delivery',
      DELIVERED: 'delivered',
      RETURNED: 'returned',
    }
    return mapping[status] || 'in_transit'
  }
}

// Singleton instance
export const carriers = new CarrierHub()
