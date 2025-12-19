'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductGroupCard from '@/components/ProductGroupCard';
import SimpleProductFilters from '@/components/products/SimpleProductFilters';
import { Grid, List, Search, Loader2 } from 'lucide-react';
import { fuzzySearchProducts, debounce } from '@/lib/fuzzySearch';
import { ProductGridSkeleton } from '@/components/ui/ProductCardSkeleton';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productGroups, setProductGroups] = useState<any[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [selectedCatalog, setSelectedCatalog] = useState('');
  const [displayCount, setDisplayCount] = useState(24); // Pagination: show 24 at a time
  const [initialUrlRead, setInitialUrlRead] = useState(false); // Track if we've read initial URL
  const [isSearching, setIsSearching] = useState(false); // Search loading state
  const [showMobileFilters, setShowMobileFilters] = useState(false); // Mobile filter toggle

  // Sync all filter state with URL on initial load
  useEffect(() => {
    if (!searchParams) return;
    
    // Read catalog from URL
    const urlCatalog = searchParams.get('catalog') || '';
    if (urlCatalog !== selectedCatalog) {
      setSelectedCatalog(urlCatalog);
    }
    
    // Read search query from URL
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
    
    // Read view mode from URL
    const urlView = searchParams.get('view') as 'grid' | 'list';
    if (urlView && (urlView === 'grid' || urlView === 'list') && urlView !== viewMode) {
      setViewMode(urlView);
    }
    
    // Read advanced filters from URL
    const urlFilters: Record<string, string[]> = {};
    const filterKeys = ['pdf_source', 'pressure_max_bar', 'power_kw', 'voltage_v', 'weight_kg', 'connection_types'];
    filterKeys.forEach(key => {
      const value = searchParams.get(key);
      if (value) {
        urlFilters[key] = [value];
      }
    });
    
    // Only update if filters changed
    if (JSON.stringify(urlFilters) !== JSON.stringify(filters)) {
      setFilters(urlFilters);
    }
    
    // Mark initial URL as read
    setInitialUrlRead(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Load grouped products data
  useEffect(() => {
    fetch('/data/products_all_grouped.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Not JSON response');
        }
        return res.json();
      })
      .then(data => {
        const normalized = (Array.isArray(data) ? data : []).map((group: any) => {
          const inferredPdf = group?.source_pdf || (group?.catalog ? `${group.catalog}.pdf` : undefined);
          return {
            ...group,
            source_pdf: inferredPdf,
            variants: (group?.variants || []).map((v: any) => ({
              ...v,
              pdf_source: v?.pdf_source || inferredPdf
            }))
          };
        });

        setProductGroups(normalized);
        setFilteredGroups(normalized);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading product groups:', err);
        setLoading(false);
      });
  }, []);

  // Convert product groups to flat products for filtering
  const flatProducts = productGroups.flatMap(group =>
    group.variants.map((v: any) => ({
      ...v.properties,
      ...v.attributes,
      sku: v.sku,
      name: v.label || v.sku,
      group_id: group.group_id,
      group_name: group.name,
      catalog: group.catalog,
      brand: group.brand,
      category: group.category,
      pdf_source: group.source_pdf || (group.catalog ? `${group.catalog}.pdf` : undefined),
      page_in_pdf: v.page_in_pdf
    }))
  );

  // Debounced search function for better performance
  const performSearch = useCallback(
    debounce((query: string, groups: any[], catalog: string, currentFilters: Record<string, string[]>) => {
      setIsSearching(true);
      
      let filtered = groups;

      // Apply fuzzy search if query exists
      if (query.trim()) {
        const searchResults = fuzzySearchProducts(
          groups,
          query,
          ['name', 'family', 'series_name', 'catalog', 'category'],
          { threshold: 0.25, maxResults: 500 }
        );
        filtered = searchResults.map(r => r.item);
      }

      // Catalog filter
      if (catalog) {
        filtered = filtered.filter(group => group.catalog === catalog);
      }

      // Advanced filters (applied after search)
      if (Object.keys(currentFilters).length > 0) {
        const flatProds = filtered.flatMap(group =>
          group.variants.map((v: any) => ({
            ...v.properties,
            ...v.attributes,
            group_id: group.group_id,
            pdf_source: group.source_pdf || group.catalog,
            catalog: group.catalog,
          }))
        );
        
        const matchingGroupIds = new Set(
          flatProds
            .filter(product => {
              return Object.entries(currentFilters).every(([filterType, filterValues]) => {
                if (!filterValues || filterValues.length === 0) return true;
                return filterValues.some(value => {
                  switch (filterType) {
                    case 'catalog':
                      return product.pdf_source?.replace('.pdf', '') === value || product.catalog === value;
                    case 'material':
                      return product.material === value;
                    case 'diameter_mm':
                      const diam = product.diameter_mm || product.diameter;
                      if (typeof diam === 'number') return String(Math.round(diam)) === value;
                      return diam === value;
                    case 'pressure_bar':
                      const press = product.pressure_bar || product.max_pressure_bar || product.druk;
                      if (typeof press === 'number') return String(Math.round(press)) === value;
                      return false;
                    case 'connection_type':
                      return product.connection_type === value || product.connection_size === value;
                    case 'size':
                      return product.size === value || product.maat === value;
                    default:
                      return false;
                  }
                });
              });
            })
            .map(p => p.group_id)
        );
        filtered = filtered.filter(group => matchingGroupIds.has(group.group_id));
      }

      setFilteredGroups(filtered);
      setIsSearching(false);
    }, 150),
    []
  );

  // Apply search and filters
  useEffect(() => {
    if (productGroups.length === 0) return;
    performSearch(searchQuery, productGroups, selectedCatalog, filters);
  }, [searchQuery, productGroups, selectedCatalog, filters, performSearch]);


  // Build URL from current filter state
  const buildUrlWithFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedCatalog) {
      params.set('catalog', selectedCatalog);
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    if (viewMode !== 'grid') {
      params.set('view', viewMode);
    }
    
    // Add advanced filters
    Object.entries(filters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        params.set(key, values[0]);
      }
    });
    
    const queryString = params.toString();
    return queryString ? `/products?${queryString}` : '/products';
  };

  // Keep URL in sync when filters change (only after initial URL has been read)
  useEffect(() => {
    // Don't sync URL until we've read the initial URL params
    if (!initialUrlRead) return;
    
    const newUrl = buildUrlWithFilters();
    const currentUrl = window.location.pathname + window.location.search;
    
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCatalog, searchQuery, viewMode, filters, initialUrlRead]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const totalVariants = productGroups.reduce((sum, g) => sum + g.variant_count, 0);
  const uniqueCatalogs = new Set(productGroups.map(g => g.catalog)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-500 text-white">
        <div className="container mx-auto px-4 py-6 sm:py-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">📦 All Products</h1>
          <p className="text-sm sm:text-xl opacity-90">
            {productGroups.length} product groups • {totalVariants} variants • {uniqueCatalogs} catalogs
          </p>
        </div>
      </div>

      {/* Stats Bar - Hidden on mobile */}
      <div className="hidden sm:block bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{filteredGroups.length}</div>
              <div className="text-gray-600">Product Groups</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalVariants}</div>
              <div className="text-gray-600">Total Variants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {(totalVariants / productGroups.length).toFixed(1)}
              </div>
              <div className="text-gray-600">Avg Variants/Group</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="bg-white border-b sticky top-16 sm:top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          {/* Mobile: Stack search and filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            <div className="relative flex-1">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              )}
              <input
                type="text"
                placeholder="Search products (supports typos)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={selectedCatalog}
                onChange={(e) => setSelectedCatalog(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              >
                <option value="">All catalogs</option>
                {Array.from(new Set(productGroups.map(g => g.catalog))).sort().map(catalog => (
                  <option key={catalog} value={catalog}>
                    {catalog.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 sm:p-3 rounded-lg border-2 transition ${
                    viewMode === 'grid'
                      ? 'bg-primary border-primary text-white'
                      : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 sm:p-3 rounded-lg border-2 transition ${
                    viewMode === 'list'
                      ? 'bg-primary border-primary text-white'
                      : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  <List className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-sm border"
          >
            <span className="font-medium text-gray-700">Filters</span>
            <span className="text-sm text-gray-500">
              {showMobileFilters ? '▲ Hide' : '▼ Show'}
            </span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Filters Sidebar - Hidden on mobile unless toggled */}
          <aside className={`lg:w-80 flex-shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:sticky lg:top-32">
              <h2 className="text-lg font-bold mb-4 text-gray-900 hidden lg:block">Filters</h2>
              <SimpleProductFilters
                products={flatProducts}
                onFilterChange={setFilters}
                onSearch={setSearchQuery}
                initialFilters={filters}
                initialSearch={searchQuery}
              />
            </div>
          </aside>

          {/* Product Groups Grid/List */}
          <section className="flex-1">
            {loading ? (
              <ProductGridSkeleton count={12} />
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No product groups found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {[...filteredGroups]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .slice(0, displayCount)
                    .map(group => (
                      <ProductGroupCard
                        key={group.group_id}
                        productGroup={group}
                        viewMode={viewMode}
                      />
                    ))}
                </div>
                
                {/* Load More Button */}
                {displayCount < filteredGroups.length && (
                  <div className="text-center mt-8">
                    <p className="text-gray-500 mb-3">
                      Showing {displayCount} of {filteredGroups.length} product groups
                    </p>
                    <button
                      onClick={() => setDisplayCount(prev => prev + 24)}
                      className="px-6 py-3 bg-primary hover:bg-primary text-white font-semibold rounded-lg transition-colors"
                    >
                      Load More Products
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
