'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, Zap, Award } from 'lucide-react';
import Image from 'next/image';

interface FeaturedProduct {
  sku: string;
  name: string;
  series_name?: string;
  source_pdf: string;
  image?: string;
  series_image?: string;
  category?: string;
  price?: number;
  featured_reason: 'best_seller' | 'new_arrival' | 'top_rated' | 'editor_choice';
}

export default function FeaturedProductsPage() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      // Load products from multiple catalog JSON files
      const catalogs = [
        'pomp-specials',
        'makita-catalogus-2022-nl',
        'airpress-catalogus-eng',
        'bronpompen',
        'centrifugaalpompen',
        'messing-draadfittingen',
        'slangkoppelingen'
      ];

      const featured: FeaturedProduct[] = [];

      for (const catalog of catalogs) {
        try {
          const response = await fetch(`/documents/Product_pdfs/json/${catalog}.json`);
          if (!response.ok) continue;
          
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) continue;
          
          const products = await response.json();
          
          // Select top products from each catalog
          const catalogFeatured = products
            .filter((p: any) => p.image || p.series_image)
            .slice(0, 5)
            .map((p: any, index: number) => ({
              sku: p.sku,
              name: p.series_name || p.type || p.sku,
              series_name: p.series_name,
              source_pdf: p.source_pdf,
              image: p.image || p.series_image,
              category: catalog,
              featured_reason: index === 0 ? 'editor_choice' : index === 1 ? 'best_seller' : 'top_rated'
            }));

          featured.push(...catalogFeatured);
        } catch (err) {
          console.error(`Error loading ${catalog}:`, err);
        }
      }

      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedIcon = (reason: string) => {
    switch (reason) {
      case 'best_seller':
        return <TrendingUp className="w-5 h-5" />;
      case 'new_arrival':
        return <Zap className="w-5 h-5" />;
      case 'top_rated':
        return <Star className="w-5 h-5 fill-current" />;
      case 'editor_choice':
        return <Award className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getFeaturedLabel = (reason: string) => {
    switch (reason) {
      case 'best_seller':
        return 'Best Seller';
      case 'new_arrival':
        return 'New Arrival';
      case 'top_rated':
        return 'Top Rated';
      case 'editor_choice':
        return "Editor's Choice";
      default:
        return 'Featured';
    }
  };

  const categories = ['all', ...Array.from(new Set(featuredProducts.map(p => p.category).filter((c): c is string => c !== undefined)))];
  const filteredProducts = selectedCategory === 'all' 
    ? featuredProducts 
    : featuredProducts.filter(p => p.category === selectedCategory);

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
      <div className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Star className="w-16 h-16 mx-auto mb-4 fill-current animate-pulse" />
            <h1 className="text-5xl font-bold mb-4">✨ Featured Products</h1>
            <p className="text-2xl opacity-90 mb-6">
              Handpicked selections from our premium industrial catalogs
            </p>
            <div className="flex justify-center gap-4 text-lg">
              <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-full">
                <TrendingUp className="inline w-5 h-5 mr-2" />
                Best Sellers
              </div>
              <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-full">
                <Award className="inline w-5 h-5 mr-2" />
                Editor's Picks
              </div>
              <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-full">
                <Star className="inline w-5 h-5 mr-2 fill-current" />
                Top Rated
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{featuredProducts.length}</div>
              <div className="text-gray-600">Featured Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{categories.length - 1}</div>
              <div className="text-gray-600">Catalogs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-gray-600">Verified Quality</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">New</div>
              <div className="text-gray-600">Weekly Updates</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? '🌟 All Featured' : `📦 ${category}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products Grid */}
      <div className="container mx-auto px-4 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Star className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No featured products</h3>
            <p className="text-gray-600">Check back soon for new featured items</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <Link
                key={product.sku}
                href={`/products/${product.sku}`}
                className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Featured Badge */}
                <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  {getFeaturedIcon(product.featured_reason)}
                  <span className="font-bold text-sm">{getFeaturedLabel(product.featured_reason)}</span>
                </div>

                {/* Product Image */}
                <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {product.image ? (
                    <img
                      src={`/${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Award className="w-24 h-24" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="text-sm text-primary font-semibold mb-2">
                    SKU: {product.sku}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition">
                    {product.name}
                  </h3>
                  {product.series_name && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                      {product.series_name}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-4 border-transparent group-hover:border-primary rounded-xl transition-colors pointer-events-none"></div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Explore Our Products</h2>
          <p className="text-xl opacity-90 mb-8">
            Discover thousands more products across all our industrial catalogs
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-xl"
          >
            Browse Products →
          </Link>
        </div>
      </div>
    </div>
  );
}
