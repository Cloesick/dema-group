'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Grid3X3,
  List,
  SlidersHorizontal,
  Check,
  ArrowUpDown
} from 'lucide-react'
import type { Product, SearchFacet, Category } from '@/types'

// =============================================================================
// PRODUCT LISTING PAGE - BLUEPRINT
// =============================================================================
// Features:
// - Faceted search with filters
// - Category navigation
// - Sort options
// - Grid/List view toggle
// - Pagination
// - URL-based state (shareable links)
// =============================================================================

// Mock data - Replace with API calls
const mockCategories: Category[] = [
  {
    id: 'pumps',
    name: 'Pumps & Accessories',
    name_nl: 'Pompen & Toebehoren',
    name_fr: 'Pompes & Accessoires',
    slug: 'pumps',
    description: 'Complete range of pumps',
    description_nl: 'Compleet gamma pompen',
    description_fr: 'Gamme complète de pompes',
    icon: '💧',
    image: '/images/products/dema-pump.svg',
    color: '#3B82F6',
    sortOrder: 1,
    isActive: true,
    productCount: 245,
    subcategories: [
      { id: 'centrifugal-pumps', name: 'Centrifugal Pumps', name_nl: 'Centrifugaalpompen', name_fr: 'Pompes Centrifuges', slug: 'centrifugal-pumps', description: '', description_nl: '', image: '', parentId: 'pumps', sortOrder: 1, isActive: true, productCount: 85 },
      { id: 'submersible-pumps', name: 'Submersible Pumps', name_nl: 'Dompelpompen', name_fr: 'Pompes Submersibles', slug: 'submersible-pumps', description: '', description_nl: '', image: '', parentId: 'pumps', sortOrder: 2, isActive: true, productCount: 62 },
    ],
    filters: []
  },
  {
    id: 'valves',
    name: 'Valves & Controls',
    name_nl: 'Afsluiters & Besturingen',
    name_fr: 'Vannes & Contrôles',
    slug: 'valves',
    description: 'Industrial valves',
    description_nl: 'Industriële afsluiters',
    description_fr: 'Vannes industrielles',
    icon: '⚙️',
    image: '/images/products/fluxer-valve.svg',
    color: '#0066B3',
    sortOrder: 2,
    isActive: true,
    productCount: 312,
    subcategories: [],
    filters: []
  },
]

const mockFacets: SearchFacet[] = [
  {
    id: 'brand',
    name: 'Brand',
    name_nl: 'Merk',
    type: 'checkbox',
    values: [
      { value: 'dema', label: 'DEMA', count: 156, isSelected: false },
      { value: 'grundfos', label: 'Grundfos', count: 89, isSelected: false },
      { value: 'ksb', label: 'KSB', count: 45, isSelected: false },
      { value: 'lowara', label: 'Lowara', count: 34, isSelected: false },
    ]
  },
  {
    id: 'material',
    name: 'Material',
    name_nl: 'Materiaal',
    type: 'checkbox',
    values: [
      { value: 'cast-iron', label: 'Cast Iron', count: 120, isSelected: false },
      { value: 'stainless-steel', label: 'Stainless Steel', count: 98, isSelected: false },
      { value: 'bronze', label: 'Bronze', count: 45, isSelected: false },
      { value: 'plastic', label: 'Plastic', count: 67, isSelected: false },
    ]
  },
  {
    id: 'flow-rate',
    name: 'Flow Rate',
    name_nl: 'Debiet',
    type: 'range',
    values: [
      { value: '0-50', label: '0-50 m³/h', count: 89, isSelected: false },
      { value: '50-100', label: '50-100 m³/h', count: 67, isSelected: false },
      { value: '100-200', label: '100-200 m³/h', count: 45, isSelected: false },
      { value: '200+', label: '200+ m³/h', count: 23, isSelected: false },
    ]
  },
  {
    id: 'connection',
    name: 'Connection Size',
    name_nl: 'Aansluitmaat',
    type: 'checkbox',
    values: [
      { value: 'dn25', label: 'DN25', count: 45, isSelected: false },
      { value: 'dn32', label: 'DN32', count: 56, isSelected: false },
      { value: 'dn40', label: 'DN40', count: 78, isSelected: false },
      { value: 'dn50', label: 'DN50', count: 89, isSelected: false },
      { value: 'dn65', label: 'DN65', count: 67, isSelected: false },
      { value: 'dn80', label: 'DN80', count: 45, isSelected: false },
      { value: 'dn100', label: 'DN100', count: 34, isSelected: false },
    ]
  },
  {
    id: 'company',
    name: 'Available at',
    name_nl: 'Beschikbaar bij',
    type: 'checkbox',
    values: [
      { value: 'dema', label: 'DEMA', count: 245, isSelected: false },
      { value: 'fluxer', label: 'Fluxer', count: 156, isSelected: false },
      { value: 'devisschere', label: 'De Visschere', count: 89, isSelected: false },
    ]
  },
]

const mockProducts: Partial<Product>[] = Array.from({ length: 24 }, (_, i) => ({
  id: `product-${i + 1}`,
  sku: `DEMA-${String(i + 1).padStart(4, '0')}`,
  name: `Industrial Pump Model ${i + 1}`,
  name_nl: `Industriële Pomp Model ${i + 1}`,
  name_fr: `Pompe Industrielle Modèle ${i + 1}`,
  slug: `industrial-pump-model-${i + 1}`,
  categoryId: 'pumps',
  subcategoryId: 'centrifugal-pumps',
  shortDescription: 'High-performance industrial pump for various applications',
  shortDescription_nl: 'Hoogwaardige industriële pomp voor diverse toepassingen',
  shortDescription_fr: 'Pompe industrielle haute performance',
  pricing: {
    currency: 'EUR' as const,
    listPrice: 500 + (i * 75),
    tiers: []
  },
  images: [
    { id: '1', url: '/images/subcategories/centrifugal-pump.svg', alt: 'Pump', isPrimary: true, sortOrder: 1, type: 'product' as const }
  ],
  stockStatus: {
    inStock: i % 3 !== 0,
    quantity: i % 3 !== 0 ? 10 + i : 0,
    warehouses: []
  },
  companies: ['dema'],
  status: 'active' as const,
}))

const sortOptions = [
  { value: 'relevance', label: 'Relevance', label_nl: 'Relevantie' },
  { value: 'name_asc', label: 'Name (A-Z)', label_nl: 'Naam (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)', label_nl: 'Naam (Z-A)' },
  { value: 'price_asc', label: 'Price (Low-High)', label_nl: 'Prijs (Laag-Hoog)' },
  { value: 'price_desc', label: 'Price (High-Low)', label_nl: 'Prijs (Hoog-Laag)' },
  { value: 'newest', label: 'Newest', label_nl: 'Nieuwste' },
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [language] = useState<'en' | 'nl'>('nl')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [expandedFacets, setExpandedFacets] = useState<string[]>(['brand', 'material', 'flow-rate'])
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  
  // Toggle facet expansion
  const toggleFacet = (facetId: string) => {
    setExpandedFacets(prev => 
      prev.includes(facetId) 
        ? prev.filter(f => f !== facetId)
        : [...prev, facetId]
    )
  }
  
  // Toggle filter selection
  const toggleFilter = (facetId: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[facetId] || []
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      
      if (updated.length === 0) {
        const { [facetId]: _, ...rest } = prev
        return rest
      }
      
      return { ...prev, [facetId]: updated }
    })
    setCurrentPage(1)
  }
  
  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({})
    setSelectedCategory('')
    setSelectedSubcategory('')
    setSearchQuery('')
    setCurrentPage(1)
  }
  
  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(selectedFilters).reduce((acc, arr) => acc + arr.length, 0) +
      (selectedCategory ? 1 : 0) +
      (selectedSubcategory ? 1 : 0)
  }, [selectedFilters, selectedCategory, selectedSubcategory])
  
  // Paginated products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return mockProducts.slice(start, start + itemsPerPage)
  }, [currentPage])
  
  const totalPages = Math.ceil(mockProducts.length / itemsPerPage)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <h1 className="sr-only">{language === 'nl' ? 'Producten' : 'Products'}</h1>
          {/* Search Bar */}
          <div className="py-4">
            <div className="relative max-w-2xl mx-auto" role="search" aria-label={language === 'nl' ? 'Zoek producten' : 'Search products'}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'nl' ? 'Zoek op artikelnummer, naam of trefwoord...' : 'Search by SKU, name or keyword...'}
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={language === 'nl' ? 'Zoek producten' : 'Search products'}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-slate-700 hover:text-slate-900" />
                </button>
              )}
            </div>
          </div>
          
          {/* Category Pills */}
          <div className="flex gap-2 pb-4 overflow-x-auto">
            <button
              onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                !selectedCategory 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {language === 'nl' ? 'Alle producten' : 'All products'}
            </button>
            {mockCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory(''); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${
                  selectedCategory === cat.id 
                    ? 'text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
              >
                <span>{cat.icon}</span>
                <span>{language === 'nl' ? cat.name_nl : cat.name}</span>
                <span className="text-xs opacity-75">({cat.productCount})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`} role="complementary" aria-label={language === 'nl' ? 'Productfilters' : 'Product filters'}>
            <div className="bg-white rounded-xl border sticky top-32">
              {/* Filter Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-slate-600" />
                  <span className="font-semibold text-slate-900">
                    {language === 'nl' ? 'Filters' : 'Filters'}
                  </span>
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-sm text-blue-700 hover:underline"
                  >
                    {language === 'nl' ? 'Wis alles' : 'Clear all'}
                  </button>
                )}
              </div>
              
              {/* Subcategories (if category selected) */}
              {selectedCategory && (
                <div className="p-4 border-b">
                  <p className="font-medium text-slate-900 mb-3">
                    {language === 'nl' ? 'Subcategorieën' : 'Subcategories'}
                  </p>
                  <div className="space-y-2">
                    {mockCategories
                      .find(c => c.id === selectedCategory)
                      ?.subcategories.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSubcategory(sub.id === selectedSubcategory ? '' : sub.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                            selectedSubcategory === sub.id
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{language === 'nl' ? sub.name_nl : sub.name}</span>
                          <span className="text-slate-900 ml-1">({sub.productCount})</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Facet Filters */}
              <div className="divide-y max-h-[60vh] overflow-y-auto" role="group" aria-label={language === 'nl' ? 'Filteropties' : 'Filter options'}>
                {mockFacets.map(facet => (
                  <div key={facet.id} className="p-4">
                    <button
                      onClick={() => toggleFacet(facet.id)}
                      className="w-full flex items-center justify-between mb-3"
                      aria-expanded={expandedFacets.includes(facet.id) ? "true" : "false"}
                      aria-controls={`facet-${facet.id}`}
                      aria-label={`${language === 'nl' ? 'Toon' : 'Show'} ${language === 'nl' ? facet.name_nl : facet.name} ${language === 'nl' ? 'opties' : 'options'}`}
                      aria-haspopup="true"
                    >
                      <span className="font-medium text-slate-900">
                        {language === 'nl' ? facet.name_nl : facet.name}
                      </span>
                      {expandedFacets.includes(facet.id) ? (
                        <ChevronUp className="w-4 h-4 text-slate-700" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-700" />
                      )}
                    </button>
                    
                    {expandedFacets.includes(facet.id) && (
                      <div id={`facet-${facet.id}`} className="space-y-2" role="group" aria-label={language === 'nl' ? `${facet.name_nl} opties` : `${facet.name} options`}>
                        {facet.values.map(value => {
                          const isSelected = selectedFilters[facet.id]?.includes(value.value)
                          return (
                            <label
                              key={value.value}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                                isSelected 
                                  ? 'bg-blue-600 border-blue-600' 
                                  : 'border-slate-300 group-hover:border-slate-400'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleFilter(facet.id, value.value)}
                                className="sr-only"
                              />
                              <span className="flex-1 text-sm text-slate-900">
                                {value.label}
                              </span>
                              <span className="text-xs text-slate-900">
                                {value.count}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
          
          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-900">
                  <span className="font-semibold text-slate-900">{mockProducts.length}</span>
                  {' '}{language === 'nl' ? 'producten gevonden' : 'products found'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label={language === 'nl' ? 'Sorteer producten' : 'Sort products'}
                    className="appearance-none bg-white border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {language === 'nl' ? opt.label_nl : opt.label}
                      </option>
                    ))}
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 pointer-events-none" />
                </div>
                
                {/* View Toggle */}
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label={language === 'nl' ? 'Rasterweergave' : 'Grid view'}
                    aria-pressed={viewMode === 'grid'}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:text-slate-900'}`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label={language === 'nl' ? 'Lijstweergave' : 'List view'}
                    aria-pressed={viewMode === 'list'}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:text-slate-900'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg"
                >
                  <Filter className="w-4 h-4" />
                  <span>{language === 'nl' ? 'Filters' : 'Filters'}</span>
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Active Filters Tags */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {mockCategories.find(c => c.id === selectedCategory)?.name_nl}
                    <button onClick={() => setSelectedCategory('')}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {Object.entries(selectedFilters).map(([facetId, values]) =>
                  values.map(value => {
                    const facet = mockFacets.find(f => f.id === facetId)
                    const valueLabel = facet?.values.find(v => v.value === value)?.label
                    return (
                      <span 
                        key={`${facetId}-${value}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                      >
                        {valueLabel}
                        <button onClick={() => toggleFilter(facetId, value)}>
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    )
                  })
                )}
              </div>
            )}
            
            {/* Product Grid */}
            <div className={viewMode === 'grid' 
              ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
              : 'space-y-4'
            }>
              {paginatedProducts.map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className={`bg-white rounded-xl border hover:shadow-lg transition group ${
                    viewMode === 'list' ? 'flex gap-4 p-4' : ''
                  }`}
                >
                  {/* Image */}
                  <div className={`${
                    viewMode === 'grid' 
                      ? 'aspect-square p-4' 
                      : 'w-32 h-32 flex-shrink-0'
                  } bg-slate-50 rounded-lg flex items-center justify-center`}>
                    <Image
                      src={product.images?.[0]?.url || '/images/placeholder.svg'}
                      alt={product.name || ''}
                      width={viewMode === 'grid' ? 200 : 100}
                      height={viewMode === 'grid' ? 200 : 100}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition"
                      aria-describedby={`desc-${product.id}`}
                    />
                    <div id={`desc-${product.id}`} className="sr-only">
                      {product.shortDescription || ''}
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className={viewMode === 'grid' ? 'p-4 pt-0' : 'flex-1 py-2'}>
                    <span className="text-xs text-slate-700 mb-1">{product.sku}</span>
                    <h2 className="font-medium text-slate-900 group-hover:text-blue-700 transition line-clamp-2 mb-2">
                      {language === 'nl' ? product.name_nl : product.name}
                    </h2>
                    
                    {viewMode === 'list' && (
                      <p className="text-sm text-slate-900 line-clamp-2 mb-2">
                        {language === 'nl' ? product.shortDescription_nl : product.shortDescription}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-blue-700">
                        €{product.pricing?.listPrice.toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        product.stockStatus?.inStock 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {product.stockStatus?.inStock 
                          ? (language === 'nl' ? 'Op voorraad' : 'In stock')
                          : (language === 'nl' ? 'Op bestelling' : 'On order')
                        }
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  {language === 'nl' ? 'Vorige' : 'Previous'}
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg ${
                      currentPage === page 
                        ? 'bg-blue-600 text-white' 
                        : 'border hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  {language === 'nl' ? 'Volgende' : 'Next'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
