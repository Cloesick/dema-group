'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useQuote } from '@/contexts/QuoteContext';
import { ChevronDown, Package, FileText, Check, ShoppingCart, ExternalLink, GitCompare, Eye } from 'lucide-react';
import { getPropertyDisplay } from '@/config/propertyIcons';
import { useCompare } from '@/contexts/CompareContext';
import QuickViewModal from './QuickViewModal';

// Unit mappings for property values
const UNIT_MAPPINGS: Record<string, string> = {
  'diameter_mm': 'mm', 'diameter': 'mm', 'binnen_dia_mm': 'mm', 'buiten_dia_mm': 'mm',
  'binnen_dia': 'mm', 'buiten_dia': 'mm', 'binnendiameter': 'mm', 'buitendiameter': 'mm',
  'length_m': 'm', 'length_mm': 'mm', 'lengte': 'm',
  'pressure_bar': 'bar', 'werkdruk': 'bar', 'druk': 'bar', 'barstdruk': 'bar',
  'weight_kg': 'kg', 'gewicht': 'kg', 'gewicht_kg': 'kg', 'gewicht_g_m': 'g/m',
  'wanddikte': 'mm', 'wanddikte_mm': 'mm', 'dikte': 'mm',
  'buigradius': 'mm', 'buigstraal': 'mm',
  'power_kw': 'kW', 'vermogen': 'kW', 'voltage_v': 'V', 'spanning': 'V',
  'flow_l_min': 'L/min', 'debiet': 'L/min', 'capaciteit': 'L/min',
  'temp_c': '°C', 'temperatuur': '°C', 'rpm': 'RPM', 'toerental': 'RPM',
  'volume_l': 'L', 'inhoud': 'L', 'geluid': 'dB(A)', 'vacu_m_bar': 'bar',
};

// Property descriptions for tooltips
const PROPERTY_DESCRIPTIONS: Record<string, string> = {
  'diameter_mm': 'Diameter', 'diameter': 'Diameter',
  'binnen_dia_mm': 'Inner Diameter', 'binnen_dia': 'Inner Diameter', 'binnendiameter': 'Inner Diameter',
  'buiten_dia_mm': 'Outer Diameter', 'buiten_dia': 'Outer Diameter', 'buitendiameter': 'Outer Diameter',
  'length_m': 'Length', 'lengte': 'Length', 'size': 'Size', 'maat': 'Size',
  'pressure_bar': 'Pressure', 'werkdruk': 'Working Pressure', 'druk': 'Pressure', 'barstdruk': 'Burst Pressure',
  'weight_kg': 'Weight', 'gewicht': 'Weight', 'gewicht_g_m': 'Weight per Meter',
  'wanddikte': 'Wall Thickness', 'wanddikte_mm': 'Wall Thickness', 'dikte': 'Thickness',
  'buigradius': 'Bend Radius', 'buigstraal': 'Bend Radius',
  'power_kw': 'Power', 'vermogen': 'Power', 'voltage_v': 'Voltage', 'spanning': 'Voltage',
  'flow_l_min': 'Flow Rate', 'debiet': 'Flow Rate', 'capaciteit': 'Capacity',
  'temp_c': 'Temperature', 'temperatuur': 'Temperature',
  'rpm': 'RPM', 'toerental': 'RPM', 'volume_l': 'Volume', 'inhoud': 'Volume',
  'material': 'Material', 'materiaal': 'Material', 'seal_material': 'Seal Material',
  'application': 'Application', 'vacu_m_bar': 'Vacuum Pressure',
};

const getUnitForProperty = (key: string, value: string): string => {
  const keyLower = key.toLowerCase().replace(/\s+/g, '_');
  const valueLower = value.toLowerCase();
  
  // Check if value already contains a unit - don't duplicate
  if (/\b(mm|cm|kg|bar|kw|hp|rpm|db|g\/m|l\/min|m³\/h)\b/i.test(valueLower)) return '';
  if (valueLower.includes('°c') || valueLower.includes('°C')) return '';
  
  if (UNIT_MAPPINGS[keyLower]) return UNIT_MAPPINGS[keyLower];
  for (const [pattern, unit] of Object.entries(UNIT_MAPPINGS)) {
    if (keyLower.includes(pattern)) return unit;
  }
  if (keyLower.endsWith('_mm') || keyLower.endsWith('mm')) return 'mm';
  if (keyLower.endsWith('_bar') || keyLower.endsWith('bar')) return 'bar';
  if (keyLower.endsWith('_kg') || keyLower.endsWith('kg')) return 'kg';
  return '';
};

const getPropertyDescription = (key: string): string => {
  const keyLower = key.toLowerCase().replace(/\s+/g, '_');
  if (PROPERTY_DESCRIPTIONS[keyLower]) return PROPERTY_DESCRIPTIONS[keyLower];
  for (const [pattern, desc] of Object.entries(PROPERTY_DESCRIPTIONS)) {
    if (keyLower.includes(pattern)) return desc;
  }
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

interface ProductGroupCardProps {
  productGroup: any;
  viewMode?: 'grid' | 'list';
  className?: string;
  onQuickView?: (productGroup: any) => void;
}

export default function ProductGroupCard({ 
  productGroup, 
  viewMode = 'grid',
  className = '',
  onQuickView
}: ProductGroupCardProps) {
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedVariantSku, setSelectedVariantSku] = useState(
    productGroup.default_variant_sku || productGroup.variants?.[0]?.sku || ''
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToQuote, openQuote } = useQuote();
  const { addToCompare, isInCompare, canAddMore } = useCompare();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedVariant = productGroup.variants?.find((v: any) => v.sku === selectedVariantSku) 
    || productGroup.variants?.[0] 
    || { sku: 'N/A', label: 'No SKUs available', properties: {} };

  const mainImage = productGroup.media?.find((m: any) => m.role === 'main')?.url;
  const imageUrl = mainImage ? `/api/${mainImage}` : null;

  const pdfSource = productGroup.source_pdf || selectedVariant?.pdf_source;
  const pdfPage = selectedVariant?.page || selectedVariant?.page_in_pdf || productGroup.page_in_pdf;

  // Check if this is a Makita product and get price
  const isMakita = productGroup.catalog?.toLowerCase().includes('makita') || 
                   productGroup.brand?.toLowerCase() === 'makita' ||
                   pdfSource?.toLowerCase().includes('makita');
  const price = selectedVariant?.properties?.price_excl_btw || 
                selectedVariant?.attributes?.price_excl_btw ||
                selectedVariant?.price_excl_btw;

  // Combine all properties from selected variant
  const allProperties = {
    ...(selectedVariant?.attributes || {}),
    ...(selectedVariant?.properties || {}),
  };
  
  // Excluded keys that shouldn't be displayed
  const excludedKeys = ['type', 'bestelnr', 'sku_series', 'page_in_pdf', 'pdf_source', 'catalog', 'brand', 'sku'];
  
  // Identify SKU-specific properties (values that differ between variants)
  const skuSpecificKeys = new Set<string>();
  const commonKeys = new Set<string>();
  
  if (productGroup.variants?.length > 1) {
    // Get all property keys from all variants
    const allKeys = new Set<string>();
    productGroup.variants.forEach((v: any) => {
      Object.keys(v.properties || {}).forEach(k => allKeys.add(k));
      Object.keys(v.attributes || {}).forEach(k => allKeys.add(k));
    });
    
    // Check each key to see if values differ between variants
    allKeys.forEach(key => {
      if (excludedKeys.includes(key)) return;
      
      const values = new Set<string>();
      productGroup.variants.forEach((v: any) => {
        const val = v.properties?.[key] || v.attributes?.[key];
        if (val !== null && val !== undefined && val !== '') {
          values.add(String(val));
        }
      });
      
      // If more than one unique value exists, it's SKU-specific
      if (values.size > 1) {
        skuSpecificKeys.add(key);
      } else if (values.size === 1) {
        commonKeys.add(key);
      }
    });
  } else {
    // For single-variant products, treat all properties as common
    Object.keys(allProperties).forEach(key => {
      if (!excludedKeys.includes(key) && allProperties[key] && allProperties[key] !== '') {
        commonKeys.add(key);
      }
    });
  }
  
  // Filter and categorize properties
  const propertyEntries = Object.entries(allProperties).filter(([key, value]) => {
    if (!value || value === '') return false;
    if (excludedKeys.includes(key)) return false;
    return true;
  });
  
  // Sort: SKU-specific first (to differentiate variants), then common properties
  const sortedPropertyEntries = [...propertyEntries].sort((a, b) => {
    const aIsSkuSpecific = skuSpecificKeys.has(a[0]);
    const bIsSkuSpecific = skuSpecificKeys.has(b[0]);
    if (aIsSkuSpecific && !bIsSkuSpecific) return -1;
    if (!aIsSkuSpecific && bIsSkuSpecific) return 1;
    return 0;
  });

  const handleAddToQuote = () => {
    addToQuote({
      sku: selectedVariant.sku,
      name: selectedVariant.label || selectedVariant.sku,
      imageUrl: imageUrl || undefined,
      category: productGroup.catalog,
      brand: productGroup.brand,
      properties: allProperties, // Store all product specifications
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    // Open quote panel after adding
    openQuote();
  };

  const handleAddToCompare = () => {
    addToCompare({
      group_id: productGroup.group_id,
      sku: selectedVariant.sku,
      name: selectedVariant.label || productGroup.name,
      imageUrl: imageUrl,
      catalog: productGroup.catalog || '',
      properties: allProperties
    });
  };

  const inCompare = isInCompare(selectedVariant.sku);

  const SkuDropdown = () => (
    <div ref={dropdownRef} className="relative">
      <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Select SKU</label>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full px-3 py-2.5 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-between transition-all"
      >
        <span className="font-semibold text-gray-900 truncate">{selectedVariant?.sku}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {isDropdownOpen && productGroup.variants?.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {productGroup.variants.map((variant: any, idx: number) => (
            <button
              key={`-${idx}`}
              onClick={() => { setSelectedVariantSku(variant.sku); setIsDropdownOpen(false); }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${variant.sku === selectedVariantSku ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}
            >
              {variant.sku}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const PdfInfo = () => {
    if (!pdfSource) return null;
    // Use API route for better Vercel compatibility
    const pdfUrl = `/api/pdf/Product_pdfs/${pdfSource}`;
    return (
      <div className="flex items-center gap-3 text-sm">
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium"
          onClick={(e) => e.stopPropagation()}>
          <FileText className="w-4 h-4" />{pdfSource}
        </a>
        {pdfPage && (<a href={`/pdf-viewer?file=Product_pdfs/${pdfSource}&page=${pdfPage}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-blue-200 hover:bg-blue-300 text-blue-800 font-bold rounded text-xs cursor-pointer" onClick={(e) => e.stopPropagation()}>Page {pdfPage}</a>)}
      </div>
    );
  };

  const Properties = ({ maxItems = 8 }: { maxItems?: number }) => {
    if (sortedPropertyEntries.length === 0) return null;
    
    // Split into SKU-specific and common properties
    const skuSpecificEntries = sortedPropertyEntries.filter(([key]) => skuSpecificKeys.has(key));
    const commonEntries = sortedPropertyEntries.filter(([key]) => !skuSpecificKeys.has(key));
    
    // PRIORITIZE SKU specs - show ALL of them first, then fill remaining with common
    const skuSpecificToShow = Math.min(skuSpecificEntries.length, maxItems);
    const commonToShow = Math.max(0, maxItems - skuSpecificToShow);
    
    // For single-variant products (no SKU-specific), show all properties without section headers
    const isSingleVariant = productGroup.variants?.length <= 1;
    
    if (isSingleVariant && commonEntries.length > 0) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {commonEntries.slice(0, maxItems).map(([key, value]) => {
            const displayValue = String(value);
            const { icon, bg, text } = getPropertyDisplay(key, displayValue);
            return (
              <span 
                key={key} 
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${bg} ${text} border border-black/5`}
                title={key.replace(/_/g, ' ')}
              >
                <span className="text-sm">{icon}</span>
                <span className="truncate max-w-[100px]">{displayValue}</span>
              </span>
            );
          })}
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {/* SKU-specific properties (differentiating values) - shown first with highlight */}
        {skuSpecificEntries.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-1">
              <span>📊</span> SKU Specs
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skuSpecificEntries.slice(0, skuSpecificToShow).map(([key, value]) => {
                const displayValue = String(value);
                const { icon } = getPropertyDisplay(key, displayValue);
                const unit = getUnitForProperty(key, displayValue);
                const valueWithUnit = unit ? `${displayValue} ${unit}` : displayValue;
                const description = getPropertyDescription(key);
                return (
                  <span 
                    key={key} 
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200 cursor-help"
                    title={description}
                  >
                    <span className="text-sm">{icon}</span>
                    <span className="truncate max-w-[100px]">{valueWithUnit}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Common properties (same for all variants) */}
        {commonEntries.length > 0 && commonToShow > 0 && (
          <div className="space-y-1">
            {skuSpecificEntries.length > 0 && (
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Common</div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {commonEntries.slice(0, commonToShow).map(([key, value]) => {
                const displayValue = String(value);
                const { icon, bg, text } = getPropertyDisplay(key, displayValue);
                const unit = getUnitForProperty(key, displayValue);
                const valueWithUnit = unit ? `${displayValue} ${unit}` : displayValue;
                const description = getPropertyDescription(key);
                return (
                  <span 
                    key={key} 
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${bg} ${text} border border-black/5 cursor-help`}
                    title={description}
                  >
                    <span className="text-sm">{icon}</span>
                    <span className="truncate max-w-[100px]">{valueWithUnit}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Build product detail URL with catalog for faster loading
  const detailUrl = `/product-groups/${productGroup.group_id}${productGroup.catalog ? `?catalog=${productGroup.catalog}` : ''}`;

  if (viewMode === 'list') {
    return (
      <div className={`flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all border border-gray-200 ${className}`}>
        <Link href={detailUrl}
          className="w-full sm:w-56 h-56 sm:h-auto flex-shrink-0 relative bg-white p-4">
          <div className="absolute top-2 left-2 bg-gray-900/80 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <Package className="w-3 h-3" />{productGroup.variant_count}
          </div>
          {imageUrl && !imageError ? (
            <Image src={imageUrl} alt={productGroup.name} fill sizes="224px" className="object-contain" onError={() => setImageError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-16 h-16" /></div>
          )}
        </Link>
        <div className="flex-1 p-5 flex flex-col gap-4">
          <Link href={detailUrl}>
            <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">{productGroup.name}</h3>
          </Link>
          <SkuDropdown />
          <PdfInfo />
          <Properties maxItems={12} />
          {/* Price display for Makita products */}
          {isMakita && price && (
            <div className="flex items-center gap-2 py-2">
              <span className="text-2xl font-bold text-green-600">€{typeof price === 'number' ? price.toFixed(2).replace('.', ',') : price}</span>
              <span className="text-xs text-gray-500">excl. BTW</span>
            </div>
          )}
          <div className="mt-auto flex items-center gap-3 pt-2">
            {isMakita && price ? (
              <button onClick={handleAddToQuote}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${justAdded ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                {justAdded ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
              </button>
            ) : (
              <button onClick={handleAddToQuote}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${justAdded ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white'}`}>
                {justAdded ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingCart className="w-4 h-4" /> Add to Quote</>}
              </button>
            )}
            <button
              onClick={handleAddToCompare}
              disabled={inCompare || !canAddMore}
              className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold ${
                inCompare 
                  ? 'bg-blue-500 text-white' 
                  : canAddMore 
                    ? 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600' 
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
              title={inCompare ? 'In compare list' : canAddMore ? 'Add to compare' : 'Compare list full (max 4)'}
            >
              <GitCompare className="w-4 h-4" />
              {inCompare ? 'Added' : 'Compare'}
            </button>
            <Link href={detailUrl} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">Details</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-200 hover:border-blue-300 ${className} group`}>
      <Link href={detailUrl}
        className="relative block w-full aspect-square p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="absolute top-3 left-3 bg-gray-900/80 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
          <Package className="w-3 h-3" />{productGroup.variant_count}
        </div>
        {/* Quick View Button */}
        <button
          onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          title="Quick View"
        >
          <Eye className="w-4 h-4" />
        </button>
        {imageUrl && !imageError ? (
          <Image src={imageUrl} alt={productGroup.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain group-hover:scale-105 transition-transform duration-300" onError={() => setImageError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-16 h-16" /></div>
        )}
      </Link>
      <div className="p-4 space-y-3">
        <Link href={detailUrl}>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{productGroup.name}</h3>
        </Link>
        <SkuDropdown />
        <PdfInfo />
        <Properties maxItems={6} />
        {/* Price display for Makita products */}
        {isMakita && price && (
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-green-600">€{typeof price === 'number' ? price.toFixed(2).replace('.', ',') : price}</span>
            <span className="text-xs text-gray-500">excl. BTW</span>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          {isMakita && price ? (
            <button onClick={handleAddToQuote}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${justAdded ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
              {justAdded ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingCart className="w-4 h-4" /> Cart</>}
            </button>
          ) : (
            <button onClick={handleAddToQuote}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${justAdded ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white'}`}>
              {justAdded ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingCart className="w-4 h-4" /> Quote</>}
            </button>
          )}
          <button
            onClick={handleAddToCompare}
            disabled={inCompare || !canAddMore}
            className={`p-2.5 rounded-lg transition-all ${
              inCompare 
                ? 'bg-blue-500 text-white' 
                : canAddMore 
                  ? 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600' 
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            title={inCompare ? 'In compare list' : canAddMore ? 'Add to compare' : 'Compare list full (max 4)'}
          >
            <GitCompare className="w-4 h-4" />
          </button>
          <Link href={detailUrl} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">Details</Link>
        </div>
      </div>
      
      {/* Quick View Modal */}
      <QuickViewModal
        productGroup={productGroup}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </div>
  );
}
