'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
// Using relative import since absolute import might not be resolving correctly
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useLocale } from '@/contexts/LocaleContext';
import { formatProductForCard } from '@/lib/formatProductForCard';

interface ProductCardProps {
  product: Product;
  className?: string;
  viewMode?: 'grid' | 'list';
}

interface ProductVariant {
  label: string;
  value: string;
}

const formatPropertyName = (key: string): string => {
  // Convert camelCase to Title Case and replace underscores with spaces
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/(\b\w)/g, char => char.toUpperCase())
    .trim();
};

// Translate known spec labels to i18n keys
const translateSpecLabel = (label: string, t: (k: string, vars?: any) => string): string => {
  switch (label) {
    case 'Pressure':
      return t('product.pressure_range');
    case 'Overpressure':
      return t('product.overpressure');
    case 'Flow':
      return t('product.flow');
    case 'Power In/Out':
      return t('product.power_in_out');
    case 'Power':
      return t('product.power');
    case 'Electrical':
      return t('product.electrical');
    case 'RPM':
      return t('product.rpm');
    case 'Cable':
      return t('product.cable');
    case 'Dimensions':
      return t('product.dimensions_mm');
    case 'Weight':
      return t('product.weight');
    case 'Sizes':
      return t('product.available_sizes');
    default:
      return label;
  }
};

export default function ProductCard({ product, className = '', viewMode = 'grid' }: ProductCardProps) {
  const router = useRouter();
  const addToCart = useCartStore(s => s.addToCart);
  const toggleCart = useCartStore(s => s.toggleCart);
  const itemsCount = useCartStore(s => s.items.length);
  const isOpen = useCartStore(s => s.isOpen);
  const { t } = useLocale();
  const vm = formatProductForCard(product);
  const [selectedDimensions, setSelectedDimensions] = useState<number | null>(
    product.dimensions_mm_list?.[0] || null
  );
  
  // Product title: SKU + product type/name
  const productType = product.name || vm.title || '';
  const productName = product.sku + (productType ? ` - ${productType}` : '');
  const categoryDisplay = product.category || product.product_category || '';
  const description = vm.subtitle;
  // Resolution order for images:
  // 1) product.imageUrl from server-side PDF extraction (already includes full path)
  // 2) product.media with 'main' role (webp images from PDF extraction)
  // 3) product.image_paths first item
  // 4) vm.image (placeholder)
  const imageUrl = product.imageUrl || 
                   product.media?.find(m => m.role === 'main')?.url ||
                   product.image_paths?.[0] ||
                   vm.image;
  
  // Format price based on priceMode or selected dimensions
  const isRequestQuote = product.priceMode === 'request_quote' || vm.priceLabel === 'Price on request';
  const price = vm.priceLabel;
  const showPrice = !isRequestQuote && price !== 'Price on request';
  
  // Determine stock status
  const stockStatus = product.stock?.status || (product.inStock ? 'in_stock' : 'unknown');
  const showInStockBadge = stockStatus === 'in_stock';
  
  const hasDimensions = product.dimensions_mm_list && product.dimensions_mm_list.length > 0;
  // Use unique dimensions to avoid duplicate keys/options
  const uniqueDimensions = Array.from(new Set(product.dimensions_mm_list || []));

  const navigateToDetail = () => {
    router.push(`/products/${product.sku}`);
  };

  const onKeyNavigate: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToDetail();
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`flex flex-col sm:flex-row bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-card-hover transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${className}`}
        role="link"
        tabIndex={0}
        onClick={navigateToDetail}
        onKeyDown={onKeyNavigate}
      >
        <div className="w-full sm:w-56 h-56 sm:h-full flex-shrink-0 overflow-hidden bg-white flex items-center justify-center">
          <ImageWithFallback
            src={imageUrl}
            alt={productName}
            width={400}
            height={400}
            className="w-full h-full object-contain"
            fallbackText={categoryDisplay}
          />
        </div>
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              <Link href={`/products/${product.sku}`} className="hover:text-primary" onClick={(e) => e.stopPropagation()}>
                {productName}
              </Link>
            </h3>
            {categoryDisplay && (
              <p className="mt-1 text-sm text-gray-600 font-medium">{categoryDisplay}</p>
            )}
            {(vm.badges?.[0] || showInStockBadge) && (
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {showInStockBadge ? t('product.in_stock') : (vm.badges?.[0] === 'In Stock' ? t('product.in_stock') : vm.badges?.[0])}
              </span>
            )}
            {(product.pdf_source || product.source?.pdf_sources?.[0]) && (
              <div className="mt-2">
                <a
                  href={product.pdf_source || product.source?.pdf_sources?.[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center text-xs text-blue-600 hover:underline"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {t('product.view_pdf')}
                </a>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-lg font-bold text-primary">{price}</p>
            <Link href={`/products/${product.sku}`} className="text-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded" aria-label={t('products.view_details')} onClick={(e) => e.stopPropagation()}>
              {t('products.view_details')}
            </Link>
            <Button
              className="bg-primary hover:bg-primary-dark text-white"
              onClick={(e) => {
                e.stopPropagation();
                if (isRequestQuote) {
                  // Navigate to contact/quote page
                  router.push(`/contact?product=${product.sku}`);
                } else {
                  const wasEmpty = itemsCount === 0;
                  const wasClosed = !isOpen;
                  addToCart(product);
                  if (wasEmpty && wasClosed) {
                    toggleCart();
                  }
                }
              }}
            >
              {isRequestQuote ? t('product.request_quote') : t('product.add_to_cart')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Grid view (default)
  return (
    <div
      className={`group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${className}`}
      role="link"
      tabIndex={0}
      onClick={navigateToDetail}
      onKeyDown={onKeyNavigate}
    >
      <div className="w-full h-56 bg-white overflow-hidden flex items-center justify-center">
        <ImageWithFallback
          src={imageUrl}
          alt={productName}
          width={400}
          height={400}
          className="w-full h-full object-contain p-2"
          fallbackText={product.product_category}
        />
      </div>
      <div className="p-4">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 mb-1 break-words">
              <Link href={`/products/${product.sku}`} className="hover:text-primary" onClick={(e) => e.stopPropagation()}>
                {productName}
              </Link>
            </h3>
            {categoryDisplay && (
              <p className="text-xs text-gray-600 font-medium mb-2">{categoryDisplay}</p>
            )}
            
            {(product.pdf_source || product.source?.pdf_sources?.[0]) && (
              <div className="mb-2">
                <a
                  href={product.pdf_source || product.source?.pdf_sources?.[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center text-xs text-blue-600 hover:underline"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {t('product.view_pdf')}
                </a>
              </div>
            )}
            {(vm.badges?.length || showInStockBadge) ? (
              <div className="mb-2 flex flex-wrap gap-1">
                {showInStockBadge && !vm.badges?.some(b => b === 'In Stock') && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{t('product.in_stock')}</span>
                )}
                {vm.badges?.slice(0,2).map((b) => (
                  <span key={b} className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{b === 'In Stock' ? t('product.in_stock') : b}</span>
                ))}
              </div>
            ) : null}
            
            {/* Dimensions picker for grid view */}
            {hasDimensions && (
              <div className="mt-2">
                <Select
                  value={selectedDimensions?.toString() || ''}
                  onValueChange={(value) => setSelectedDimensions(Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('product.select_size')} />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueDimensions.map((dimension, index) => (
                      <SelectItem key={`${product.sku}-${dimension}-${index}`} value={`${dimension}`}>
                        {dimension}mm
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Curated specs for grid view */}
            <div className="mt-2 space-y-1">
              {vm.specs.slice(0,3).map(spec => (
                <div key={spec.label} className="flex justify-between text-sm">
                  <span className="text-gray-600">{translateSpecLabel(spec.label, t)}:</span>
                  <span className="font-medium text-gray-900">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-lg font-bold text-primary">{price}</p>
            <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60" onClick={(e) => e.stopPropagation()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Product specs */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {vm.specs.map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-gray-500 mr-1">{translateSpecLabel(s.label, t)}:</span>
              <span>{s.value}</span>
            </div>
          ))}
          {Array.isArray(product.dimensions_mm_list) && product.dimensions_mm_list.length > 0 && (
            <div className="flex items-center">
              <span className="text-gray-900 mr-1">{t('product.available_sizes')}:</span>
              <span className="text-gray-900">
                {product.dimensions_mm_list.slice(0, 3).join('mm, ')}mm
                {product.dimensions_mm_list.length > 3 ? '...' : ''}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-4 space-y-2">
          <Link
            href={`/products/${product.sku}`}
            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
            aria-label={t('products.view_details')}
            onClick={(e) => e.stopPropagation()}
          >
            {t('products.view_details')}
          </Link>
          <button
            type="button"
            className="btn-primary w-full flex items-center justify-center px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            onClick={(e) => {
              e.stopPropagation();
              if (isRequestQuote) {
                router.push(`/contact?product=${product.sku}`);
              } else {
                const wasEmpty = itemsCount === 0;
                const wasClosed = !isOpen;
                addToCart(product);
                if (wasEmpty && wasClosed) {
                  toggleCart();
                }
              }
            }}
          >
            {isRequestQuote ? t('product.request_quote') : t('product.add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}
