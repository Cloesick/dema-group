'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Product } from '@/types/product';
import { useInView } from 'react-intersection-observer';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  renderProduct?: (product: Product) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  layout?: 'grid' | 'list';
}

export function ProductList({
  products,
  loading = false,
  hasMore = false,
  onLoadMore,
  renderProduct,
  className = '',
  itemClassName = '',
  layout = 'grid',
}: ProductListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Set up intersection observer for infinite loading
  const [loadMoreRef, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Set up virtualization for list layout only
  const rowVirtualizer = useVirtualizer({
    count: layout === 'list' ? products.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 400, []),
    overscan: 5,
  });

  // Handle infinite loading
  useEffect(() => {
    if (inView && hasMore && !loading && !initialLoad) {
      onLoadMore?.();
    }
    setInitialLoad(false);
  }, [inView, hasMore, loading, onLoadMore, initialLoad]);

  // Default product renderer
  const defaultRenderProduct = (product: Product) => {
    // Images are already extracted as webp from PDFs - use media array or imageUrl
    const primaryMediaUrl = product.media && product.media.length > 0 ? product.media[0]?.url : undefined;
    const imageUrl = product.imageUrl || primaryMediaUrl || product.image_paths?.[0] || '';
    const title = product.description?.split('\n')[0] || product.sku;

    return (
      <div key={product.sku} className={`p-4 border rounded-lg ${itemClassName}`}>
        <div className="w-full overflow-hidden rounded-lg bg-gray-100">
          <ImageWithFallback
            src={imageUrl}
            alt={title}
            width={600}
            height={450}
            className="w-full h-auto object-contain"
            fallbackText={product.product_category}
          />
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.sku}</p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {product.dimensions_mm_list?.[0] 
              ? `€${(product.dimensions_mm_list[0] * 0.5).toFixed(2)}`
              : 'Price on request'}
          </p>
        </div>
      </div>
    );
  };

  const renderer = renderProduct || defaultRenderProduct;

  return (
    <div className={`space-y-4 ${className}`}>
      {layout === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p, idx) => (
            <div key={`${p.sku}-${idx}`}>{renderer(p)}</div>
          ))}
        </div>
      ) : (
        <div
          ref={parentRef}
          className="relative w-full overflow-auto"
          style={{ height: '70vh' }}
        >
          <div
            className="relative w-full"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const product = products[virtualRow.index];
              return (
                <div
                  key={`${product.sku}-${virtualRow.index}`}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="absolute top-0 left-0 w-full p-2"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {renderer(product)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && hasMore && (
        <div ref={loadMoreRef} className="h-4"></div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
}

export default ProductList;
