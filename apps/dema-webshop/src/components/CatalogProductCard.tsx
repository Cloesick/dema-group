'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useQuote } from '@/contexts/QuoteContext';
import { FileText, Check, ShoppingCart, Package, FolderOpen, BookOpen } from 'lucide-react';
import { getPropertyIcon } from '@/config/propertyIcons';

interface CatalogProductCardProps {
  product: any;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export default function CatalogProductCard({ 
  product, 
  viewMode = 'grid',
  className = '' 
}: CatalogProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addToQuote } = useQuote();

  const imageUrl = product.imageUrl || 
    product.media?.find((m: any) => m.role === 'main')?.url ||
    product.image_paths?.[0] ||
    (product.image ? `/api/images/${product.image}` : null);

  const productName = product.label || product.name || product.sku || 'Unknown Product';
  const category = product.catalog || product.category || '';
  const pdfSource = product.pdf_source || product.source_pdf;
  const pdfPage = product.page || product.page_in_pdf || product.source_pages?.[0];

  const excludeKeys = ['sku', 'label', 'name', 'image', 'imageUrl', 'media', 'image_paths', 
    'pdf_source', 'source_pdf', 'page', 'page_in_pdf', 'source_pages', 'catalog', 'category', 
    'brand', 'seo', 'description', 'price', 'priceMode', 'pages', 'images', 'series_id', 
    'series_name', '_enriched', 'type'];
  
  const properties = product.properties || product.attributes || product;
  const propertyEntries = Object.entries(properties).filter(([key, value]) => {
    if (!value || value === '') return false;
    return !excludeKeys.includes(key);
  });

  const handleAddToQuote = () => {
    addToQuote({
      sku: product.sku,
      name: productName,
      imageUrl: imageUrl || undefined,
      category,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  if (viewMode === 'list') {
    return (
      <div className={`flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-200 ${className}`}>
        <Link href={`/products/${product.sku}`} className="w-full sm:w-56 h-56 sm:h-auto flex-shrink-0 relative bg-gradient-to-br from-gray-50 to-white p-4">
          {imageUrl && !imageError ? (
            <Image src={imageUrl} alt={productName} fill sizes="224px" className="object-contain" onError={() => setImageError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Package className="w-16 h-16" />
            </div>
          )}
        </Link>
        <div className="flex-1 p-5 flex flex-col gap-3">
          <Link href={`/products/${product.sku}`}>
            <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">{productName}</h3>
          </Link>
          {product.sku && <span className="text-sm text-gray-500 font-mono">{product.sku}</span>}
          {category && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <FolderOpen className="w-4 h-4" />
              <span>{category.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
            </div>
          )}
          {pdfSource && (
            <div className="flex flex-col gap-1.5">
              <a href={`/api/pdf/Product_pdfs/${pdfSource}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg border border-blue-200 text-sm w-fit">
                <FileText className="w-4 h-4" />
                <span>{pdfSource.replace('.pdf', '')}</span>
              </a>
              {pdfPage && (
                <a href={`/pdf-viewer?file=Product_pdfs/${pdfSource}&page=${pdfPage}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg border border-blue-200 text-sm w-fit">
                  <BookOpen className="w-4 h-4" />
                  <span>Page {pdfPage}</span>
                </a>
              )}
            </div>
          )}
          {propertyEntries.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {propertyEntries.slice(0, 10).map(([key, value]) => (
                <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs" title={key}>
                  <span>{getPropertyIcon(key, String(value))}</span>
                  <span className="font-medium text-gray-700">{String(value)}</span>
                </span>
              ))}
            </div>
          )}
          <div className="mt-auto flex items-center gap-3 pt-3">
            <button onClick={handleAddToQuote}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${justAdded ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white'}`}>
              {justAdded ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingCart className="w-4 h-4" /> Add to Quote</>}
            </button>
            <Link href={`/products/${product.sku}`} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">Details</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-200 hover:border-blue-300 ${className} group`}>
      <Link href={`/products/${product.sku}`} className="relative block w-full aspect-square p-6 bg-gradient-to-br from-gray-50 to-white">
        {imageUrl && !imageError ? (
          <Image src={imageUrl} alt={productName} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300" onError={() => setImageError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package className="w-16 h-16" />
          </div>
        )}
      </Link>
      <div className="p-4 space-y-3">
        <Link href={`/products/${product.sku}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{productName}</h3>
        </Link>
        {product.sku && <span className="text-xs text-gray-500 font-mono block">{product.sku}</span>}
        {category && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FolderOpen className="w-3 h-3" />
            <span className="truncate">{category.replace(/-/g, ' ')}</span>
          </div>
        )}
        {pdfSource && (
          <div className="flex flex-col gap-1">
            <a href={`/api/pdf/Product_pdfs/${pdfSource}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded border border-blue-200 text-xs w-fit">
              <FileText className="w-3 h-3" />
              <span>{pdfSource.replace('.pdf', '')}</span>
            </a>
            {pdfPage && (
              <a href={`/pdf-viewer?file=Product_pdfs/${pdfSource}&page=${pdfPage}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded border border-blue-200 text-xs w-fit">
                <BookOpen className="w-3 h-3" />
                <span>Page {pdfPage}</span>
              </a>
            )}
          </div>
        )}
        {propertyEntries.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {propertyEntries.slice(0, 4).map(([key, value]) => (
              <span key={key} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs" title={key}>
                <span>{getPropertyIcon(key, String(value))}</span>
                <span className="font-medium text-gray-700">{String(value)}</span>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button onClick={handleAddToQuote}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${justAdded ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white'}`}>
            {justAdded ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingCart className="w-4 h-4" /> Quote</>}
          </button>
          <Link href={`/products/${product.sku}`} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">Details</Link>
        </div>
      </div>
    </div>
  );
}
