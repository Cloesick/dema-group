import { NextRequest, NextResponse } from 'next/server'

// GET stock for a specific SKU
export async function GET(
  request: NextRequest,
  { params }: { params: { sku: string } }
): Promise<NextResponse> {
  const { sku } = params
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('companyId')

  // TODO: Fetch from database
  // This would query the inventory table for real-time stock levels
  
  const stockData = {
    sku,
    companyId: companyId || 'dema',
    quantity: Math.floor(Math.random() * 200),
    reservedQuantity: Math.floor(Math.random() * 20),
    availableQuantity: 0,
    warehouseLocations: [
      { location: 'Roeselare-A1', quantity: 50 },
      { location: 'Lichtervelde-B2', quantity: 30 },
    ],
    lastUpdated: new Date().toISOString(),
    status: 'in_stock' as 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder',
  }
  
  stockData.availableQuantity = stockData.quantity - stockData.reservedQuantity
  
  if (stockData.availableQuantity <= 0) {
    stockData.status = 'out_of_stock'
  } else if (stockData.availableQuantity < 10) {
    stockData.status = 'low_stock'
  }

  return NextResponse.json({
    success: true,
    data: stockData,
    timestamp: new Date().toISOString(),
  })
}
