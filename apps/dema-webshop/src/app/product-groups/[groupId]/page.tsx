'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductGroupWithVariants from '@/components/products/ProductGroupWithVariants';
import Link from 'next/link';
import Head from 'next/head';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import RecentlyViewed from '@/components/RecentlyViewed';
import ProductRecommendations from '@/components/ProductRecommendations';
import { ProductDetailSkeleton } from '@/components/ui/ProductCardSkeleton';

// JSON-LD structured data for product
function ProductStructuredData({ productGroup }: { productGroup: any }) {
  if (!productGroup) return null;
  
  const mainImage = productGroup.media?.find((m: any) => m.role === 'main')?.url;
  const imageUrl = mainImage ? `https://dema-final-new.vercel.app/api/${mainImage}` : undefined;
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productGroup.name,
    description: `${productGroup.name} - ${productGroup.variant_count || 1} variants available. Professional quality from DEMA Shop.`,
    brand: {
      '@type': 'Brand',
      name: productGroup.brand || 'DEMA',
    },
    category: productGroup.catalog || productGroup.category,
    ...(imageUrl && { image: imageUrl }),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      offerCount: productGroup.variant_count || 1,
      seller: {
        '@type': 'Organization',
        name: 'DEMA Shop',
        url: 'https://dema-final-new.vercel.app',
      },
    },
    ...(productGroup.variants && productGroup.variants.length > 0 && {
      hasVariant: productGroup.variants.slice(0, 10).map((v: any) => ({
        '@type': 'Product',
        name: v.label || v.sku,
        sku: v.sku,
      })),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// All available catalog files
const CATALOG_FILES = [
  'abs_persluchtbuizen',
  'airpress_catalogus_eng',
  'airpress_catalogus_nl_fr',
  'bronpompen',
  'catalogus_aandrijftechniek_150922',
  'centrifugaalpompen',
  'digitale_versie_pompentoebehoren_compressed',
  'dompelpompen',
  'drukbuizen',
  'kranzle_catalogus_2021_nl_1',
  'kunststof_afvoerleidingen',
  'makita_catalogus_2022_nl',
  'makita_tuinfolder_2022_nl',
  'messing_draadfittingen',
  'pe_buizen',
  'plat_oprolbare_slangen',
  'pomp_specials',
  'pu_afzuigslangen',
  'rubber_slangen',
  'rvs_draadfittingen',
  'slangklemmen',
  'slangkoppelingen',
  'verzinkte_buizen',
  'zuigerpompen',
  'zwarte_draad_en_lasfittingen',
];

export default function ProductGroupPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [productGroup, setProductGroup] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    const groupId = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId;
    const catalogParam = searchParams.get('catalog');
    
    if (!groupId) {
      setError('No product group ID provided');
      setLoading(false);
      return;
    }

    const fetchProductGroup = async () => {
      try {
        setLoading(true);
        
        // Strategy 1: If catalog is provided in URL, load that specific file
        if (catalogParam) {
          const res = await fetch(`/data/${catalogParam}_grouped.json`);
          if (res.ok) {
            const groups = await res.json();
            const group = groups.find((g: any) => g.group_id === groupId);
            if (group) {
              setProductGroup(group);
              trackRecentlyViewed(group);
              return;
            }
          }
        }
        
        // Strategy 2: Try to extract catalog from group_id (e.g., "bronpompen-images-...")
        const possibleCatalog = groupId.split('-')[0];
        if (CATALOG_FILES.includes(possibleCatalog)) {
          const res = await fetch(`/data/${possibleCatalog}_grouped.json`);
          if (res.ok) {
            const groups = await res.json();
            const group = groups.find((g: any) => g.group_id === groupId);
            if (group) {
              setProductGroup(group);
              trackRecentlyViewed(group);
              return;
            }
          }
        }
        
        // Strategy 3: Search through all catalog files
        for (const catalog of CATALOG_FILES) {
          try {
            const res = await fetch(`/data/${catalog}_grouped.json`);
            if (!res.ok) continue;
            
            const groups = await res.json();
            const group = groups.find((g: any) => g.group_id === groupId);
            
            if (group) {
              setProductGroup(group);
              trackRecentlyViewed(group);
              return;
            }
          } catch {
            // Continue to next catalog
          }
        }
        
        // Not found in any catalog
        setError('Product group not found');
        setProductGroup(null);
      } catch (err) {
        console.error('Error fetching product group:', err);
        setError('Failed to load product group');
      } finally {
        setLoading(false);
      }
    };
    
    const trackRecentlyViewed = (group: any) => {
      let mainImage = group.images?.[0] || group.media?.find((m: any) => m.role === 'main')?.url;
      
      // Ensure imageUrl is a valid path (starts with / or http)
      if (mainImage && !mainImage.startsWith('/') && !mainImage.startsWith('http')) {
        mainImage = `/images/${mainImage}`;
      }
      
      addToRecentlyViewed({
        group_id: group.group_id,
        name: group.name,
        imageUrl: mainImage || null,
        catalog: group.catalog || '',
        variant_count: group.variant_count || group.variants?.length || 1
      });
    };

    fetchProductGroup();
  }, [params.groupId, searchParams, addToRecentlyViewed]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !productGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Product Group Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The product group you are looking for does not exist.'}</p>
          <Link 
            href="/products"
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* SEO Structured Data */}
      <ProductStructuredData productGroup={productGroup} />
      
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link href="/products" className="hover:text-primary transition-colors">
                Products
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="font-semibold text-gray-900">{productGroup.name}</li>
          </ol>
        </nav>

        {/* Product Group Component */}
        <ProductGroupWithVariants 
          productGroup={productGroup}
          onAddToQuote={(sku) => {
            console.log('Added to quote:', sku);
          }}
        />

        {/* Product Recommendations */}
        <ProductRecommendations
          currentProductId={productGroup.group_id}
          catalog={productGroup.catalog}
          title="Related Products"
        />

        {/* Back to Catalog Button */}
        <div className="mt-8 text-center">
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-primary hover:text-primary transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
      
      {/* Recently Viewed Section */}
      <RecentlyViewed />
    </div>
  );
}
