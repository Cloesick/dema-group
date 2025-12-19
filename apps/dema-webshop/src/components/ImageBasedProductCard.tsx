'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ExternalLink } from 'lucide-react';
import { useQuote } from '@/contexts/QuoteContext';
import { getPropertyIcon, formatPropertyName } from '@/lib/propertyIcons';
import { 
  groupPropertiesByCategory, 
  getCategoryConfig,
  type CategorizedProperties 
} from '@/lib/propertyCategories';
import { getImageDisplayInfo } from '@/lib/imageBrandFilter';
import { getSkuImagePath } from '@/lib/skuImageMap';

interface ImageBasedProductCardProps {
  productGroup: {
    image: string;
    series_image?: string;
    all_images?: string[];
    catalog: string;
    source_pdf: string;
    page: number;
    products: Array<{
      sku: string;
      page: number;
      properties: Record<string, any>;
    }>;
  };
  viewMode?: 'grid' | 'list';
  className?: string;
}

export default function ImageBasedProductCard({ 
  productGroup, 
  viewMode = 'grid',
  className = '' 
}: ImageBasedProductCardProps) {
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [skuImagePath, setSkuImagePath] = useState<string | null>(null);
  const { addToQuote } = useQuote();

  const selectedProduct = productGroup.products[selectedProductIndex] || productGroup.products[0];
  
  // Load SKU-specific image from extracted PDFs
  useEffect(() => {
    if (selectedProduct?.sku) {
      getSkuImagePath(selectedProduct.sku).then(path => {
        setSkuImagePath(path);
        setImageError(false);
      });
    }
  }, [selectedProduct?.sku]);
  
  // Check if image contains brand name - only show if it doesn't
  const imageDisplayInfo = getImageDisplayInfo(productGroup);
  const fallbackImageUrl = imageDisplayInfo.shouldDisplay && imageDisplayInfo.imagePath 
    ? `/${imageDisplayInfo.imagePath}` 
    : null;
  
  // Prefer SKU-specific image, fallback to group image
  const imageUrl = skuImagePath || fallbackImageUrl;
  
  // Categorize properties
  const categorizedProps: CategorizedProperties[] = groupPropertiesByCategory(
    selectedProduct.properties
  );

  // Handle SKU change
  const handleSKUChange = (index: number) => {
    setSelectedProductIndex(index);
  };

  // Add to quote
  const handleAddToQuote = () => {
    addToQuote({
      sku: selectedProduct.sku || 'N/A',
      name: `${productGroup.catalog} - ${selectedProduct.sku}`,
      imageUrl: imageUrl || undefined,
      category: productGroup.catalog,
      properties: selectedProduct.properties || {}, // Store all product specifications
    });
  };

  if (viewMode === 'list') {
    return (
      <div className={`flex flex-col md:flex-row bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border ${className}`}>
        {/* Image Section */}
        <div className="w-full md:w-80 h-80 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 relative">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={selectedProduct.sku}
              className="w-full h-full object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <FileText className="w-20 h-20 mb-2" />
              <span className="text-sm text-gray-500">{selectedProduct.sku}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6">
          {/* Fixed Section 1: SKU, PDF Links */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏷️ SKU
              </label>
              <select
                value={selectedProductIndex}
                onChange={(e) => handleSKUChange(Number(e.target.value))}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {productGroup.products.map((product, index) => (
                  <option key={index} value={index}>
                    {product.sku || `Product ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 text-sm">
              <a
                href={`/api/pdf/Product_pdfs/${productGroup.source_pdf}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <FileText className="w-4 h-4" />
                View PDF
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-gray-600">
                📖 Page: <span className="font-semibold">{selectedProduct.page}</span>
              </span>
            </div>
          </div>

          {/* Dynamic Property Sections */}
          <div className="space-y-4 mb-6">
            {categorizedProps.map(({ category, properties }) => {
              const config = getCategoryConfig(category);
              return (
                <div
                  key={category}
                  className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-4`}
                >
                  <h3 className={`${config.textColor} font-bold text-sm mb-3 flex items-center gap-2`}>
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {properties.map(({ key, value }) => (
                      <div key={key} className="flex items-start gap-2">
                        <span className="text-lg flex-shrink-0" title={formatPropertyName(key)}>
                          {getPropertyIcon(key)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-600 font-medium">
                            {formatPropertyName(key)}
                          </div>
                          <div className="text-sm text-gray-900 font-semibold truncate">
                            {String(value)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToQuote}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-sm hover:shadow-md"
            >
              Add to Quote
            </button>
            <Link
              href={`/products/${selectedProduct.sku}`}
              className="flex-1 text-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className={`group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border ${className}`}>
      {/* Image Section */}
      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        {productGroup.products.length > 1 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
            {productGroup.products.length} SKUs
          </div>
        )}
        
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={selectedProduct.sku}
            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <FileText className="w-16 h-16 mb-2" />
            <span className="text-sm text-gray-500 text-center px-2">{selectedProduct.sku}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Fixed Section 1: SKU, PDF Links */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              🏷️ SKU
            </label>
            <select
              value={selectedProductIndex}
              onChange={(e) => handleSKUChange(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {productGroup.products.map((product, index) => (
                <option key={index} value={index}>
                  {product.sku || `Product ${index + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <a
              href={`/api/pdf/Product_pdfs/${productGroup.source_pdf}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              <FileText className="w-3 h-3" />
              {productGroup.source_pdf}
            </a>
            <span className="text-gray-600">
              📖 Page: <span className="font-semibold">{selectedProduct.page}</span>
            </span>
          </div>
        </div>

        {/* Dynamic Property Sections (compact for grid) */}
        <div className="space-y-3 mb-4">
          {categorizedProps.map(({ category, properties }) => {
            const config = getCategoryConfig(category);
            // Show max 4 properties per category in grid view
            const displayProps = properties.slice(0, 4);
            
            return (
              <div
                key={category}
                className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3`}
              >
                <h4 className={`${config.textColor} font-bold text-xs mb-2 flex items-center gap-1`}>
                  <span className="text-sm">{config.icon}</span>
                  <span>{config.label}</span>
                </h4>
                <div className="space-y-2">
                  {displayProps.map(({ key, value }) => (
                    <div key={key} className="flex items-center justify-between text-xs gap-2">
                      <span className="flex items-center gap-1 text-gray-600 flex-shrink-0">
                        <span className="text-sm">{getPropertyIcon(key)}</span>
                        <span className="font-medium truncate">
                          {formatPropertyName(key)}:
                        </span>
                      </span>
                      <span className="font-semibold text-gray-900 text-right">
                        {String(value)}
                      </span>
                    </div>
                  ))}
                  {properties.length > 4 && (
                    <div className="text-xs text-gray-500 italic">
                      +{properties.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleAddToQuote}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-sm hover:shadow-md text-sm"
          >
            Add to Quote
          </button>
          <Link
            href={`/products/${selectedProduct.sku}`}
            className="block w-full text-center px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
