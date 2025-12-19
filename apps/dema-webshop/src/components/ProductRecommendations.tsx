'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ShoppingCart, Check } from 'lucide-react';
import { useQuote } from '@/contexts/QuoteContext';

interface ProductRecommendationsProps {
  currentProductId: string;
  catalog?: string;
  maxItems?: number;
  title?: string;
}

export default function ProductRecommendations({
  currentProductId,
  catalog,
  maxItems = 4,
  title = "Related Products"
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToQuote, openQuote } = useQuote();
  const [addedSkus, setAddedSkus] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // Load products from the same catalog
        const res = await fetch('/data/products_all_grouped.json');
        if (!res.ok) return;
        
        const allProducts = await res.json();
        
        // Filter by same catalog and exclude current product
        let related = allProducts.filter((p: any) => 
          p.group_id !== currentProductId &&
          (catalog ? p.catalog?.toLowerCase().includes(catalog.toLowerCase()) : true)
        );

        // If not enough from same catalog, add random products
        if (related.length < maxItems) {
          const others = allProducts.filter((p: any) => 
            p.group_id !== currentProductId &&
            !related.some((r: any) => r.group_id === p.group_id)
          );
          related = [...related, ...others];
        }

        // Shuffle and take maxItems
        const shuffled = related.sort(() => Math.random() - 0.5);
        setRecommendations(shuffled.slice(0, maxItems));
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [currentProductId, catalog, maxItems]);

  const handleAddToQuote = (product: any) => {
    const variant = product.variants?.[0];
    if (!variant) return;

    // Combine all properties from variant
    const properties = {
      ...(variant.attributes || {}),
      ...(variant.properties || {}),
    };

    addToQuote({
      sku: variant.sku,
      name: variant.label || product.name,
      imageUrl: product.media?.[0]?.url ? `/api/${product.media[0].url}` : undefined,
      category: product.catalog,
      brand: product.brand,
      properties, // Store all product specifications
    });
    openQuote();

    setAddedSkus(prev => new Set(prev).add(variant.sku));
    setTimeout(() => {
      setAddedSkus(prev => {
        const next = new Set(prev);
        next.delete(variant.sku);
        return next;
      });
    }, 1500);
  };

  if (loading) {
    return (
      <div className="py-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: maxItems }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="py-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => {
          const mainImage = product.media?.find((m: any) => m.role === 'main')?.url;
          const imageUrl = mainImage ? `/api/${mainImage}` : null;
          const variant = product.variants?.[0];
          const isAdded = variant && addedSkus.has(variant.sku);

          const detailUrl = `/product-groups/${product.group_id}${product.catalog ? `?catalog=${product.catalog}` : ''}`;

          return (
            <div
              key={product.group_id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <Link
                href={detailUrl}
                className="block relative aspect-square bg-gray-50 p-4"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-contain group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-gray-900/80 text-white px-2 py-0.5 rounded text-xs">
                  {product.variant_count} SKUs
                </div>
              </Link>
              
              <div className="p-3">
                <Link href={detailUrl}>
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h4>
                </Link>
                {variant && (
                  <button
                    onClick={() => handleAddToQuote(product)}
                    className={`w-full mt-2 py-2 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                      isAdded
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {isAdded ? (
                      <><Check className="w-3 h-3" /> Added</>
                    ) : (
                      <><ShoppingCart className="w-3 h-3" /> Quote</>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
