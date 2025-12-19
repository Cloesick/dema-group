import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { promises as fsp } from 'fs';

interface Product {
  sku: string;
  description: string;
  product_category: string;
  dimensions_mm_list?: number[];
  material?: string;
  weight_kg?: number;
  image_url?: string;
  [key: string]: any;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sku } = await params;
    const jsonDirectory = path.join(process.cwd(), 'public', 'data');
    const filePath = path.join(jsonDirectory, 'products_for_shop.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const products: Product[] = JSON.parse(fileContents);

    const before = products.length;
    const updated = products.filter((p) => p.sku !== sku);

    if (updated.length === before) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf8');
    try {
      const logDir = path.join(process.cwd(), 'public', 'data');
      await fsp.mkdir(logDir, { recursive: true });
      const line = JSON.stringify({ ts: new Date().toISOString(), action: 'product_delete', by: (session?.user as any)?.aliasEmail || session?.user?.email, sku }) + '\n';
      await fsp.appendFile(path.join(logDir, 'admin_activity.log'), line, 'utf8');
    } catch {}
    return NextResponse.json({ ok: true, deleted: sku });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sku: string }> }
) {
  try {
    const { sku } = await params;
    
    // Read the JSON file
    const jsonDirectory = path.join(process.cwd(), 'public', 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/products_for_shop.json', 'utf8');
    const products: Product[] = JSON.parse(fileContents);
    
    // Find the product by SKU
    const product = products.find(p => p.sku === sku);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
