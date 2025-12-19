import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const OVERRIDES_FILE = path.join(DATA_DIR, 'product_image_overrides.json');

async function ensureFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(OVERRIDES_FILE).catch(async () => {
      await fs.writeFile(OVERRIDES_FILE, JSON.stringify({}, null, 2), 'utf8');
    });
  } catch (e) {
    // ignore
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureFile();
    const url = new URL(req.url);
    const sku = url.searchParams.get('sku') || undefined;
    const raw = await fs.readFile(OVERRIDES_FILE, 'utf8');
    const data = JSON.parse(raw || '{}') as Record<string, any>;
    if (sku) {
      return NextResponse.json({ [sku]: data[sku] || null });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read overrides' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureFile();
    const body = await req.json();
    const { sku, image_page, image_crop_norm } = body || {};
    if (!sku) {
      return NextResponse.json({ error: 'sku is required' }, { status: 400 });
    }
    const raw = await fs.readFile(OVERRIDES_FILE, 'utf8');
    const data = JSON.parse(raw || '{}') as Record<string, any>;
    const existing = data[sku] || {};
    const updated = {
      ...existing,
      ...(image_page !== undefined ? { image_page } : {}),
      ...(image_crop_norm ? { image_crop_norm } : {}),
      updatedAt: new Date().toISOString(),
    };
    data[sku] = updated;
    await fs.writeFile(OVERRIDES_FILE, JSON.stringify(data, null, 2), 'utf8');
    return NextResponse.json({ ok: true, [sku]: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save overrides' }, { status: 500 });
  }
}
