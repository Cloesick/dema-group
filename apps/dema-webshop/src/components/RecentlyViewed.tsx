'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Clock, Package, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

export default function RecentlyViewed() {
  const { recentProducts, clearRecentlyViewed } = useRecentlyViewed();
  const [scrollPosition, setScrollPosition] = useState(0);

  if (recentProducts.length === 0) return null;

  const scrollLeft = () => {
    setScrollPosition(prev => Math.max(0, prev - 1));
  };

  const scrollRight = () => {
    setScrollPosition(prev => Math.min(recentProducts.length - 4, prev + 1));
  };

  const visibleProducts = recentProducts.slice(scrollPosition, scrollPosition + 4);

  return (
    <div className="bg-gray-50 border-t border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">Recently Viewed</span>
            <span className="text-xs text-gray-500">({recentProducts.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {recentProducts.length > 4 && (
              <div className="flex gap-1">
                <button
                  onClick={scrollLeft}
                  disabled={scrollPosition === 0}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollRight}
                  disabled={scrollPosition >= recentProducts.length - 4}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={clearRecentlyViewed}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {visibleProducts.map((product) => (
            <Link
              key={product.group_id}
              href={`/product-groups/${product.group_id}${product.catalog ? `?catalog=${product.catalog}` : ''}`}
              className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:shadow-md transition-all flex gap-3"
            >
              <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded relative">
                {product.imageUrl && (product.imageUrl.startsWith('/') || product.imageUrl.startsWith('http')) ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{product.variant_count} variants</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
