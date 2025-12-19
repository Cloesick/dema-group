'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronUp, ChevronDown, Search, X } from 'lucide-react';

interface Product {
  sku: string;
  pdf_source?: string;
  power_kw?: number;
  pressure_max_bar?: number;
  voltage_v?: number;
  weight_kg?: number;
  connection_types?: string[];
  dimensions_mm_list?: number[];
  [key: string]: any;
}

interface ProductFiltersProps {
  products: Product[];
  onFilterChange?: (filters: Record<string, string[]>) => void;
  onSearch?: (search: string) => void;
  initialFilters?: Record<string, string[]>;
  initialSearch?: string;
  className?: string;
}

interface FilterOption {
  type: string;
  value: string;
  label: string;
  count: number;
}

const FilterSection = ({ 
  title, 
  children, 
  defaultOpen = true,
  className = '' 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className={`border-b border-gray-200 pb-4 ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-2 text-left focus:outline-none"
      >
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          {title}
        </h3>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        )}
      </button>
      {isOpen && (
        <div className="mt-2 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default function SimpleProductFilters({ 
  products = [], 
  onFilterChange = () => {},
  onSearch = () => {},
  initialFilters = {},
  initialSearch = '',
  className = ''
}: ProductFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(initialFilters);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Only sync from URL on initial mount, not on every change
  useEffect(() => {
    if (!isInitialized && Object.keys(initialFilters).length > 0) {
      setActiveFilters(initialFilters);
      setIsInitialized(true);
    }
  }, [initialFilters, isInitialized]);
  
  useEffect(() => {
    if (!isInitialized && initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch, isInitialized]);
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{type: string, value: string, product: Product}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Helper function to check if a product matches a specific filter
  const productMatchesFilter = (product: Product, filterType: string, filterValue: string): boolean => {
    switch (filterType) {
      case 'catalog':
        return product.pdf_source?.replace('.pdf', '') === filterValue || product.catalog === filterValue;
      case 'material':
        return product.material === filterValue;
      case 'diameter_mm':
        const diam = product.diameter_mm || product.diameter;
        if (typeof diam === 'number') return String(Math.round(diam)) === filterValue;
        return diam === filterValue;
      case 'pressure_bar':
        const press = product.pressure_bar || product.max_pressure_bar || product.druk;
        if (typeof press === 'number') return String(Math.round(press)) === filterValue;
        return false;
      case 'connection_type':
        return product.connection_type === filterValue || product.connection_size === filterValue;
      case 'size':
        return product.size === filterValue || product.maat === filterValue;
      default:
        return false;
    }
  };

  // Helper function to check if a product matches ALL active filters
  const productMatchesAllFilters = (product: Product, filters: Record<string, string[]>): boolean => {
    return Object.entries(filters).every(([filterType, filterValues]) => {
      if (!filterValues || filterValues.length === 0) return true;
      return filterValues.some(value => productMatchesFilter(product, filterType, value));
    });
  };

  // Calculate available filters based on currently filtered products (cascading logic)
  const availableFilters = useMemo(() => {
    const filterTypes = ['catalog', 'material', 'diameter_mm', 'pressure_bar', 'connection_type', 'size'];
    const filterOptions: Record<string, FilterOption[]> = {};

    filterTypes.forEach(currentFilterType => {
      // For each filter type, calculate available options based on products that match OTHER active filters
      const otherFilters = { ...activeFilters };
      delete otherFilters[currentFilterType]; // Exclude current filter type

      // Get products that match all OTHER filters
      const relevantProducts = products.filter(p => productMatchesAllFilters(p, otherFilters));

      // Extract unique values for this filter type from relevant products
      const values = new Set<string>();
      
      relevantProducts.forEach(product => {
        switch (currentFilterType) {
          case 'catalog':
            if (product.pdf_source) values.add(product.pdf_source.replace('.pdf', ''));
            if (product.catalog) values.add(product.catalog);
            break;
          case 'material':
            if (product.material && typeof product.material === 'string' && product.material.length > 0) {
              values.add(product.material);
            }
            break;
          case 'diameter_mm':
            const diameter = product.diameter_mm || product.diameter;
            if (typeof diameter === 'number' && diameter > 0) {
              values.add(String(Math.round(diameter)));
            } else if (typeof diameter === 'string' && diameter.length > 0) {
              values.add(diameter);
            }
            break;
          case 'pressure_bar':
            const pressure = product.pressure_bar || product.max_pressure_bar || product.druk;
            if (typeof pressure === 'number' && pressure > 0) {
              values.add(String(Math.round(pressure)));
            }
            break;
          case 'connection_type':
            if (product.connection_type && typeof product.connection_type === 'string') {
              values.add(product.connection_type);
            }
            if (product.connection_size && typeof product.connection_size === 'string') {
              values.add(product.connection_size);
            }
            break;
          case 'size':
            if (product.size && typeof product.size === 'string' && product.size.length > 0) {
              values.add(product.size);
            }
            if (product.maat && typeof product.maat === 'string') {
              values.add(product.maat);
            }
            break;
        }
      });

      // Convert to filter options with counts
      filterOptions[currentFilterType] = Array.from(values).map(value => {
        const count = relevantProducts.filter(p => productMatchesFilter(p, currentFilterType, value)).length;
        return { type: currentFilterType, value, label: value, count };
      }).sort((a, b) => {
        if (currentFilterType === 'catalog') return b.count - a.count;
        if (currentFilterType === 'diameter_mm' || currentFilterType === 'pressure_bar') {
          return (parseFloat(a.value) || 0) - (parseFloat(b.value) || 0);
        }
        return a.value.localeCompare(b.value, 'nl', { numeric: true });
      });
    });

    return filterOptions;
  }, [products, activeFilters]);

  const handleFilterChange = (type: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (value) {
      newFilters[type] = [value];
    } else {
      delete newFilters[type];
    }
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Search suggestions logic
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      const suggestions: Array<{type: string, value: string, product: Product}> = [];
      const seen = new Set<string>();

      products.forEach(product => {
        // Search in SKU
        if (product.sku && product.sku.toLowerCase().includes(query)) {
          const key = `sku-${product.sku}`;
          if (!seen.has(key) && suggestions.length < 10) {
            suggestions.push({ type: 'SKU', value: product.sku, product });
            seen.add(key);
          }
        }
        // Search in name
        if (product.name && product.name.toLowerCase().includes(query)) {
          const key = `name-${product.name}`;
          if (!seen.has(key) && suggestions.length < 10) {
            suggestions.push({ type: 'Name', value: product.name, product });
            seen.add(key);
          }
        }
        // Search in catalog PDF
        if (product.pdf_source && product.pdf_source.toLowerCase().includes(query)) {
          const key = `pdf-${product.pdf_source}`;
          if (!seen.has(key) && suggestions.length < 10) {
            suggestions.push({ type: 'Catalog PDF', value: product.pdf_source, product });
            seen.add(key);
          }
        }
        // Search in page number
        if (product.page_in_pdf && String(product.page_in_pdf).includes(query)) {
          const key = `page-${product.sku}-${product.page_in_pdf}`;
          if (!seen.has(key) && suggestions.length < 10) {
            suggestions.push({ type: 'PDF Page', value: `Page ${product.page_in_pdf} in ${product.pdf_source}`, product });
            seen.add(key);
          }
        }
      });

      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion: {type: string, value: string, product: Product}) => {
    setSearchQuery(suggestion.value);
    onSearch(suggestion.value);
    setShowSuggestions(false);
  };

  const resetFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    onFilterChange({});
    onSearch('');
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchQuery.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar with Legend */}
      <div className="bg-white rounded-lg border-2 border-primary p-4 mb-6">
        <div className="space-y-3">
          {/* Search Legend */}
          <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
            <Search className="h-4 w-4 text-primary" />
            <span className="font-medium">Search by:</span>
            <span className="px-2 py-1 bg-gray-100 rounded">SKU</span>
            <span className="px-2 py-1 bg-gray-100 rounded">Product Name</span>
            <span className="px-2 py-1 bg-gray-100 rounded">Catalog PDF</span>
            <span className="px-2 py-1 bg-gray-100 rounded">PDF Page</span>
          </div>

          {/* Search Input */}
          <div ref={searchRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                placeholder="Start typing to search products... (min. 2 characters)"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {searchSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span 
                        className="px-2 py-1 text-xs font-medium rounded text-white flex-shrink-0 bg-primary"
                      >
                        {suggestion.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {suggestion.value}
                        </div>
                        {suggestion.product.name && suggestion.type !== 'Name' && (
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {suggestion.product.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="w-full py-2 px-4 border-2 border-primary text-primary bg-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 hover:bg-primary hover:text-white"
            >
              <X className="h-4 w-4" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections - Only show filters with available options */}
      
      {/* 1. Catalog filter */}
      {availableFilters.catalog?.length > 0 && (
        <FilterSection title="Catalogus">
          <select
            id="catalog-filter"
            value={activeFilters.catalog?.[0] || ''}
            onChange={(e) => handleFilterChange('catalog', e.target.value)}
            className="w-full rounded-md bg-white border border-gray-300 text-gray-900 text-sm p-2 focus:ring-2 focus:border-transparent transition duration-200"
          >
            <option value="">Alle catalogi</option>
            {availableFilters.catalog.map(({ value, count }) => (
              <option key={value} value={value}>
                {value} ({count})
              </option>
            ))}
          </select>
        </FilterSection>
      )}

      {/* 2. Material filter */}
      {availableFilters.material?.length > 0 && (
        <FilterSection title="Materiaal">
          <select
            id="material-filter"
            value={activeFilters.material?.[0] || ''}
            onChange={(e) => handleFilterChange('material', e.target.value)}
            className="w-full rounded-md bg-white border border-gray-300 text-gray-900 text-sm p-2 focus:ring-2 focus:border-transparent transition duration-200"
          >
            <option value="">Alle materialen</option>
            {availableFilters.material.map(({ value, count }) => (
              <option key={value} value={value}>
                {value} ({count})
              </option>
            ))}
          </select>
        </FilterSection>
      )}

      {/* 3. Diameter filter */}
      {availableFilters.diameter_mm?.length > 0 && (
        <FilterSection title="Diameter (mm)">
          <select
            id="diameter-filter"
            value={activeFilters.diameter_mm?.[0] || ''}
            onChange={(e) => handleFilterChange('diameter_mm', e.target.value)}
            className="w-full rounded-md bg-white border border-gray-300 text-gray-900 text-sm p-2 focus:ring-2 focus:border-transparent transition duration-200"
          >
            <option value="">Alle diameters</option>
            {availableFilters.diameter_mm.map(({ value, count }) => (
              <option key={value} value={value}>
                {value} mm ({count})
              </option>
            ))}
          </select>
        </FilterSection>
      )}

      {/* 4. Pressure filter */}
      {availableFilters.pressure_bar?.length > 0 && (
        <FilterSection title="Druk (bar)">
          <select
            id="pressure-filter"
            value={activeFilters.pressure_bar?.[0] || ''}
            onChange={(e) => handleFilterChange('pressure_bar', e.target.value)}
            className="w-full rounded-md bg-white border border-gray-300 text-gray-900 text-sm p-2 focus:ring-2 focus:border-transparent transition duration-200"
          >
            <option value="">Alle drukken</option>
            {availableFilters.pressure_bar.map(({ value, count }) => (
              <option key={value} value={value}>
                {value} bar ({count})
              </option>
            ))}
          </select>
        </FilterSection>
      )}

      {/* 5. Size filter */}
      {availableFilters.size?.length > 0 && (
        <FilterSection title="Maat">
          <select
            id="size-filter"
            value={activeFilters.size?.[0] || ''}
            onChange={(e) => handleFilterChange('size', e.target.value)}
            className="w-full rounded-md bg-white border border-gray-300 text-gray-900 text-sm p-2 focus:ring-2 focus:border-transparent transition duration-200"
          >
            <option value="">Alle maten</option>
            {availableFilters.size.map(({ value, count }) => (
              <option key={value} value={value}>
                {value} ({count})
              </option>
            ))}
          </select>
        </FilterSection>
      )}

      {/* 6. Connection type filter */}
      {availableFilters.connection_type?.length > 0 && (
        <FilterSection title="Aansluiting">
          <select
            id="connection-filter"
            value={activeFilters.connection_type?.[0] || ''}
            onChange={(e) => handleFilterChange('connection_type', e.target.value)}
            className="w-full rounded-md bg-white border border-gray-300 text-gray-900 text-sm p-2 focus:ring-2 focus:border-transparent transition duration-200"
          >
            <option value="">Alle aansluitingen</option>
            {availableFilters.connection_type.map(({ value, count }) => (
              <option key={value} value={value}>
                {value} ({count})
              </option>
            ))}
          </select>
        </FilterSection>
      )}
    </div>
  );
}
