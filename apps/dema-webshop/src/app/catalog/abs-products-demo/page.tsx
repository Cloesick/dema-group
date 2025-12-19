'use client';

import { useState, useEffect } from 'react';
import ImageBasedProductCard from '@/components/ImageBasedProductCard';
import { Grid, List } from 'lucide-react';
import { fetchJsonSafe } from '@/lib/fetchJson';

export default function ABSProductsDemoPage() {
  const [productGroups, setProductGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchJsonSafe('/data/abs_persluchtbuizen_products.json')
      .then(data => {
        setProductGroups(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎨 New Icon-Based Product Cards
          </h1>
          <p className="text-lg text-gray-600">
            ABS Persluchtbuizen - Image-Based Grouping with Smart Property Categorization
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${productGroups.length} product groups`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="text-2xl mb-2">🏷️</div>
            <div className="font-bold text-blue-900">SKU Dropdown</div>
            <div className="text-xs text-primary-dark">Related SKUs grouped by image</div>
          </div>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="text-2xl mb-2">📏</div>
            <div className="font-bold text-green-900">Smart Grouping</div>
            <div className="text-xs text-green-700">Properties auto-categorized</div>
          </div>
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <div className="text-2xl mb-2">🎨</div>
            <div className="font-bold text-orange-900">Icon Display</div>
            <div className="text-xs text-orange-700">Visual property identification</div>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="text-2xl mb-2">📄</div>
            <div className="font-bold text-purple-900">PDF Links</div>
            <div className="text-xs text-purple-700">Direct access to source</div>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : productGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No products found.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {productGroups.map((group, index) => (
              <ImageBasedProductCard
                key={index}
                productGroup={group}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Features Implemented</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-bold text-primary mb-2">✅ Fixed Section 1:</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Product Image Display</li>
                <li>• SKU Dropdown (image-based grouping)</li>
                <li>• PDF Source Link</li>
                <li>• Page Number Reference</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-green-600 mb-2">✅ Dynamic Sections:</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• 🔧 Specifications (Blue)</li>
                <li>• 📏 Dimensions (Green)</li>
                <li>• ⚡ Performance (Orange)</li>
                <li>• 🎯 Application (Purple)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
