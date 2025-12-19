import { Product } from './productUtils';

// Import the JSON file with a dynamic import to avoid type issues
let _products: Product[] = [];

export async function loadProducts(): Promise<Product[]> {
  if (!_products) {
    try {
      // Use dynamic import for JSON files
      const productData = await import('@/public/data/products_for_shop.json');
      _products = productData.default || [];
    } catch (error) {
      console.error('Error loading products:', error);
      _products = [];
    }
  }
  return _products;
}

export async function getProductBySku(sku: string): Promise<Product | undefined> {
  const products = await loadProducts();
  return products.find(p => p.sku === sku);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await loadProducts();
  return products.filter(p => p.product_category === category);
}
