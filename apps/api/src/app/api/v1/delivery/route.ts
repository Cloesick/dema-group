import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, checkRateLimit } from '@/lib/auth'

export type Carrier = 'ups' | 'dhl' | 'postnl' | 'bpost' | 'fedex' | 'dpd' | 'gls'

export interface TrackingEvent {
  timestamp: string
  status: string
  location: string
  description: string
}

export interface DeliveryTracking {
  trackingNumber: string
  carrier: Carrier
  orderId?: string
  companyId?: string
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception' | 'returned'
  estimatedDelivery?: string
  actualDelivery?: string
  origin: { city: string; country: string }
  destination: { city: string; country: string }
  events: TrackingEvent[]
  lastUpdated: string
}

// GET: Track a shipment
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const trackingNumber = searchParams.get('trackingNumber')
  const carrier = searchParams.get('carrier') as Carrier
  const orderId = searchParams.get('orderId')

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimit = checkRateLimit(`delivery:${clientIp}`, 60, 60000)
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  if (!trackingNumber && !orderId) {
    return NextResponse.json(
      { success: false, error: 'trackingNumber or orderId required' },
      { status: 400 }
    )
  }

  // TODO: Query database or call carrier API
  // const shipment = await prisma.shipment.findFirst({
  //   where: { OR: [{ trackingNumber }, { orderId }] },
  //   include: { events: { orderBy: { timestamp: 'desc' } } },
  // })

  // Mock response
  const mockTracking: DeliveryTracking = {
    trackingNumber: trackingNumber || '1Z999AA10123456784',
    carrier: carrier || 'ups',
    orderId: orderId || 'ORD-2024-001234',
    companyId: 'dema',
    status: 'in_transit',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    origin: { city: 'Roeselare', country: 'Belgium' },
    destination: { city: 'Kortrijk', country: 'Belgium' },
    events: [
      {
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'In Transit',
        location: 'Brussels Hub, Belgium',
        description: 'Package is in transit to destination',
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: 'Departed',
        location: 'Roeselare, Belgium',
        description: 'Package has left the origin facility',
      },
    ],
    lastUpdated: new Date().toISOString(),
  }

  return NextResponse.json({
    success: true,
    data: mockTracking,
    timestamp: new Date().toISOString(),
  })
}

// POST: Create a new shipment
export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { carrier, orderId, recipient, packages } = body

    if (!carrier || !orderId || !recipient) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: carrier, orderId, recipient' },
        { status: 400 }
      )
    }

    // TODO: Call carrier API to create shipment
    // TODO: Store shipment in database
    // TODO: Return tracking number and label URL

    const mockResponse = {
      success: true,
      trackingNumber: `DEMA${Date.now()}`,
      carrier,
      orderId,
      companyId: auth.companyId,
      labelUrl: `https://api.demagroup.be/labels/${orderId}.pdf`,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    )
  }
}
