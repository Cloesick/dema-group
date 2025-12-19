'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import Link from 'next/link';

interface Product {
  sku: string;
  description: string;
  product_category: string;
  pdf_source?: string;
  source_pages?: number[];
  pressure_max_bar?: number;
  pressure_min_bar?: number;
  dimensions_mm_list?: number[];
  length_m?: number;
  connection_types?: string[];
  [key: string]: any;
}

interface ProductSearchProps {
  onSearchResults: (results: Product[]) => void;
}

export default function ProductSearch({ onSearchResults }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      onSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Not JSON response');
      }
      const data = await response.json();
      setSuggestions(data);
      onSearchResults(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSuggestions([]);
      onSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchSuggestions(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    onSearchResults([]);
    setShowSuggestions(false);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? 
      <span key={i} className="bg-yellow-200">{part}</span> : 
      part
    );
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search products by SKU, name, or description..."
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {showSuggestions && (searchTerm.length >= 2) && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-96">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500">Searching...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.slice(0, 10).map((product) => (
                <li key={product.sku} className="hover:bg-gray-50">
                  <Link 
                    href={`/products/${product.sku}`}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowSuggestions(false)}
                  >
                    <div className="font-medium text-gray-900">
                      {highlightMatch(product.sku, searchTerm)} - {highlightMatch(product.product_category, searchTerm)}
                    </div>
                    <div className="text-gray-500 mt-1 truncate">
                      {highlightMatch(product.description.substring(0, 120) + (product.description.length > 120 ? '...' : ''), searchTerm)}
                    </div>
                    {product.pressure_max_bar && (
                      <div className="mt-1 text-xs text-gray-500">
                        Max Pressure: {product.pressure_max_bar} bar
                      </div>
                    )}
                  </Link>
                </li>
              ))}
              {suggestions.length > 10 && (
                <li className="px-4 py-2 text-xs text-gray-500 text-center">
                  Showing 10 of {suggestions.length} results
                </li>
              )}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className="px-4 py-2 text-gray-500">No products found. Try a different search term.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
