'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';

interface Category {
  key: string;
  name: string;
  icon: string;
  description: string;
  products: number;
  groups: number;
}

export default function ProductTypesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/categories/index.json')
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load categories:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">
              🏭 Shop by Product Type
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Browse our complete range organized by product categories
            </p>
            <div className="flex justify-center gap-8 text-sm">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">{categories.length}</div>
                <div>Categories</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">
                  {categories.reduce((sum, cat) => sum + cat.products, 0).toLocaleString()}
                </div>
                <div>Products</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.key}
              href={`/product-types/${category.key}`}
              className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-6 border-b border-gray-200 group-hover:from-blue-100 group-hover:to-blue-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-5xl">{category.icon}</span>
                  <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                    {category.groups} groups
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <span className="text-2xl font-bold text-gray-900">
                      {category.products.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">products</span>
                </div>

                {/* View Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                    Browse Products
                  </span>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                Browse by Product Type
              </h3>
              <p className="text-blue-800">
                Our products are automatically organized by type for easier navigation. 
                Each category contains products from multiple brands and catalogs, 
                grouped by their function and application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
