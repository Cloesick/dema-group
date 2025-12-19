'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Grid, List, Package, TrendingUp } from 'lucide-react';

interface Product {
  sku: string;
  name: string;
  series_name?: string;
  source_pdf: string;
  page?: number;
  image?: string;
  series_image?: string;
  category?: string;
  type?: string;
  [key: string]: any;
}

export default function CatalogExplorerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatalog, setSelectedCatalog] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [catalogs, setCatalogs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    loadAllProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCatalog, products]);

  const loadAllProducts = async () => {
    try {
      const catalogFiles = [
        'pomp-specials',
        'centrifugaalpompen',
        'dompelpompen',
        'bronpompen',
        'zuigerpompen',
        'messing-draadfittingen',
        'rvs-draadfittingen',
        'slangkoppelingen',
        'slangklemmen',
        'rubber-slangen',
        'plat-oprolbare-slangen',
        'abs-persluchtbuizen',
        'pe-buizen',
        'drukbuizen'
      ];

      const allProducts: Product[] = [];
      const uniqueCatalogs = new Set<string>();

      for (const catalog of catalogFiles) {
        try {
          const response = await fetch(`/documents/Product_pdfs/json/${catalog}.json`);
          if (!response.ok) continue;
          
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) continue;
          
          const catalogProducts = await response.json();
          
          catalogProducts.forEach((product: any) => {
            allProducts.push({
              ...product,
              name: product.series_name || product.type || product.sku,
              catalog: catalog
            });
            uniqueCatalogs.add(catalog);
          });
        } catch (err) {
          console.error(`Error loading ${catalog}:`, err);
        }
      }

      setProducts(allProducts);
      setFilteredProducts(allProducts);
      setCatalogs(Array.from(uniqueCatalogs).sort());
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by catalog
    if (selectedCatalog && selectedCatalog !== 'all') {
      filtered = filtered.filter(p => p.catalog === selectedCatalog);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.sku.toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        (p.series_name && p.series_name.toLowerCase().includes(query)) ||
        (p.type && p.type.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading catalog explorer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Search className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h1 className="text-5xl font-bold mb-4">🔍 Catalog Explorer</h1>
            <p className="text-2xl opacity-90 mb-6">
              Browse and search through {products.length.toLocaleString()} products from {catalogs.length} catalogs
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{products.length.toLocaleString()}</div>
              <div className="text-gray-600 text-sm">Total Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{filteredProducts.length.toLocaleString()}</div>
              <div className="text-gray-600 text-sm">Filtered Results</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{catalogs.length}</div>
              <div className="text-gray-600 text-sm">Catalogs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{totalPages}</div>
              <div className="text-gray-600 text-sm">Pages</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search by SKU, name, or series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Catalog Filter */}
            <select
              value={selectedCatalog}
              onChange={(e) => setSelectedCatalog(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            >
              <option value="all">📚 All Catalogs ({products.length})</option>
              {catalogs.map(catalog => {
                const count = products.filter(p => p.catalog === catalog).length;
                return (
                  <option key={catalog} value={catalog}>
                    {catalog} ({count})
                  </option>
                );
              })}
            </select>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg border-2 transition ${
                  viewMode === 'grid'
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-300 hover:border-primary'
                }`}
                title="Grid View"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg border-2 transition ${
                  viewMode === 'list'
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-300 hover:border-primary'
                }`}
                title="List View"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="container mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCatalog('all');
              }}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-700">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-primary hover:text-primary font-semibold"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Products Grid */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {currentProducts.map((product) => (
                <Link
                  key={`${product.sku}-${product.source_pdf}`}
                  href={`/products/${product.sku}`}
                  className={`group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ${
                    viewMode === 'list' ? 'flex gap-4' : ''
                  }`}
                >
                  {/* Product Image */}
                  <div className={`bg-gradient-to-br from-gray-50 to-gray-100 ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'h-48'}`}>
                    {(product.image || product.series_image) ? (
                      <img
                        src={`/${product.image || product.series_image}`}
                        alt={product.name}
                        className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1">
                    <div className="text-xs text-primary font-semibold mb-1">
                      SKU: {product.sku}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition">
                      {product.name}
                    </h3>
                    {product.series_name && product.series_name !== product.name && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {product.series_name}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.catalog}
                      </span>
                      {product.page && (
                        <span className="text-xs text-gray-500">
                          Page {product.page}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary font-semibold transition"
                >
                  ← Previous
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-12 h-12 rounded-lg font-semibold transition ${
                          currentPage === pageNum
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-white border-2 border-gray-300 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary font-semibold transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-xl opacity-90 mb-6">
            Check out our featured products or browse by specific catalogs
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/products/featured"
              className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-xl"
            >
              ⭐ Featured Products
            </Link>
            <Link
              href="/catalog/highlights"
              className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition shadow-xl"
            >
              📦 Catalog Highlights
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
