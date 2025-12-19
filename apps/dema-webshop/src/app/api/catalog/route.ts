import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cache the data in memory
let catalogProducts: any[] | null = null;
let catalogIndex: any | null = null;

function loadCatalogData() {
  if (!catalogProducts) {
    try {
      const productsPath = path.join(process.cwd(), 'src', 'data', 'catalog_products.json');
      const indexPath = path.join(process.cwd(), 'src', 'data', 'catalog_index.json');
      
      catalogProducts = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
      catalogIndex = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    } catch (error) {
      console.error('Error loading catalog data:', error);
      catalogProducts = [];
      catalogIndex = { catalogs: {} };
    }
  }
  return { catalogProducts, catalogIndex };
}

export async function GET(request: Request) {
  const { catalogProducts, catalogIndex } = loadCatalogData();
  
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '24');
  const search = searchParams.get('search')?.toLowerCase() || '';
  const catalog = searchParams.get('catalog') || '';
  
  // Filter products
  let filtered = catalogProducts || [];
  
  if (search) {
    filtered = filtered.filter((p: any) => 
      p.sku.toLowerCase().includes(search) ||
      p.name.toLowerCase().includes(search) ||
      p.catalog.toLowerCase().includes(search)
    );
  }
  
  if (catalog) {
    const catalogLower = catalog.toLowerCase();
    filtered = filtered.filter((p: any) => 
      p.pdf_source?.toLowerCase().includes(catalogLower) ||
      p.catalog?.toLowerCase().includes(catalogLower)
    );
  }
  
  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);
  
  return NextResponse.json({
    products: paginated,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit)
    },
    catalogs: catalogIndex?.catalogs || {}
  });
}
