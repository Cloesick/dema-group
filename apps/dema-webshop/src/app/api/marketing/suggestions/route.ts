import { NextResponse } from 'next/server';
import { getClient } from '@/lib/marketingStore';
import { getProducts } from '@/lib/products';

function scoreProduct(p: any, terms: string[]): number {
  const text = `${(p.sku||'').toLowerCase()} ${(p.name||'').toLowerCase()} ${(p.description||'').toLowerCase()} ${(p.product_category||'').toLowerCase()} ${(Array.isArray(p.connection_types)?p.connection_types.join(' '):'').toLowerCase()}`;
  let s = 0;
  for (const t of terms) {
    if (!t) continue;
    if (text.includes(t)) s += 5;
    if ((p.product_category||'').toLowerCase().includes(t)) s += 3;
    if ((p.sku||'').toLowerCase().includes(t)) s += 2;
  }
  // small boost for inStock and rating
  if (p.inStock) s += 1;
  s += (p.rating||0) * 0.5;
  return s;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = (searchParams.get('clientId') || '').trim();
    const limit = Math.min(12, Math.max(1, parseInt(searchParams.get('limit') || '4')));
    if (!clientId) return NextResponse.json({ items: [], personalized: false });

    const c = getClient(clientId);
    const all = await getProducts();

    if (!c || !c.searches || c.searches.length === 0) {
      // fallback: top rated / in stock
      const items = [...all]
        .sort((a, b) => ((b.rating||0) - (a.rating||0)) || ((b.inStock?1:0) - (a.inStock?1:0)))
        .slice(0, limit);
      return NextResponse.json({ items, personalized: false });
    }

    // Use latest 5 unique terms
    const uniq: string[] = [];
    for (let i = c.searches.length - 1; i >= 0 && uniq.length < 5; i--) {
      const t = c.searches[i];
      if (!uniq.includes(t)) uniq.push(t);
    }

    const ranked = [...all]
      .map(p => ({ p, s: scoreProduct(p, uniq) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, limit)
      .map(x => x.p);

    return NextResponse.json({ items: ranked, personalized: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to build suggestions', details: e?.message || String(e) }, { status: 500 });
  }
}
