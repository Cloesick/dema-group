import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/products';
import type { Product } from '@/types/product';

function param(params: URLSearchParams, key: string, fallback?: string) {
  const v = params.get(key);
  return v === null ? fallback : v;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(12, Math.max(1, parseInt(param(searchParams, 'limit', '4') || '4')));
    const category = param(searchParams, 'category') || undefined;
    const preferredCategory = param(searchParams, 'preferredCategory') || undefined;
    const personalized = (param(searchParams, 'personalized', 'false') || 'false') === 'true';
    const sku = param(searchParams, 'sku') || undefined;

    const all = await getProducts();

    const bySku = (id?: string) => (id ? all.find(p => p.sku === id) : undefined);
    const anchor: Product | undefined = bySku(sku);

    let pool = all;
    if (anchor) {
      pool = pool.filter(p => p.sku !== anchor.sku);
    }
    if (category) {
      pool = pool.filter(p => p.product_category === category);
    }

    const cls = (a?: number, b?: number) => {
      if (a == null || b == null) return 0;
      const d = Math.abs(a - b);
      return 1 / (1 + d); // 0..1
    };
    const overlap = (a?: number[], b?: number[]) => {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) return { any: false, near: 0 };
      const setA = new Set(a);
      const any = b.some(v => setA.has(v));
      // nearest distance score if no exact match
      const near = any ? 1 : (() => {
        let best = 0;
        for (const va of a) for (const vb of b) {
          const s = 1 / (1 + Math.abs(va - vb));
          if (s > best) best = s;
        }
        return best;
      })();
      return { any, near };
    };
    const interSize = (A?: string[], B?: string[]) => {
      if (!Array.isArray(A) || !Array.isArray(B)) return 0;
      const normA = A.map(s => s.toLowerCase());
      const normB = B.map(s => s.toLowerCase());
      const uniqueA = Array.from(new Set(normA));
      const setB = new Set(normB);
      let c = 0;
      for (let i = 0; i < uniqueA.length; i++) {
        if (setB.has(uniqueA[i])) c++;
      }
      return uniqueA.length ? c / uniqueA.length : 0;
    };

    let ranked: Product[];
    if (anchor) {
      const samePdfBonus = (p: Product) => {
        let score = 0;
        if (anchor.pdf_source && p.pdf_source && anchor.pdf_source === p.pdf_source) {
          score += 15;
          if (Array.isArray(anchor.source_pages) && Array.isArray(p.source_pages)) {
            const near = anchor.source_pages.some(a => p.source_pages!.some(b => Math.abs(a - b) <= 3));
            if (near) score += 10;
          }
        }
        return score;
      };

      ranked = [...pool].sort((a, b) => {
        const catA = a.product_category === anchor.product_category ? 1 : 0;
        const catB = b.product_category === anchor.product_category ? 1 : 0;

        const dimA = overlap(a.dimensions_mm_list, anchor.dimensions_mm_list);
        const dimB = overlap(b.dimensions_mm_list, anchor.dimensions_mm_list);

        const matA = interSize(a.materials, anchor.materials);
        const matB = interSize(b.materials, anchor.materials);

        const prsA = cls(a.pressure_max_bar, anchor.pressure_max_bar);
        const prsB = cls(b.pressure_max_bar, anchor.pressure_max_bar);
        const vltA = cls(a.voltage_v, anchor.voltage_v);
        const vltB = cls(b.voltage_v, anchor.voltage_v);
        const pwrA = Math.max(cls(a.power_kw, anchor.power_kw), cls(a.power_hp, anchor.power_hp));
        const pwrB = Math.max(cls(b.power_kw, anchor.power_kw), cls(b.power_hp, anchor.power_hp));

        const pdfA = samePdfBonus(a);
        const pdfB = samePdfBonus(b);

        const baseA = 40 * catA + 15 * (dimA.any ? 1 : 0) + 10 * (!dimA.any ? dimA.near : 0) + 15 * matA + 8 * prsA + 8 * vltA + 8 * pwrA + pdfA;
        const baseB = 40 * catB + 15 * (dimB.any ? 1 : 0) + 10 * (!dimB.any ? dimB.near : 0) + 15 * matB + 8 * prsB + 8 * vltB + 8 * pwrB + pdfB;

        if (baseB !== baseA) return baseB - baseA;
        const rat = (b.rating ?? 0) - (a.rating ?? 0);
        if (rat !== 0) return rat;
        const stk = (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0);
        if (stk !== 0) return stk;
        const pa = a.price ?? Number.MAX_SAFE_INTEGER;
        const pb = b.price ?? Number.MAX_SAFE_INTEGER;
        return pa - pb;
      });
    } else {
      // No anchor: fallback to category/personalization sort
      let pool2 = pool;
      if (category) pool2 = pool2.filter(p => p.product_category === category);
      if (personalized && preferredCategory) {
        const preferred = pool2.filter(p => p.product_category === preferredCategory);
        const others = pool2.filter(p => p.product_category !== preferredCategory);
        ranked = [...preferred, ...others];
      } else {
        ranked = [...pool2].sort((a, b) => {
          const ra = (a.rating ?? 0);
          const rb = (b.rating ?? 0);
          if (rb !== ra) return rb - ra;
          const ia = a.inStock ? 1 : 0;
          const ib = b.inStock ? 1 : 0;
          if (ib !== ia) return ib - ia;
          const pa = a.price ?? Number.MAX_SAFE_INTEGER;
          const pb = b.price ?? Number.MAX_SAFE_INTEGER;
          return pa - pb;
        });
      }
    }

    const items = ranked.slice(0, limit);
    return NextResponse.json({ items, personalized: Boolean(anchor) });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to generate recommendations', message: e?.message || 'Unknown error' }, { status: 500 });
  }
}
