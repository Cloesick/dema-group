'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, GitCompare, Package, ChevronUp, ChevronDown } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';

export default function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const [isExpanded, setIsExpanded] = useState(true);

  if (compareItems.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-500 shadow-2xl">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-t-lg flex items-center gap-2 text-sm font-medium"
      >
        <GitCompare className="w-4 h-4" />
        Compare ({compareItems.length})
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Compare Items */}
            <div className="flex-1 flex gap-3 overflow-x-auto">
              {compareItems.map((item) => (
                <div
                  key={item.sku}
                  className="flex-shrink-0 w-48 bg-gray-50 rounded-lg p-3 relative group"
                >
                  <button
                    onClick={() => removeFromCompare(item.sku)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="flex gap-2">
                    <div className="w-12 h-12 bg-white rounded relative flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.sku}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty Slots */}
              {Array.from({ length: 4 - compareItems.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-shrink-0 w-48 border-2 border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center text-gray-400 text-sm"
                >
                  + Add product
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Link
                href="/compare"
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  compareItems.length >= 2
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                }`}
              >
                Compare Now
              </Link>
              <button
                onClick={clearCompare}
                className="px-6 py-2 text-gray-500 hover:text-red-500 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
