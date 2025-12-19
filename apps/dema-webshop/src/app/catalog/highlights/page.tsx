'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Package, TrendingUp, Zap, Download } from 'lucide-react';

interface CatalogHighlight {
  id: string;
  name: string;
  displayName: string;
  description: string;
  pdfFile: string;
  jsonFile: string;
  category: 'pumps' | 'fittings' | 'hoses' | 'tools' | 'tubes' | 'accessories';
  productCount: number;
  featured: boolean;
  icon: string;
  color: string;
}

export default function CatalogHighlightsPage() {
  const [catalogs, setCatalogs] = useState<CatalogHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadCatalogHighlights();
  }, []);

  const loadCatalogHighlights = () => {
    const catalogsData: CatalogHighlight[] = [
      {
        id: 'pomp-specials',
        name: 'pomp-specials',
        displayName: 'Pomp Specials',
        description: 'Specialized pumps for household, agriculture, and industrial applications',
        pdfFile: 'pomp-specials.pdf',
        jsonFile: 'pomp-specials.json',
        category: 'pumps',
        productCount: 0,
        featured: true,
        icon: '💧',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        id: 'centrifugaalpompen',
        name: 'centrifugaalpompen',
        displayName: 'Centrifugaalpompen',
        description: 'Centrifugal pumps for various industrial and residential applications',
        pdfFile: 'centrifugaalpompen.pdf',
        jsonFile: 'centrifugaalpompen.json',
        category: 'pumps',
        productCount: 0,
        featured: true,
        icon: '🌊',
        color: 'from-blue-600 to-indigo-600'
      },
      {
        id: 'dompelpompen',
        name: 'dompelpompen',
        displayName: 'Dompelpompen',
        description: 'Submersible pumps for deep water applications',
        pdfFile: 'dompelpompen.pdf',
        jsonFile: 'dompelpompen.json',
        category: 'pumps',
        productCount: 0,
        featured: true,
        icon: '⚓',
        color: 'from-blue-700 to-blue-900'
      },
      {
        id: 'bronpompen',
        name: 'bronpompen',
        displayName: 'Bronpompen',
        description: 'Well pumps and fountain pumps for water extraction',
        pdfFile: 'bronpompen.pdf',
        jsonFile: 'bronpompen.json',
        category: 'pumps',
        productCount: 0,
        featured: true,
        icon: '🚰',
        color: 'from-cyan-500 to-teal-500'
      },
      {
        id: 'zuigerpompen',
        name: 'zuigerpompen',
        displayName: 'Zuigerpompen',
        description: 'Piston pumps for high-pressure applications',
        pdfFile: 'zuigerpompen.pdf',
        jsonFile: 'zuigerpompen.json',
        category: 'pumps',
        productCount: 0,
        featured: false,
        icon: '🔩',
        color: 'from-gray-500 to-gray-700'
      },
      {
        id: 'messing-draadfittingen',
        name: 'messing-draadfittingen',
        displayName: 'Messing Draadfittingen',
        description: 'Brass threaded fittings for professional installations',
        pdfFile: 'messing-draadfittingen.pdf',
        jsonFile: 'messing-draadfittingen.json',
        category: 'fittings',
        productCount: 0,
        featured: true,
        icon: '🔧',
        color: 'from-yellow-600 to-orange-600'
      },
      {
        id: 'rvs-draadfittingen',
        name: 'rvs-draadfittingen',
        displayName: 'RVS Draadfittingen',
        description: 'Stainless steel threaded fittings for corrosion resistance',
        pdfFile: 'rvs-draadfittingen.pdf',
        jsonFile: 'rvs-draadfittingen.json',
        category: 'fittings',
        productCount: 0,
        featured: true,
        icon: '⚙️',
        color: 'from-gray-400 to-gray-600'
      },
      {
        id: 'zwarte-draad-en-lasfittingen',
        name: 'zwarte-draad-en-lasfittingen',
        displayName: 'Zwarte Draad en Lasfittingen',
        description: 'Black threaded and welding fittings',
        pdfFile: 'zwarte-draad-en-lasfittingen.pdf',
        jsonFile: 'zwarte-draad-en-lasfittingen.json',
        category: 'fittings',
        productCount: 0,
        featured: false,
        icon: '🛠️',
        color: 'from-gray-700 to-black'
      },
      {
        id: 'slangkoppelingen',
        name: 'slangkoppelingen',
        displayName: 'Slangkoppelingen',
        description: 'Hose couplings and connectors for all applications',
        pdfFile: 'slangkoppelingen.pdf',
        jsonFile: 'slangkoppelingen.json',
        category: 'hoses',
        productCount: 0,
        featured: true,
        icon: '🔗',
        color: 'from-purple-500 to-pink-500'
      },
      {
        id: 'slangklemmen',
        name: 'slangklemmen',
        displayName: 'Slangklemmen',
        description: 'Hose clamps for secure connections',
        pdfFile: 'slangklemmen.pdf',
        jsonFile: 'slangklemmen.json',
        category: 'hoses',
        productCount: 0,
        featured: false,
        icon: '📎',
        color: 'from-red-500 to-orange-500'
      },
      {
        id: 'rubber-slangen',
        name: 'rubber-slangen',
        displayName: 'Rubber Slangen',
        description: 'Rubber hoses for flexible connections',
        pdfFile: 'rubber-slangen.pdf',
        jsonFile: 'rubber-slangen.json',
        category: 'hoses',
        productCount: 0,
        featured: true,
        icon: '🌀',
        color: 'from-green-600 to-teal-600'
      },
      {
        id: 'plat-oprolbare-slangen',
        name: 'plat-oprolbare-slangen',
        displayName: 'Plat Oprolbare Slangen',
        description: 'Flat roll-up hoses for easy storage',
        pdfFile: 'plat-oprolbare-slangen.pdf',
        jsonFile: 'plat-oprolbare-slangen.json',
        category: 'hoses',
        productCount: 0,
        featured: false,
        icon: '📜',
        color: 'from-lime-500 to-green-500'
      },
      {
        id: 'pu-afzuigslangen',
        name: 'pu-afzuigslangen',
        displayName: 'PU Afzuigslangen',
        description: 'Polyurethane extraction hoses',
        pdfFile: 'pu-afzuigslangen.pdf',
        jsonFile: 'pu-afzuigslangen.json',
        category: 'hoses',
        productCount: 0,
        featured: false,
        icon: '💨',
        color: 'from-sky-500 to-blue-500'
      },
      {
        id: 'abs-persluchtbuizen',
        name: 'abs-persluchtbuizen',
        displayName: 'ABS Persluchtbuizen',
        description: 'ABS compressed air pipes and systems',
        pdfFile: 'abs-persluchtbuizen.pdf',
        jsonFile: 'abs-persluchtbuizen.json',
        category: 'tubes',
        productCount: 0,
        featured: true,
        icon: '🎯',
        color: 'from-indigo-500 to-purple-500'
      },
      {
        id: 'pe-buizen',
        name: 'pe-buizen',
        displayName: 'PE Buizen',
        description: 'Polyethylene pipes for various applications',
        pdfFile: 'pe-buizen.pdf',
        jsonFile: 'pe-buizen.json',
        category: 'tubes',
        productCount: 0,
        featured: true,
        icon: '🧪',
        color: 'from-teal-500 to-cyan-500'
      },
      {
        id: 'drukbuizen',
        name: 'drukbuizen',
        displayName: 'Drukbuizen',
        description: 'Pressure pipes for high-pressure systems',
        pdfFile: 'drukbuizen.pdf',
        jsonFile: 'drukbuizen.json',
        category: 'tubes',
        productCount: 0,
        featured: true,
        icon: '💪',
        color: 'from-red-600 to-pink-600'
      },
      {
        id: 'verzinkte-buizen',
        name: 'verzinkte-buizen',
        displayName: 'Verzinkte Buizen',
        description: 'Galvanized pipes for durable installations',
        pdfFile: 'verzinkte-buizen.pdf',
        jsonFile: 'verzinkte-buizen.json',
        category: 'tubes',
        productCount: 0,
        featured: false,
        icon: '🔩',
        color: 'from-slate-500 to-zinc-600'
      },
      {
        id: 'kunststof-afvoerleidingen',
        name: 'kunststof-afvoerleidingen',
        displayName: 'Kunststof Afvoerleidingen',
        description: 'Plastic drainage pipes',
        pdfFile: 'kunststof-afvoerleidingen.pdf',
        jsonFile: 'kunststof-afvoerleidingen.json',
        category: 'tubes',
        productCount: 0,
        featured: false,
        icon: '🚿',
        color: 'from-emerald-500 to-teal-500'
      },
      {
        id: 'makita-catalogus-2022-nl',
        name: 'makita-catalogus-2022-nl',
        displayName: 'Makita Catalog 2022',
        description: 'Professional power tools and equipment from Makita',
        pdfFile: 'makita-catalogus-2022-nl.pdf',
        jsonFile: 'makita-catalogus-2022-nl.json',
        category: 'tools',
        productCount: 0,
        featured: true,
        icon: '🔨',
        color: 'from-sky-600 to-blue-700'
      },
      {
        id: 'makita-tuinfolder-2022-nl',
        name: 'makita-tuinfolder-2022-nl',
        displayName: 'Makita Garden Tools 2022',
        description: 'Makita garden and outdoor power tools',
        pdfFile: 'makita-tuinfolder-2022-nl.pdf',
        jsonFile: 'makita-tuinfolder-2022-nl.json',
        category: 'tools',
        productCount: 0,
        featured: false,
        icon: '🌱',
        color: 'from-green-500 to-emerald-600'
      },
      {
        id: 'airpress-catalogus-eng',
        name: 'airpress-catalogus-eng',
        displayName: 'Airpress Catalog (EN)',
        description: 'Compressed air equipment and accessories',
        pdfFile: 'airpress-catalogus-eng.pdf',
        jsonFile: 'airpress-catalogus-eng.json',
        category: 'tools',
        productCount: 0,
        featured: true,
        icon: '🌪️',
        color: 'from-blue-500 to-indigo-600'
      },
      {
        id: 'airpress-catalogus-nl-fr',
        name: 'airpress-catalogus-nl-fr',
        displayName: 'Airpress Catalog (NL/FR)',
        description: 'Compressed air equipment (Dutch/French)',
        pdfFile: 'airpress-catalogus-nl-fr.pdf',
        jsonFile: 'airpress-catalogus-nl-fr.json',
        category: 'tools',
        productCount: 0,
        featured: false,
        icon: '💨',
        color: 'from-sky-500 to-blue-600'
      },
      {
        id: 'kranzle-catalogus-2021-nl-1',
        name: 'kranzle-catalogus-2021-nl-1',
        displayName: 'Kränzle Catalog 2021',
        description: 'High-pressure cleaning equipment',
        pdfFile: 'kranzle-catalogus-2021-nl-1.pdf',
        jsonFile: 'kranzle-catalogus-2021-nl-1.json',
        category: 'tools',
        productCount: 0,
        featured: true,
        icon: '🚿',
        color: 'from-yellow-500 to-red-500'
      },
      {
        id: 'catalogus-aandrijftechniek-150922',
        name: 'catalogus-aandrijftechniek-150922',
        displayName: 'Aandrijftechniek Catalog',
        description: 'Drive technology and power transmission components',
        pdfFile: 'catalogus-aandrijftechniek-150922.pdf',
        jsonFile: 'catalogus-aandrijftechniek-150922.json',
        category: 'accessories',
        productCount: 0,
        featured: true,
        icon: '⚙️',
        color: 'from-orange-500 to-red-600'
      },
      {
        id: 'digitale-versie-pompentoebehoren-compressed',
        name: 'digitale-versie-pompentoebehoren-compressed',
        displayName: 'Pompen Toebehoren',
        description: 'Pump accessories and spare parts',
        pdfFile: 'digitale-versie-pompentoebehoren-compressed.pdf',
        jsonFile: 'digitale-versie-pompentoebehoren-compressed.json',
        category: 'accessories',
        productCount: 0,
        featured: true,
        icon: '🔧',
        color: 'from-violet-500 to-purple-600'
      }
    ];

    setCatalogs(catalogsData);
    setLoading(false);
  };

  const categories = [
    { id: 'all', name: 'All Catalogs', icon: '📚' },
    { id: 'pumps', name: 'Pumps', icon: '💧' },
    { id: 'fittings', name: 'Fittings', icon: '🔧' },
    { id: 'hoses', name: 'Hoses', icon: '🔗' },
    { id: 'tubes', name: 'Tubes & Pipes', icon: '🎯' },
    { id: 'tools', name: 'Tools', icon: '🔨' },
    { id: 'accessories', name: 'Accessories', icon: '⚙️' }
  ];

  const filteredCatalogs = selectedCategory === 'all'
    ? catalogs
    : catalogs.filter(c => c.category === selectedCategory);

  const featuredCatalogs = catalogs.filter(c => c.featured);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Package className="w-20 h-20 mx-auto mb-6 animate-bounce" />
            <h1 className="text-6xl font-bold mb-6">📦 Catalog Highlights</h1>
            <p className="text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
              Explore our comprehensive collection of industrial catalogs featuring pumps, fittings, hoses, tools, and more
            </p>
            <div className="flex justify-center gap-6 text-lg flex-wrap">
              <div className="bg-white/20 backdrop-blur px-8 py-4 rounded-full font-semibold">
                <FileText className="inline w-6 h-6 mr-2" />
                {catalogs.length} Catalogs
              </div>
              <div className="bg-white/20 backdrop-blur px-8 py-4 rounded-full font-semibold">
                <TrendingUp className="inline w-6 h-6 mr-2" />
                {featuredCatalogs.length} Featured
              </div>
              <div className="bg-white/20 backdrop-blur px-8 py-4 rounded-full font-semibold">
                <Zap className="inline w-6 h-6 mr-2" />
                12,000+ Products
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full whitespace-nowrap font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-xl scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Section */}
      {selectedCategory === 'all' && featuredCatalogs.length > 0 && (
        <div className="bg-gradient-to-b from-yellow-50 to-white py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 mb-8">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
              <h2 className="text-3xl font-bold text-gray-900">⭐ Featured Catalogs</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCatalogs.map(catalog => (
                <Link
                  key={catalog.id}
                  href={`/products?catalog=${catalog.name}`}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-yellow-400"
                >
                  <div className={`bg-gradient-to-r ${catalog.color} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 text-8xl opacity-10 transform translate-x-4 -translate-y-4">
                      {catalog.icon}
                    </div>
                    <div className="relative z-10">
                      <div className="text-5xl mb-3">{catalog.icon}</div>
                      <h3 className="text-2xl font-bold mb-2">{catalog.displayName}</h3>
                      <div className="flex items-center gap-2 text-white/90">
                        <Package className="w-4 h-4" />
                        <span className="text-sm">Premium Catalog</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 mb-4 line-clamp-2">{catalog.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {catalog.category}
                      </span>
                      <span className="text-primary font-semibold group-hover:translate-x-2 transition-transform">
                        View Catalog →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Catalogs Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {selectedCategory === 'all' ? '📚 All Catalogs' : `${categories.find(c => c.id === selectedCategory)?.icon} ${categories.find(c => c.id === selectedCategory)?.name}`}
        </h2>

        {filteredCatalogs.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No catalogs found</h3>
            <p className="text-gray-600">Try selecting a different category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCatalogs.map(catalog => (
              <Link
                key={catalog.id}
                href={`/products?catalog=${catalog.name}`}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-r ${catalog.color} p-6 text-white relative`}>
                  <div className="text-6xl mb-2">{catalog.icon}</div>
                  <h3 className="text-xl font-bold">{catalog.displayName}</h3>
                </div>
                <div className="p-5">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{catalog.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {catalog.category}
                    </span>
                    {catalog.featured && (
                      <span className="text-yellow-600 font-semibold">★ Featured</span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary transition text-sm">
                      View Products
                    </button>
                    <a
                      href={`/documents/Product_pdfs/${catalog.pdfFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <FileText className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Need Help Finding Products?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Our team is ready to assist you with product selection and technical specifications
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contact"
              className="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-xl"
            >
              Contact Us
            </Link>
            <Link
              href="/products/featured"
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition shadow-xl"
            >
              ⭐ View Featured Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
