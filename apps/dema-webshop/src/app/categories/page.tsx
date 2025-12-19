"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/contexts/LocaleContext';
import { Package, Wrench, Droplets, Wind, Gauge, Plug, Layers, Settings, ChevronRight, ChevronDown } from 'lucide-react';

// 3-Level Hierarchy:
// Level 1: Main Categories (e.g., "Pompen & Toebehoren")
// Level 2: Subcategories (e.g., "Dompelpompen", "Centrifugaalpompen")
// Level 3: Product Groups/Catalogs (actual catalog slugs from data)

interface Level3Item {
  catalog: string;
  displayName: string;
  count: number;
}

interface Level2Item {
  name: string;
  slug: string;
  catalogs: string[]; // catalog slugs that belong here
  items: Level3Item[];
}

interface Level1Item {
  name: string;
  slug: string;
  icon: React.ReactNode;
  color: { bg: string; text: string; border: string; accent: string };
  subcategories: Level2Item[];
}

// Define the 3-level hierarchy
const CATEGORY_HIERARCHY: Level1Item[] = [
  {
    name: 'Merken',
    slug: 'merken',
    icon: <Wrench className="w-5 h-5" />,
    color: { bg: 'bg-blue-50', text: 'text-primary-dark', border: 'border-blue-200', accent: 'bg-blue-500' },
    subcategories: [
      { name: 'Makita', slug: 'makita', catalogs: ['makita-catalogus-2022-nl', 'makita-tuinfolder-2022-nl'], items: [] },
      { name: 'Airpress', slug: 'airpress', catalogs: ['airpress-catalogus-nl-fr', 'airpress-catalogus-eng'], items: [] },
      { name: 'Kränzle', slug: 'kranzle', catalogs: ['kranzle-catalogus-2021-nl-1'], items: [] },
    ],
  },
  {
    name: 'Pompen & Toebehoren',
    slug: 'pompen',
    icon: <Droplets className="w-5 h-5" />,
    color: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', accent: 'bg-cyan-500' },
    subcategories: [
      { name: 'Dompelpompen', slug: 'dompelpompen', catalogs: ['dompelpompen'], items: [] },
      { name: 'Centrifugaalpompen', slug: 'centrifugaalpompen', catalogs: ['centrifugaalpompen'], items: [] },
      { name: 'Bronpompen', slug: 'bronpompen', catalogs: ['bronpompen'], items: [] },
      { name: 'Zuigerpompen', slug: 'zuigerpompen', catalogs: ['zuigerpompen'], items: [] },
      { name: 'Pomp Specials', slug: 'pomp-specials', catalogs: ['pomp-specials'], items: [] },
      { name: 'Toebehoren', slug: 'pompen-toebehoren', catalogs: ['digitale-versie-pompentoebehoren-compressed'], items: [] },
    ],
  },
  {
    name: 'Buizen & Fittingen',
    slug: 'buizen-fittingen',
    icon: <Layers className="w-5 h-5" />,
    color: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', accent: 'bg-orange-500' },
    subcategories: [
      { name: 'Kunststof Buizen', slug: 'kunststof-buizen', catalogs: ['pe-buizen', 'abs-persluchtbuizen', 'kunststof-afvoerleidingen', 'drukbuizen'], items: [] },
      { name: 'Metalen Buizen', slug: 'metalen-buizen', catalogs: ['verzinkte-buizen'], items: [] },
      { name: 'Fittingen', slug: 'fittingen', catalogs: ['messing-draadfittingen', 'rvs-draadfittingen', 'zwarte-draad-en-lasfittingen'], items: [] },
    ],
  },
  {
    name: 'Slangen & Koppelingen',
    slug: 'slangen-koppelingen',
    icon: <Gauge className="w-5 h-5" />,
    color: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', accent: 'bg-green-500' },
    subcategories: [
      { name: 'Slangen', slug: 'slangen', catalogs: ['rubber-slangen', 'pu-afzuigslangen', 'plat-oprolbare-slangen'], items: [] },
      { name: 'Koppelingen & Klemmen', slug: 'koppelingen-klemmen', catalogs: ['slangkoppelingen', 'slangklemmen'], items: [] },
    ],
  },
  {
    name: 'Aandrijftechniek',
    slug: 'aandrijftechniek',
    icon: <Settings className="w-5 h-5" />,
    color: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', accent: 'bg-purple-500' },
    subcategories: [
      { name: 'Aandrijfcomponenten', slug: 'aandrijfcomponenten', catalogs: ['catalogus-aandrijftechniek-150922'], items: [] },
    ],
  },
];

// Catalog display names
const CATALOG_NAMES: Record<string, string> = {
  'makita-catalogus-2022-nl': 'Gereedschap Catalogus',
  'makita-tuinfolder-2022-nl': 'Tuin Catalogus',
  'airpress-catalogus-nl-fr': 'Catalogus NL/FR',
  'airpress-catalogus-eng': 'Catalogus EN',
  'kranzle-catalogus-2021-nl-1': 'Hogedrukreinigers',
  'dompelpompen': 'Dompelpompen',
  'centrifugaalpompen': 'Centrifugaalpompen',
  'bronpompen': 'Bronpompen',
  'zuigerpompen': 'Zuigerpompen',
  'pomp-specials': 'Specials',
  'digitale-versie-pompentoebehoren-compressed': 'Toebehoren',
  'pe-buizen': 'PE Buizen',
  'abs-persluchtbuizen': 'ABS Persluchtbuizen',
  'kunststof-afvoerleidingen': 'Afvoerleidingen',
  'drukbuizen': 'Drukbuizen',
  'verzinkte-buizen': 'Verzinkte Buizen',
  'messing-draadfittingen': 'Messing',
  'rvs-draadfittingen': 'RVS',
  'zwarte-draad-en-lasfittingen': 'Zwart Staal',
  'rubber-slangen': 'Rubber',
  'pu-afzuigslangen': 'PU Afzuig',
  'plat-oprolbare-slangen': 'Plat Oprolbaar',
  'slangkoppelingen': 'Koppelingen',
  'slangklemmen': 'Klemmen',
  'catalogus-aandrijftechniek-150922': 'Catalogus',
};

export default function CategoriesPage() {
  const { t } = useLocale();
  const [hierarchy, setHierarchy] = useState<Level1Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedL1, setExpandedL1] = useState<string[]>([]);
  const [expandedL2, setExpandedL2] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/data/products_all_grouped.json');
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        
        // Count products per catalog
        const catalogCounts: Record<string, number> = {};
        data.forEach((product: any) => {
          const catalog = product.catalog || 'other';
          catalogCounts[catalog] = (catalogCounts[catalog] || 0) + 1;
        });
        
        // Build hierarchy with counts
        const enrichedHierarchy = CATEGORY_HIERARCHY.map(l1 => ({
          ...l1,
          subcategories: l1.subcategories.map(l2 => ({
            ...l2,
            items: l2.catalogs
              .filter(cat => catalogCounts[cat] > 0)
              .map(cat => ({
                catalog: cat,
                displayName: CATALOG_NAMES[cat] || cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                count: catalogCounts[cat] || 0,
              }))
              .sort((a, b) => b.count - a.count),
          })).filter(l2 => l2.items.length > 0),
        })).filter(l1 => l1.subcategories.length > 0);
        
        setHierarchy(enrichedHierarchy);
        // Expand all L1 by default
        setExpandedL1(enrichedHierarchy.map(l1 => l1.slug));
      } catch (err) {
        console.error('Failed to load categories:', err);
        setHierarchy([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleL1 = (slug: string) => {
    setExpandedL1(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const toggleL2 = (slug: string) => {
    setExpandedL2(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const totalProducts = hierarchy.reduce((sum, l1) => 
    sum + l1.subcategories.reduce((s2, l2) => 
      s2 + l2.items.reduce((s3, l3) => s3 + l3.count, 0), 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('nav.categories')}</h1>
          <p className="text-gray-600">
            Ontdek ons assortiment van {totalProducts.toLocaleString()} producten
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Tree Structure */}
            {hierarchy.map((l1, l1Index) => {
              const isL1Expanded = expandedL1.includes(l1.slug);
              const l1Count = l1.subcategories.reduce((s, l2) => s + l2.items.reduce((s2, l3) => s2 + l3.count, 0), 0);
              
              return (
                <div key={l1.slug} className={l1Index > 0 ? 'border-t border-gray-200' : ''}>
                  {/* Level 1 - Main Category */}
                  <button
                    onClick={() => toggleL1(l1.slug)}
                    className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${l1.color.bg}`}
                  >
                    <div className={`p-2 rounded-lg ${l1.color.accent} text-white`}>
                      {l1.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h2 className={`font-semibold ${l1.color.text}`}>{l1.name}</h2>
                      <p className="text-sm text-gray-500">{l1Count} producten</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isL1Expanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Level 2 - Subcategories */}
                  {isL1Expanded && (
                    <div className="border-t border-gray-100">
                      {l1.subcategories.map((l2, l2Index) => {
                        const isL2Expanded = expandedL2.includes(l2.slug);
                        const l2Count = l2.items.reduce((s, l3) => s + l3.count, 0);
                        
                        return (
                          <div key={l2.slug} className={l2Index > 0 ? 'border-t border-gray-100' : ''}>
                            {/* Level 2 Header */}
                            <button
                              onClick={() => toggleL2(l2.slug)}
                              className="w-full flex items-center gap-3 pl-14 pr-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${l1.color.accent}`}></div>
                              <div className="flex-1 text-left">
                                <span className="font-medium text-gray-800">{l2.name}</span>
                                <span className="ml-2 text-sm text-gray-400">({l2Count})</span>
                              </div>
                              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isL2Expanded ? 'rotate-90' : ''}`} />
                            </button>

                            {/* Level 3 - Product Groups/Catalogs */}
                            {isL2Expanded && (
                              <div className="pl-20 pr-4 pb-3 flex flex-wrap gap-2">
                                {l2.items.map((l3) => (
                                  <Link
                                    key={l3.catalog}
                                    href={`/products?catalog=${encodeURIComponent(l3.catalog)}`}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border ${l1.color.border} ${l1.color.bg} hover:shadow-sm transition-all group`}
                                  >
                                    <span className={`font-medium ${l1.color.text} group-hover:text-orange-600`}>
                                      {l3.displayName}
                                    </span>
                                    <span className="text-xs text-gray-400 bg-white px-1.5 py-0.5 rounded-full">
                                      {l3.count}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
