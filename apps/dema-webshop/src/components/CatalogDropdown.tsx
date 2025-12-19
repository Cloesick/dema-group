'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, FileText } from 'lucide-react';

import { fetchJsonSafe } from '@/lib/fetchJson';

type CatalogLink = { name: string; url: string };

function titleizeCatalog(catalog: string): string {
  return catalog
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
}

interface CatalogDropdownProps {
  currentCatalog?: string;
}

export default function CatalogDropdown({ currentCatalog }: CatalogDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [catalogs, setCatalogs] = useState<CatalogLink[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchJsonSafe('/data/products_all_grouped.json')
      .then((data: any[]) => {
        const unique = Array.from(
          new Set((Array.isArray(data) ? data : []).map(g => g?.catalog).filter(Boolean))
        ) as string[];
        unique.sort((a, b) => a.localeCompare(b));
        setCatalogs(unique.map(c => ({ name: titleizeCatalog(c), url: `/products?catalog=${encodeURIComponent(c)}` })));
      })
      .catch(err => {
        console.error('Failed to load catalogs list:', err);
      });
  }, []);

  const current = catalogs.find(c =>
    currentCatalog && c.name.toLowerCase().includes(currentCatalog.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-primary transition-colors text-sm font-medium"
      >
        <FileText className="h-4 w-4" />
        <span>{current ? current.name : '📚 All Catalogs'}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
              All Catalogs ({catalogs.length})
            </div>
            {catalogs.map((catalog) => (
              <Link
                key={catalog.url}
                href={catalog.url}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                  current?.url === catalog.url ? 'bg-blue-50 font-semibold' : ''
                }`}
              >
                <span className="text-sm text-gray-900">{catalog.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
