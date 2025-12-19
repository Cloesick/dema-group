'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package, X, ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { useQuote } from '@/contexts/QuoteContext';
import { useState } from 'react';

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToQuote } = useQuote();
  const [addedSkus, setAddedSkus] = useState<Set<string>>(new Set());

  // Get all unique property keys across all items
  const allPropertyKeys = new Set<string>();
  compareItems.forEach(item => {
    Object.keys(item.properties || {}).forEach(key => {
      if (!['type', 'bestelnr', 'sku_series', 'page_in_pdf', 'pdf_source', 'catalog', 'brand', 'sku'].includes(key)) {
        allPropertyKeys.add(key);
      }
    });
  });
  const propertyKeys = Array.from(allPropertyKeys).sort();

  const handleAddToQuote = (item: typeof compareItems[0]) => {
    addToQuote({
      sku: item.sku,
      name: item.name,
      imageUrl: item.imageUrl || undefined,
      category: item.catalog,
      ...item.properties
    });
    setAddedSkus(prev => new Set(prev).add(item.sku));
    setTimeout(() => {
      setAddedSkus(prev => {
        const next = new Set(prev);
        next.delete(item.sku);
        return next;
      });
    }, 1500);
  };

  if (compareItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Products to Compare</h1>
          <p className="text-gray-600 mb-8">
            Add products to compare by clicking the compare button on product cards.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Compare Products</h1>
            <p className="text-gray-600 mt-1">Comparing {compareItems.length} products</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearCompare}
              className="px-4 py-2 text-gray-600 hover:text-red-500 font-medium"
            >
              Clear All
            </button>
            <Link
              href="/products"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Add More
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="p-4 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-48">
                    Property
                  </th>
                  {compareItems.map((item) => (
                    <th key={item.sku} className="p-4 text-center min-w-[200px]">
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(item.sku)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="w-24 h-24 mx-auto bg-gray-50 rounded-lg relative mb-3">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="96px"
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package className="w-12 h-12" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-3">{item.sku}</p>
                        <button
                          onClick={() => handleAddToQuote(item)}
                          className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                            addedSkus.has(item.sku)
                              ? 'bg-green-500 text-white'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                        >
                          {addedSkus.has(item.sku) ? (
                            <>
                              <Check className="w-4 h-4" /> Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" /> Add to Quote
                            </>
                          )}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Catalog Row */}
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="p-4 font-medium text-gray-700">Catalog</td>
                  {compareItems.map((item) => (
                    <td key={item.sku} className="p-4 text-center text-gray-900">
                      {item.catalog || '-'}
                    </td>
                  ))}
                </tr>

                {/* Property Rows */}
                {propertyKeys.map((key, idx) => (
                  <tr
                    key={key}
                    className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="p-4 font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, ' ')}
                    </td>
                    {compareItems.map((item) => {
                      const value = item.properties?.[key];
                      const displayValue = value !== null && value !== undefined && value !== ''
                        ? String(value)
                        : '-';
                      
                      // Highlight differences
                      const allValues = compareItems.map(i => i.properties?.[key]);
                      const uniqueValues = new Set(allValues.filter(v => v !== null && v !== undefined && v !== ''));
                      const isDifferent = uniqueValues.size > 1;

                      return (
                        <td
                          key={item.sku}
                          className={`p-4 text-center ${
                            isDifferent && displayValue !== '-'
                              ? 'bg-blue-50 text-blue-800 font-medium'
                              : 'text-gray-900'
                          }`}
                        >
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:text-primary transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Products
          </Link>
        </div>
      </div>
    </div>
  );
}
