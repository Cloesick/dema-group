'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import ProductGroupCard from '@/components/ProductGroupCard';
import SimpleProductFilters from '@/components/products/SimpleProductFilters';
import { Grid, List, Search, ArrowLeft, Package } from 'lucide-react';

interface CategoryData {
  category: string;
  name: string;
  icon: string;
  description: string;
  total_products: number;
  total_groups: number;
  groups: any[];
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetch(`/data/categories/${category}.json`)
      .then(res => res.json())
      .then(data => {
        setCategoryData(data);
        setFilteredGroups(data.groups || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load category:', err);
        setLoading(false);
      });
  }, [category]);

  // Apply search and filters
  useEffect(() => {
    if (!categoryData) return;

    let filtered = [...categoryData.groups];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(group =>
        group.name?.toLowerCase().includes(query) ||
        group.brand?.toLowerCase().includes(query) ||
        group.variants?.some((v: any) => 
          v.sku?.toLowerCase().includes(query) ||
          v.label?.toLowerCase().includes(query)
        )
      );
    }

    // Property filters
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(group =>
          group.variants?.some((v: any) => {
            const propValue = v.properties?.[key] || v.attributes?.[key];
            return propValue && values.some(val => 
              String(propValue).toLowerCase().includes(val.toLowerCase())
            );
          })
        );
      }
    });

    setFilteredGroups(filtered);
  }, [searchQuery, filters, categoryData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <Link href="/product-types" className="text-primary hover:underline">
            ← Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="container mx-auto px-4">
          <Link 
            href="/product-types"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{categoryData.icon}</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">{categoryData.name}</h1>
              <p className="text-xl text-blue-100">{categoryData.description}</p>
            </div>
          </div>

          <div className="flex gap-6 text-sm mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <Package className="w-5 h-5 mb-1 inline" />
              <div className="text-lg font-bold">{categoryData.total_products}</div>
              <div className="text-blue-100">Products</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <Grid className="w-5 h-5 mb-1 inline" />
              <div className="text-lg font-bold">{categoryData.total_groups}</div>
              <div className="text-blue-100">Groups</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-lg font-bold">{filteredGroups.length}</span>
              <div className="text-blue-100">Showing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products, SKUs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container mx-auto px-4 py-8">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-6'
            }
          >
            {filteredGroups.map((group) => (
              <ProductGroupCard
                key={group.group_id}
                productGroup={group}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
