import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, checkRateLimit } from '@/lib/auth'

export interface StockUpdate {
  sku: string
  companyId: string
  quantity: number
  reservedQuantity?: number
  warehouseLocation?: string
  reorderPoint?: number
  reorderQuantity?: number
  leadTimeDays?: number
}

// GET: Query stock levels
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sku = searchParams.get('sku')
  const companyId = searchParams.get('companyId')
  const category = searchParams.get('category')
  const lowStock = searchParams.get('lowStock') === 'true'

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
  const rateLimit = checkRateLimit(`inventory:${clientIp}`, 100, 60000)
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.resetAt.toString(),
        }
      }
    )
  }

  // TODO: Query database with Prisma
  // const stock = await prisma.stock.findMany({
  //   where: {
  //     ...(sku && { product: { sku } }),
  //     ...(companyId && { companyId }),
  //     ...(lowStock && { quantity: { lte: prisma.raw('reorder_point') } }),
  //   },
  //   include: { product: true },
  // })

  // Mock response
  const mockStock = [
    {
      sku: sku || 'PUMP-001',
      companyId: companyId || 'dema',
      productName: 'Centrifugal Pump 1HP',
      quantity: 150,
      reservedQuantity: 12,
      availableQuantity: 138,
      warehouseLocation: 'Roeselare-A1',
      status: 'in_stock',
      reorderPoint: 50,
      lastUpdated: new Date().toISOString(),
    },
  ]

  return NextResponse.json({
    success: true,
    data: mockStock,
    meta: {
      total: mockStock.length,
      timestamp: new Date().toISOString(),
    },
  }, {
    headers: {
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    }
  })
}

// POST: Receive stock updates from ERP
export async function POST(request: NextRequest) {
  // Validate API key
  const auth = await validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const updates: StockUpdate[] = Array.isArray(body) ? body : [body]

    // Validate updates
    for (const update of updates) {
      if (!update.sku || update.quantity === undefined) {
        return NextResponse.json(
          { success: false, error: 'Each update requires sku and quantity' },
          { status: 400 }
        )
      }
    }

    // TODO: Process with Prisma
    // await prisma.$transaction(
    //   updates.map(update => 
    //     prisma.stock.upsert({
    //       where: { productId_companyId_warehouseLocation: {...} },
    //       update: { quantity: update.quantity, ... },
    //       create: { ... },
    //     })
    //   )
    // )

    // TODO: Log stock movements
    // TODO: Broadcast real-time updates via WebSocket
    // TODO: Check reorder points and trigger alerts

    console.log(`[Inventory API] Received ${updates.length} updates from ${auth.companyId}`)

    return NextResponse.json({
      success: true,
      message: `Processed ${updates.length} stock updates`,
      companyId: auth.companyId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Inventory API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
