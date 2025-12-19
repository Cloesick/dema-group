'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Package, FileText, ShoppingCart, Check, ChevronDown, ExternalLink, GitCompare } from 'lucide-react';
import { useQuote } from '@/contexts/QuoteContext';
import { useCompare } from '@/contexts/CompareContext';
import { getPropertyDisplay } from '@/config/propertyIcons';

interface QuickViewModalProps {
  productGroup: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ productGroup, isOpen, onClose }: QuickViewModalProps) {
  const [selectedVariantSku, setSelectedVariantSku] = useState('');
  const [justAdded, setJustAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToQuote, openQuote } = useQuote();
  const { addToCompare, isInCompare, canAddMore } = useCompare();

  useEffect(() => {
    if (productGroup?.variants?.[0]) {
      setSelectedVariantSku(productGroup.default_variant_sku || productGroup.variants[0].sku);
    }
  }, [productGroup]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !productGroup) return null;

  const selectedVariant = productGroup.variants?.find((v: any) => v.sku === selectedVariantSku) 
    || productGroup.variants?.[0] 
    || { sku: 'N/A', properties: {} };

  const mainImage = productGroup.media?.find((m: any) => m.role === 'main')?.url;
  const imageUrl = mainImage ? `/api/${mainImage}` : null;

  const pdfSource = productGroup.source_pdf || selectedVariant?.pdf_source;
  const pdfPage = selectedVariant?.page || selectedVariant?.page_in_pdf;

  const properties = {
    ...(selectedVariant?.attributes || {}),
    ...(selectedVariant?.properties || {}),
  };

  const propertyEntries = Object.entries(properties).filter(([key, value]) => {
    if (!value || value === '') return false;
    if (['type', 'bestelnr', 'sku_series', 'page_in_pdf', 'pdf_source', 'catalog', 'brand', 'sku'].includes(key)) return false;
    return true;
  });

  const handleAddToQuote = () => {
    addToQuote({
      sku: selectedVariant.sku,
      name: selectedVariant.label || selectedVariant.sku,
      imageUrl: imageUrl || undefined,
      category: productGroup.catalog,
      brand: productGroup.brand,
      properties, // Store all product specifications
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    openQuote();
  };

  const handleAddToCompare = () => {
    addToCompare({
      group_id: productGroup.group_id,
      sku: selectedVariant.sku,
      name: selectedVariant.label || productGroup.name,
      imageUrl: imageUrl,
      catalog: productGroup.catalog || '',
      properties
    });
  };

  const inCompare = isInCompare(selectedVariant.sku);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-white p-8">
            <div className="absolute top-4 left-4 bg-gray-900/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
              <Package className="w-4 h-4" />
              {productGroup.variant_count} variants
            </div>
            {imageUrl && !imageError ? (
              <Image
                src={imageUrl}
                alt={productGroup.name}
                fill
                sizes="400px"
                className="object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package className="w-24 h-24" />
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 overflow-y-auto max-h-[90vh] md:max-h-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{productGroup.name}</h2>

            {/* SKU Selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">
                Select SKU
              </label>
              <select
                value={selectedVariantSku}
                onChange={(e) => setSelectedVariantSku(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none"
              >
                {productGroup.variants?.map((v: any) => (
                  <option key={v.sku} value={v.sku}>{v.sku}</option>
                ))}
              </select>
            </div>

            {/* PDF Info */}
            {pdfSource && (
              <div className="flex items-center gap-3 text-sm mb-4 p-3 bg-gray-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
                <a 
                  href={`/api/pdf/Product_pdfs/${pdfSource}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {pdfSource}
                </a>
                {pdfPage && (
                  <a 
                    href={`/pdf-viewer?file=Product_pdfs/${pdfSource}&page=${pdfPage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-blue-200 hover:bg-blue-300 text-blue-800 font-bold rounded text-xs"
                  >
                    Page {pdfPage}
                  </a>
                )}
              </div>
            )}

            {/* Properties */}
            {propertyEntries.length > 0 && (
              <div className="mb-6">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Specifications
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {propertyEntries.slice(0, 10).map(([key, value]) => {
                    const displayValue = String(value);
                    const { icon, bg, text } = getPropertyDisplay(key, displayValue);
                    return (
                      <div 
                        key={key}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bg} ${text}`}
                      >
                        <span className="text-lg">{icon}</span>
                        <div>
                          <div className="text-xs opacity-70 capitalize">{key.replace(/_/g, ' ')}</div>
                          <div className="font-medium text-sm">{displayValue}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleAddToQuote}
                className={`w-full py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  justAdded ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white'
                }`}
              >
                {justAdded ? (
                  <><Check className="w-5 h-5" /> Added to Quote</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Add to Quote</>
                )}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCompare}
                  disabled={inCompare || !canAddMore}
                  className={`flex-1 py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-semibold ${
                    inCompare 
                      ? 'bg-blue-500 text-white' 
                      : canAddMore 
                        ? 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600' 
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <GitCompare className="w-5 h-5" />
                  {inCompare ? 'In Compare' : 'Compare'}
                </button>

                <Link
                  href={`/product-groups/${productGroup.group_id}${productGroup.catalog ? `?catalog=${productGroup.catalog}` : ''}`}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  onClick={onClose}
                >
                  <ExternalLink className="w-5 h-5" />
                  Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
