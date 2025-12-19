import { NextRequest, NextResponse } from 'next/server'

// Stock/Inventory API
// Receives real-time inventory updates from ERP systems (per company)

export interface StockUpdate {
  sku: string
  companyId: 'dema' | 'fluxer' | 'beltz247' | 'devisschere' | 'accu'
  quantity: number
  reservedQuantity?: number
  availableQuantity?: number
  warehouseLocation?: string
  lastUpdated: string
  reorderPoint?: number
  reorderQuantity?: number
  leadTimeDays?: number
}

export interface StockResponse {
  success: boolean
  data?: StockUpdate[]
  error?: string
  timestamp: string
}

// GET: Retrieve stock levels for products
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sku = searchParams.get('sku')
  const companyId = searchParams.get('companyId')
  
  // TODO: Connect to actual database/ERP
  // This is a placeholder that would connect to:
  // - DEMA ERP system
  // - Fluxer inventory system
  // - Beltz247 stock management
  // - De Visschere inventory
  // - Accu Components API
  
  const mockStock: StockUpdate[] = [
    {
      sku: sku || 'DEMO-001',
      companyId: (companyId as StockUpdate['companyId']) || 'dema',
      quantity: 150,
      reservedQuantity: 12,
      availableQuantity: 138,
      warehouseLocation: 'Roeselare-A1',
      lastUpdated: new Date().toISOString(),
      reorderPoint: 50,
      reorderQuantity: 100,
      leadTimeDays: 5,
    },
  ]

  return NextResponse.json({
    success: true,
    data: mockStock,
    timestamp: new Date().toISOString(),
  } as StockResponse)
}

// POST: Receive stock updates from ERP systems
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const apiKey = request.headers.get('x-api-key')
    
    // Validate API key
    if (!apiKey || !isValidApiKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      )
    }
    
    const updates: StockUpdate[] = Array.isArray(body) ? body : [body]
    
    // Validate each update
    for (const update of updates) {
      if (!update.sku || !update.companyId || update.quantity === undefined) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: sku, companyId, quantity' },
          { status: 400 }
        )
      }
    }
    
    // TODO: Process updates
    // 1. Update database
    // 2. Trigger real-time notifications (WebSocket/SSE)
    // 3. Update search index
    // 4. Check reorder points and trigger alerts
    
    console.log(`[Inventory API] Received ${updates.length} stock updates`)
    
    return NextResponse.json({
      success: true,
      message: `Processed ${updates.length} stock updates`,
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

function isValidApiKey(apiKey: string): boolean {
  // TODO: Implement proper API key validation
  // Check against database of valid API keys per company
  const validKeys = process.env.INVENTORY_API_KEYS?.split(',') || []
  return validKeys.includes(apiKey) || apiKey.startsWith('dema_') // Dev mode
}
