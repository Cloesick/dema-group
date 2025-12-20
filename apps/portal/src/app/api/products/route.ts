import { NextRequest, NextResponse } from 'next/server'
import type { Product, SearchQuery, SearchResult, ApiResponse, PaginatedResponse } from '@/types'

// =============================================================================
// PRODUCTS API - BLUEPRINT
// =============================================================================
// Endpoints:
// GET /api/products - List/search products with filters
// POST /api/products - Create product (admin)
// =============================================================================

// Mock product data - Replace with database query
const mockProducts: Partial<Product>[] = Array.from({ length: 100 }, (_, i) => ({
  id: `product-${i + 1}`,
  sku: `DEMA-${String(i + 1).padStart(4, '0')}`,
  name: `Industrial Product ${i + 1}`,
  name_nl: `Industrieel Product ${i + 1}`,
  name_fr: `Produit Industriel ${i + 1}`,
  slug: `industrial-product-${i + 1}`,
  categoryId: ['pumps', 'valves', 'pipes', 'hoses'][i % 4],
  subcategoryId: 'general',
  shortDescription: 'High-quality industrial product',
  shortDescription_nl: 'Hoogwaardig industrieel product',
  shortDescription_fr: 'Produit industriel de haute qualité',
  pricing: {
    currency: 'EUR' as const,
    listPrice: 100 + (i * 25),
    tiers: []
  },
  stockStatus: {
    inStock: i % 3 !== 0,
    quantity: i % 3 !== 0 ? 10 + i : 0,
    warehouses: []
  },
  companies: ['dema'],
  status: 'active' as const,
}))

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const query: SearchQuery = {
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || undefined,
      subcategory: searchParams.get('subcategory') || undefined,
      brand: searchParams.get('brand') || undefined,
      company: searchParams.get('company') || undefined,
      sort: (searchParams.get('sort') as SearchQuery['sort']) || 'relevance',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    }
    
    // Parse filters from query string
    // Format: filters[material]=steel,iron&filters[size]=large
    const filters: Record<string, string[]> = {}
    searchParams.forEach((value, key) => {
      if (key.startsWith('filters[') && key.endsWith(']')) {
        const filterKey = key.slice(8, -1)
        filters[filterKey] = value.split(',')
      }
    })
    if (Object.keys(filters).length > 0) {
      query.filters = filters
    }
    
    // Filter products (mock implementation)
    let filtered = [...mockProducts]
    
    // Text search
    if (query.q) {
      const searchLower = query.q.toLowerCase()
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.name_nl?.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower)
      )
    }
    
    // Category filter
    if (query.category) {
      filtered = filtered.filter(p => p.categoryId === query.category)
    }
    
    // Subcategory filter
    if (query.subcategory) {
      filtered = filtered.filter(p => p.subcategoryId === query.subcategory)
    }
    
    // Company filter
    if (query.company) {
      filtered = filtered.filter(p => p.companies?.includes(query.company!))
    }
    
    // Sort
    switch (query.sort) {
      case 'name_asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'name_desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
        break
      case 'price_asc':
        filtered.sort((a, b) => (a.pricing?.listPrice || 0) - (b.pricing?.listPrice || 0))
        break
      case 'price_desc':
        filtered.sort((a, b) => (b.pricing?.listPrice || 0) - (a.pricing?.listPrice || 0))
        break
      case 'newest':
        // Would sort by createdAt in real implementation
        break
      default:
        // Relevance - keep original order or implement scoring
        break
    }
    
    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / query.limit!)
    const page = Math.min(Math.max(1, query.page!), totalPages || 1)
    const start = (page - 1) * query.limit!
    const items = filtered.slice(start, start + query.limit!)
    
    // Build response
    const response: ApiResponse<PaginatedResponse<Partial<Product>>> = {
      success: true,
      data: {
        items,
        page,
        limit: query.limit!,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
      meta: {
        page,
        limit: query.limit!,
        total,
        totalPages,
      }
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching products',
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key for admin operations
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'API key required',
          }
        },
        { status: 401 }
      )
    }
    
    // TODO: Validate API key against environment variables
    // TODO: Parse and validate product data
    // TODO: Save to database
    
    const body = await request.json()
    
    // Mock response
    return NextResponse.json({
      success: true,
      data: {
        id: 'new-product-id',
        ...body,
        createdAt: new Date().toISOString(),
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while creating product',
        }
      },
      { status: 500 }
    )
  }
}
