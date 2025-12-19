import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

interface Product {
  sku: string;
  description: string;
  product_category: string;
  [key: string]: any;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // Read the JSON file
    const jsonDirectory = path.join(process.cwd(), 'public', 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/products_for_shop.json', 'utf8');
    const products: Product[] = JSON.parse(fileContents);

    // Simple search function that matches query against multiple fields
    const searchInProduct = (product: Product, query: string): boolean => {
      const searchableFields = [
        product.sku?.toLowerCase(),
        product.description?.toLowerCase(),
        product.product_category?.toLowerCase(),
        product.connection_types?.join(' ').toLowerCase(),
        product.dimensions_mm_list?.join(' ').toLowerCase(),
        product.pressure_max_bar?.toString(),
        product.pressure_min_bar?.toString(),
      ].filter(Boolean).join(' ');

      return searchableFields.includes(query);
    };

    // Filter products based on search query
    const results = products.filter(product => 
      searchInProduct(product, query) ||
      query.split(' ').every(term => 
        term.length > 1 && searchInProduct(product, term)
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}
