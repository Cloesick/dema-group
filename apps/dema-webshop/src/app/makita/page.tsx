'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductGroupCard from '@/components/ProductGroupCard';
import { Grid, List, Search, Loader2 } from 'lucide-react';
import { fuzzySearchProducts, debounce } from '@/lib/fuzzySearch';
import Link from 'next/link';

// Makita brand colors (ocean green/teal)
const MAKITA_PRIMARY = '#00B8A9';
const MAKITA_DARK = '#008E7E';

export default function MakitaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productGroups, setProductGroups] = useState<any[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCatalog, setSelectedCatalog] = useState('all');
  const [displayCount, setDisplayCount] = useState(24);
  const [isSearching, setIsSearching] = useState(false);

  // Load Makita products
  useEffect(() => {
    fetch('/data/products_all_grouped.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Filter only Makita products
        const makitaProducts = (Array.isArray(data) ? data : []).filter((group: any) =>
          group?.catalog?.toLowerCase().includes('makita')
        );
        setProductGroups(makitaProducts);
        setFilteredGroups(makitaProducts);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading Makita products:', err);
        setLoading(false);
      });
  }, []);

  // Flatten products for search
  const flatProducts = useMemo(() => {
    return productGroups.flatMap(group =>
      (group.variants || []).map((v: any) => ({
        ...v,
        groupId: group.group_id,
        groupName: group.name,
        catalog: group.catalog,
        media: group.media,
      }))
    );
  }, [productGroups]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setIsSearching(true);
      if (!query.trim()) {
        // Filter by catalog if selected
        let filtered = productGroups;
        if (selectedCatalog !== 'all') {
          filtered = productGroups.filter(g => g.catalog === selectedCatalog);
        }
        setFilteredGroups(filtered);
        setIsSearching(false);
        return;
      }

      const results = fuzzySearchProducts(flatProducts, query, ['sku', 'label', 'groupName']);
      const matchedGroupIds = new Set(results.map(r => r.item.groupId));
      let filtered = productGroups.filter(g => matchedGroupIds.has(g.group_id));
      
      if (selectedCatalog !== 'all') {
        filtered = filtered.filter(g => g.catalog === selectedCatalog);
      }
      
      setFilteredGroups(filtered);
      setIsSearching(false);
    }, 300),
    [productGroups, flatProducts, selectedCatalog]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Filter by catalog
  useEffect(() => {
    if (selectedCatalog === 'all') {
      if (!searchQuery) {
        setFilteredGroups(productGroups);
      }
    } else {
      const filtered = productGroups.filter(g => g.catalog === selectedCatalog);
      setFilteredGroups(filtered);
    }
  }, [selectedCatalog, productGroups, searchQuery]);

  // Get unique catalogs
  const catalogs = useMemo(() => {
    return Array.from(new Set(productGroups.map(g => g.catalog))).sort();
  }, [productGroups]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  const totalVariants = productGroups.reduce((sum, g) => sum + (g.variant_count || g.variants?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Makita Teal */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-6 sm:py-12">
          <div className="flex items-center gap-4 mb-2 sm:mb-4">
            <span className="text-3xl sm:text-4xl">🔧</span>
            <h1 className="text-2xl sm:text-4xl font-bold">Makita Producten</h1>
          </div>
          <p className="text-sm sm:text-xl opacity-90">
            {productGroups.length} productgroepen • {totalVariants} varianten • {catalogs.length} catalogi
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="hidden sm:block bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-500">{filteredGroups.length}</div>
              <div className="text-gray-600">Productgroepen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-500">{totalVariants}</div>
              <div className="text-gray-600">Totaal Varianten</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-500">18V/40V</div>
              <div className="text-gray-600">Accu Systemen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-500">LXT/XGT</div>
              <div className="text-gray-600">Technologie</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters - Sticky */}
      <div className="bg-white border-b sticky top-16 sm:top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 h-5 w-5 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              )}
              <input
                type="text"
                placeholder="Zoek Makita producten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            
            {/* Catalog Filter & View Toggle */}
            <div className="flex gap-2 items-center">
              <select
                value={selectedCatalog}
                onChange={(e) => setSelectedCatalog(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">Alle catalogi</option>
                {catalogs.map(catalog => (
                  <option key={catalog} value={catalog}>
                    {catalog.includes('tuinfolder') ? '🌱 Tuin' : '🔧 Gereedschap'}
                  </option>
                ))}
              </select>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 sm:p-3 rounded-lg border-2 transition ${
                    viewMode === 'grid'
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : 'border-gray-300 hover:border-teal-500'
                  }`}
                >
                  <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 sm:p-3 rounded-lg border-2 transition ${
                    viewMode === 'list'
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : 'border-gray-300 hover:border-teal-500'
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Catalog Links */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
              <h2 className="text-lg font-bold mb-4 text-gray-900">Makita Catalogi</h2>
              <div className="space-y-3">
                <Link
                  href="/products?catalog=makita-catalogus-2022-nl"
                  className="block p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔧</span>
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-teal-600">Gereedschap</div>
                      <div className="text-sm text-gray-500">Elektrisch gereedschap</div>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/products?catalog=makita-tuinfolder-2022-nl"
                  className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌱</span>
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-green-600">Tuin</div>
                      <div className="text-sm text-gray-500">Tuingereedschap</div>
                    </div>
                  </div>
                </Link>
              </div>
              
              {/* Quick Info */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Waarom Makita?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">✓</span>
                    <span>100+ jaar ervaring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">✓</span>
                    <span>LXT & XGT accu systemen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">✓</span>
                    <span>Professionele kwaliteit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500">✓</span>
                    <span>Uitgebreide garantie</span>
                  </li>
                </ul>
              </div>
              
              {/* CTA */}
              <div className="mt-6">
                <Link
                  href="/quote-request"
                  className="block w-full text-center px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition"
                >
                  Offerte Aanvragen
                </Link>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="flex-1">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Geen producten gevonden</h3>
                <p className="text-gray-600">Probeer een andere zoekopdracht of filter</p>
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
                
                {/* Load More */}
                {displayCount < filteredGroups.length && (
                  <div className="text-center mt-8">
                    <p className="text-gray-500 mb-3">
                      {displayCount} van {filteredGroups.length} productgroepen weergegeven
                    </p>
                    <button
                      onClick={() => setDisplayCount(prev => prev + 24)}
                      className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      Meer Laden
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
