import { NextRequest, NextResponse } from 'next/server'

// Webhook receiver for carrier delivery updates
// Receives tracking updates from UPS, DHL, PostNL, Bpost, etc.

type CarrierEventType = 
  | 'shipment.created'
  | 'shipment.picked_up'
  | 'shipment.in_transit'
  | 'shipment.out_for_delivery'
  | 'shipment.delivered'
  | 'shipment.exception'
  | 'shipment.returned'

interface CarrierWebhookPayload {
  carrier: string
  event: CarrierEventType
  trackingNumber: string
  timestamp: string
  data: {
    status: string
    statusCode?: string
    location?: {
      city: string
      country: string
      postalCode?: string
    }
    signedBy?: string
    deliveryDate?: string
    exceptionReason?: string
    estimatedDelivery?: string
  }
}

// UPS Webhook
export async function POST(request: NextRequest) {
  try {
    const carrier = request.headers.get('x-carrier') || detectCarrier(request)
    const body = await request.text()
    
    let payload: CarrierWebhookPayload
    
    // Each carrier has different payload formats
    switch (carrier) {
      case 'ups':
        payload = parseUPSWebhook(body)
        break
      case 'dhl':
        payload = parseDHLWebhook(body)
        break
      case 'postnl':
        payload = parsePostNLWebhook(body)
        break
      case 'bpost':
        payload = parseBpostWebhook(body)
        break
      default:
        payload = JSON.parse(body)
    }
    
    console.log(`[Delivery Webhook] ${payload.carrier} - ${payload.event}:`, {
      trackingNumber: payload.trackingNumber,
      status: payload.data.status,
    })
    
    // Process the delivery update
    await processDeliveryUpdate(payload)
    
    return NextResponse.json({
      success: true,
      processed: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Delivery Webhook] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

function detectCarrier(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || ''
  const origin = request.headers.get('origin') || ''
  
  if (userAgent.includes('UPS') || origin.includes('ups.com')) return 'ups'
  if (userAgent.includes('DHL') || origin.includes('dhl.com')) return 'dhl'
  if (origin.includes('postnl.nl')) return 'postnl'
  if (origin.includes('bpost.be')) return 'bpost'
  
  return 'unknown'
}

function parseUPSWebhook(body: string): CarrierWebhookPayload {
  // UPS Tracking API webhook format
  // https://developer.ups.com/api/reference/tracking/webhooks
  const data = JSON.parse(body)
  
  return {
    carrier: 'ups',
    event: mapUPSEvent(data.statusCode),
    trackingNumber: data.trackingNumber,
    timestamp: data.timestamp || new Date().toISOString(),
    data: {
      status: data.status,
      statusCode: data.statusCode,
      location: data.location ? {
        city: data.location.city,
        country: data.location.country,
        postalCode: data.location.postalCode,
      } : undefined,
      signedBy: data.signedForByName,
      deliveryDate: data.deliveryDate,
      estimatedDelivery: data.scheduledDeliveryDate,
    },
  }
}

function parseDHLWebhook(body: string): CarrierWebhookPayload {
  // DHL Shipment Tracking API webhook format
  // https://developer.dhl.com/api-reference/shipment-tracking
  const data = JSON.parse(body)
  
  return {
    carrier: 'dhl',
    event: mapDHLEvent(data.status?.statusCode),
    trackingNumber: data.id || data.trackingNumber,
    timestamp: data.timestamp || new Date().toISOString(),
    data: {
      status: data.status?.status || data.status,
      statusCode: data.status?.statusCode,
      location: data.status?.location ? {
        city: data.status.location.address?.addressLocality,
        country: data.status.location.address?.countryCode,
      } : undefined,
      signedBy: data.details?.proofOfDelivery?.signedBy,
      estimatedDelivery: data.estimatedTimeOfDelivery,
    },
  }
}

function parsePostNLWebhook(body: string): CarrierWebhookPayload {
  // PostNL Track & Trace API webhook format
  const data = JSON.parse(body)
  
  return {
    carrier: 'postnl',
    event: mapPostNLEvent(data.Status?.StatusCode),
    trackingNumber: data.Barcode,
    timestamp: data.Status?.TimeStamp || new Date().toISOString(),
    data: {
      status: data.Status?.StatusDescription,
      statusCode: data.Status?.StatusCode,
      location: {
        city: data.Status?.LocationCode || '',
        country: 'NL',
      },
    },
  }
}

function parseBpostWebhook(body: string): CarrierWebhookPayload {
  // Bpost Track & Trace API webhook format
  const data = JSON.parse(body)
  
  return {
    carrier: 'bpost',
    event: mapBpostEvent(data.status),
    trackingNumber: data.itemIdentifier,
    timestamp: data.eventDate || new Date().toISOString(),
    data: {
      status: data.status,
      location: {
        city: data.location || '',
        country: 'BE',
      },
    },
  }
}

function mapUPSEvent(statusCode: string): CarrierEventType {
  const mapping: Record<string, CarrierEventType> = {
    'M': 'shipment.created',
    'P': 'shipment.picked_up',
    'I': 'shipment.in_transit',
    'O': 'shipment.out_for_delivery',
    'D': 'shipment.delivered',
    'X': 'shipment.exception',
    'RS': 'shipment.returned',
  }
  return mapping[statusCode] || 'shipment.in_transit'
}

function mapDHLEvent(statusCode: string): CarrierEventType {
  const mapping: Record<string, CarrierEventType> = {
    'pre-transit': 'shipment.created',
    'transit': 'shipment.in_transit',
    'out-for-delivery': 'shipment.out_for_delivery',
    'delivered': 'shipment.delivered',
    'failure': 'shipment.exception',
  }
  return mapping[statusCode] || 'shipment.in_transit'
}

function mapPostNLEvent(statusCode: string): CarrierEventType {
  const mapping: Record<string, CarrierEventType> = {
    '1': 'shipment.created',
    '2': 'shipment.in_transit',
    '3': 'shipment.out_for_delivery',
    '4': 'shipment.delivered',
    '5': 'shipment.exception',
  }
  return mapping[statusCode] || 'shipment.in_transit'
}

function mapBpostEvent(status: string): CarrierEventType {
  const mapping: Record<string, CarrierEventType> = {
    'ANNOUNCED': 'shipment.created',
    'IN_TRANSIT': 'shipment.in_transit',
    'OUT_FOR_DELIVERY': 'shipment.out_for_delivery',
    'DELIVERED': 'shipment.delivered',
    'RETURNED': 'shipment.returned',
  }
  return mapping[status] || 'shipment.in_transit'
}

async function processDeliveryUpdate(payload: CarrierWebhookPayload) {
  // TODO: Implement actual processing
  // 1. Find order by tracking number
  // 2. Update order status
  // 3. Send notification to customer (email/SMS)
  // 4. Update admin dashboard
  // 5. Trigger any automation (e.g., invoice on delivery)
  
  console.log(`[Delivery] Processing ${payload.event} for ${payload.trackingNumber}`)
  
  if (payload.event === 'shipment.delivered') {
    // TODO: Mark order as delivered
    // TODO: Send delivery confirmation email
    // TODO: Request review/feedback
    console.log(`[Delivery] Order delivered! Signed by: ${payload.data.signedBy || 'N/A'}`)
  }
  
  if (payload.event === 'shipment.exception') {
    // TODO: Alert customer service
    // TODO: Send notification to customer
    console.log(`[Delivery] Exception: ${payload.data.exceptionReason}`)
  }
}
