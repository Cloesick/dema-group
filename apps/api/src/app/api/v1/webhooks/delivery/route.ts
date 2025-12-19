import { NextRequest, NextResponse } from 'next/server'

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
    location?: { city: string; country: string }
    signedBy?: string
    deliveryDate?: string
    exceptionReason?: string
    estimatedDelivery?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const carrier = request.headers.get('x-carrier') || detectCarrier(request)
    const body = await request.text()

    let payload: CarrierWebhookPayload

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

    // TODO: Update shipment in database
    // await prisma.shipment.update({...})
    // await prisma.shipmentEvent.create({...})

    // TODO: Send customer notification
    // if (payload.event === 'shipment.delivered') {
    //   await sendDeliveryNotification(payload)
    // }

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
  const data = JSON.parse(body)
  return {
    carrier: 'ups',
    event: mapStatusToEvent(data.statusCode),
    trackingNumber: data.trackingNumber,
    timestamp: data.timestamp || new Date().toISOString(),
    data: {
      status: data.status,
      statusCode: data.statusCode,
      location: data.location,
      signedBy: data.signedForByName,
      deliveryDate: data.deliveryDate,
      estimatedDelivery: data.scheduledDeliveryDate,
    },
  }
}

function parseDHLWebhook(body: string): CarrierWebhookPayload {
  const data = JSON.parse(body)
  return {
    carrier: 'dhl',
    event: mapStatusToEvent(data.status?.statusCode),
    trackingNumber: data.id || data.trackingNumber,
    timestamp: data.timestamp || new Date().toISOString(),
    data: {
      status: data.status?.status || data.status,
      statusCode: data.status?.statusCode,
      location: data.status?.location?.address ? {
        city: data.status.location.address.addressLocality,
        country: data.status.location.address.countryCode,
      } : undefined,
      signedBy: data.details?.proofOfDelivery?.signedBy,
      estimatedDelivery: data.estimatedTimeOfDelivery,
    },
  }
}

function parsePostNLWebhook(body: string): CarrierWebhookPayload {
  const data = JSON.parse(body)
  return {
    carrier: 'postnl',
    event: mapStatusToEvent(data.Status?.StatusCode),
    trackingNumber: data.Barcode,
    timestamp: data.Status?.TimeStamp || new Date().toISOString(),
    data: {
      status: data.Status?.StatusDescription,
      statusCode: data.Status?.StatusCode,
      location: { city: data.Status?.LocationCode || '', country: 'NL' },
    },
  }
}

function parseBpostWebhook(body: string): CarrierWebhookPayload {
  const data = JSON.parse(body)
  return {
    carrier: 'bpost',
    event: mapStatusToEvent(data.status),
    trackingNumber: data.itemIdentifier,
    timestamp: data.eventDate || new Date().toISOString(),
    data: {
      status: data.status,
      location: { city: data.location || '', country: 'BE' },
    },
  }
}

function mapStatusToEvent(statusCode: string): CarrierEventType {
  const mapping: Record<string, CarrierEventType> = {
    'M': 'shipment.created',
    'P': 'shipment.picked_up',
    'I': 'shipment.in_transit',
    'O': 'shipment.out_for_delivery',
    'D': 'shipment.delivered',
    'X': 'shipment.exception',
    'RS': 'shipment.returned',
    'pre-transit': 'shipment.created',
    'transit': 'shipment.in_transit',
    'out-for-delivery': 'shipment.out_for_delivery',
    'delivered': 'shipment.delivered',
    'ANNOUNCED': 'shipment.created',
    'IN_TRANSIT': 'shipment.in_transit',
    'OUT_FOR_DELIVERY': 'shipment.out_for_delivery',
    'DELIVERED': 'shipment.delivered',
    'RETURNED': 'shipment.returned',
  }
  return mapping[statusCode] || 'shipment.in_transit'
}
