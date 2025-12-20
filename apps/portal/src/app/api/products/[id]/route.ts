import { NextRequest, NextResponse } from 'next/server'
import type { Product, ApiResponse } from '@/types'

// =============================================================================
// SINGLE PRODUCT API - BLUEPRINT
// =============================================================================
// Endpoints:
// GET /api/products/[id] - Get single product by ID or slug
// PUT /api/products/[id] - Update product (admin)
// DELETE /api/products/[id] - Delete product (admin)
// =============================================================================

// Mock product - Replace with database query
const getMockProduct = (id: string): Product | null => {
  return {
    id,
    sku: `DEMA-${id.toUpperCase()}`,
    name: `Product ${id}`,
    name_nl: `Product ${id}`,
    name_fr: `Produit ${id}`,
    slug: `product-${id}`,
    categoryId: 'pumps',
    subcategoryId: 'centrifugal-pumps',
    brandId: 'dema',
    shortDescription: 'High-quality industrial product',
    shortDescription_nl: 'Hoogwaardig industrieel product',
    shortDescription_fr: 'Produit industriel de haute qualité',
    longDescription: 'Detailed product description goes here.',
    longDescription_nl: 'Gedetailleerde productbeschrijving komt hier.',
    longDescription_fr: 'Description détaillée du produit ici.',
    pricing: {
      currency: 'EUR',
      listPrice: 1250.00,
      tiers: [
        { minQuantity: 1, price: 1250.00 },
        { minQuantity: 5, price: 1187.50, discount: 5 },
        { minQuantity: 10, price: 1125.00, discount: 10 },
      ]
    },
    images: [
      { id: '1', url: '/images/products/dema-pump.svg', alt: 'Product image', isPrimary: true, sortOrder: 1, type: 'product' },
    ],
    documents: [],
    videos: [],
    specifications: [
      { id: '1', groupId: 'general', groupName: 'General', groupName_nl: 'Algemeen', name: 'Material', name_nl: 'Materiaal', name_fr: 'Matériau', value: 'Steel', sortOrder: 1, isFilterable: true, filterType: 'exact' },
    ],
    crossReferences: [],
    compatibility: [],
    relatedProducts: [],
    accessories: [],
    alternatives: [],
    stockStatus: {
      inStock: true,
      quantity: 25,
      warehouses: [
        { warehouseId: 'roeselare', warehouseName: 'Roeselare (BE)', quantity: 15, reserved: 2, available: 13 },
        { warehouseId: 'nl', warehouseName: 'Netherlands', quantity: 10, reserved: 0, available: 10 },
      ]
    },
    minOrderQuantity: 1,
    orderMultiple: 1,
    companies: ['dema'],
    keywords: ['pump', 'industrial'],
    status: 'active',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // TODO: Fetch from database by ID or slug
    const product = getMockProduct(id)
    
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Product with ID ${id} not found`,
          }
        },
        { status: 404 }
      )
    }
    
    const response: ApiResponse<Product> = {
      success: true,
      data: product,
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Product API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching product',
        }
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'API key required' } },
        { status: 401 }
      )
    }
    
    const { id } = params
    const body = await request.json()
    
    // TODO: Validate and update in database
    
    return NextResponse.json({
      success: true,
      data: {
        id,
        ...body,
        updatedAt: new Date().toISOString(),
      }
    })
    
  } catch (error) {
    console.error('Product API error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'API key required' } },
        { status: 401 }
      )
    }
    
    const { id } = params
    
    // TODO: Delete from database
    
    return NextResponse.json({
      success: true,
      data: { id, deleted: true }
    })
    
  } catch (error) {
    console.error('Product API error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}
