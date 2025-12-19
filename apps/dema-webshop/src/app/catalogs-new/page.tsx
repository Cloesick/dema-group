'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Package, Image as ImageIcon, ShoppingCart } from 'lucide-react';

interface CatalogInfo {
  name: string;
  displayName: string;
  fileName: string;
  productsFile: string;
  productCount: number;
  imageGroupCount: number;
  hasData: boolean;
}

export default function CatalogsOverviewPage() {
  const [catalogs, setCatalogs] = useState<CatalogInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // List of all available catalogs (from our Product_pdfs folder)
  const catalogList = [
    { name: 'abs-persluchtbuizen', displayName: 'ABS Persluchtbuizen' },
    { name: 'airpress-catalogus-eng', displayName: 'Airpress Catalog (English)' },
    { name: 'airpress-catalogus-nl-fr', displayName: 'Airpress Catalog (NL/FR)' },
    { name: 'bronpompen', displayName: 'Bronpompen' },
    { name: 'catalogus-aandrijftechniek-150922', displayName: 'Aandrijftechniek' },
    { name: 'centrifugaalpompen', displayName: 'Centrifugaalpompen' },
    { name: 'digitale-versie-pompentoebehoren-compressed', displayName: 'Pompentoebehoren' },
    { name: 'dompelpompen', displayName: 'Dompelpompen' },
    { name: 'drukbuizen', displayName: 'Drukbuizen' },
    { name: 'kranzle-catalogus-2021-nl-1', displayName: 'Kränzle Catalog 2021' },
    { name: 'kunststof-afvoerleidingen', displayName: 'Kunststof Afvoerleidingen' },
    { name: 'makita-catalogus-2022-nl', displayName: 'Makita Catalog 2022' },
    { name: 'makita-tuinfolder-2022-nl', displayName: 'Makita Tuinfolder 2022' },
    { name: 'messing-draadfittingen', displayName: 'Messing Draadfittingen' },
    { name: 'pe-buizen', displayName: 'PE Buizen' },
    { name: 'plat-oprolbare-slangen', displayName: 'Plat Oprolbare Slangen' },
    { name: 'pomp-specials', displayName: 'Pomp Specials' },
    { name: 'pu-afzuigslangen', displayName: 'PU Afzuigslangen' },
    { name: 'rubber-slangen', displayName: 'Rubber Slangen' },
    { name: 'rvs-draadfittingen', displayName: 'RVS Draadfittingen' },
    { name: 'slangklemmen', displayName: 'Slangklemmen' },
    { name: 'slangkoppelingen', displayName: 'Slangkoppelingen' },
    { name: 'verzinkte-buizen', displayName: 'Verzinkte Buizen' },
    { name: 'zuigerpompen', displayName: 'Zuigerpompen' },
    { name: 'zwarte-draad-en-lasfittingen', displayName: 'Zwarte Draad en Lasfittingen' },
  ];

  useEffect(() => {
    async function loadCatalogStats() {
      const catalogInfoPromises = catalogList.map(async (catalog) => {
        const productsFileName = `${catalog.name.replace(/-/g, '_')}_products.json`;
        
        try {
          const response = await fetch(`/data/${productsFileName}`);
          if (!response.ok) throw new Error('Not found');
          
          const data = await response.json();
          const productCount = data.reduce((sum: number, group: any) => 
            sum + (group.products?.length || 0), 0
          );
          
          return {
            name: catalog.name,
            displayName: catalog.displayName,
            fileName: `${catalog.name}.pdf`,
            productsFile: productsFileName,
            productCount,
            imageGroupCount: data.length,
            hasData: true,
          };
        } catch (error) {
          return {
            name: catalog.name,
            displayName: catalog.displayName,
            fileName: `${catalog.name}.pdf`,
            productsFile: productsFileName,
            productCount: 0,
            imageGroupCount: 0,
            hasData: false,
          };
        }
      });

      const results = await Promise.all(catalogInfoPromises);
      setCatalogs(results.sort((a, b) => b.productCount - a.productCount));
      setLoading(false);
    }

    loadCatalogStats();
  }, []);

  const totalProducts = catalogs.reduce((sum, cat) => sum + cat.productCount, 0);
  const totalImageGroups = catalogs.reduce((sum, cat) => sum + cat.imageGroupCount, 0);
  const availableCatalogs = catalogs.filter(c => c.hasData).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading catalogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-4">📚 Product Catalogs</h1>
          <p className="text-xl opacity-90 mb-8">
            Browse our complete collection of product catalogs with icon-based property display
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold">{availableCatalogs}</div>
              <div className="text-white/80">Available Catalogs</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold">{totalProducts.toLocaleString()}</div>
              <div className="text-white/80">Total Products</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl font-bold">{totalImageGroups}</div>
              <div className="text-white/80">Image Groups</div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogs.map((catalog) => (
            <Link
              key={catalog.name}
              href={catalog.hasData ? `/products?catalog=${catalog.name}` : '#'}
              className={`group ${
                catalog.hasData 
                  ? 'cursor-pointer hover:scale-105' 
                  : 'cursor-not-allowed opacity-60'
              } transition-all duration-300`}
            >
              <div className={`bg-white rounded-xl shadow-md overflow-hidden h-full ${
                catalog.hasData ? 'hover:shadow-2xl' : ''
              }`}>
                {/* Header */}
                <div className={`p-6 ${
                  catalog.name.includes('makita') 
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-500'
                    : catalog.name.includes('airpress') || catalog.name.includes('kranzle')
                    ? 'bg-gradient-to-br from-orange-500 to-red-500'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                } text-white`}>
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-12 h-12" />
                    {catalog.hasData && (
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                        AVAILABLE
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{catalog.displayName}</h3>
                  <p className="text-sm text-white/80">{catalog.fileName}</p>
                </div>

                {/* Stats */}
                {catalog.hasData ? (
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Package className="w-6 h-6 text-primary mx-auto mb-1" />
                        <div className="text-2xl font-bold text-primary">
                          {catalog.productCount}
                        </div>
                        <div className="text-xs text-gray-600">Products</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <ImageIcon className="w-6 h-6 text-green-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-green-600">
                          {catalog.imageGroupCount}
                        </div>
                        <div className="text-xs text-gray-600">Image Groups</div>
                      </div>
                    </div>
                    
                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg group-hover:from-blue-700 group-hover:to-indigo-700 transition flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-400">
                    <p className="text-sm">Data not available</p>
                    <p className="text-xs mt-1">Check data generation</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🎨 Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl mb-2">🏷️</div>
              <h3 className="font-bold text-gray-900 mb-1">SKU Grouping</h3>
              <p className="text-sm text-gray-600">Products grouped by shared images</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-bold text-gray-900 mb-1">Icon Display</h3>
              <p className="text-sm text-gray-600">100+ property icons for clarity</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-bold text-gray-900 mb-1">Smart Categories</h3>
              <p className="text-sm text-gray-600">Auto-categorized properties</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📄</div>
              <h3 className="font-bold text-gray-900 mb-1">PDF Integration</h3>
              <p className="text-sm text-gray-600">Direct links to source</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
